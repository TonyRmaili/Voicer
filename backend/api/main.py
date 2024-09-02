import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from api.schemas.schemas import ChatRequest, ChatResponse
from api.models.models import save_conversation
import openai
import firebase_admin
from dotenv import load_dotenv
from firebase_admin import firestore, credentials
import uuid
import io

load_dotenv()

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)

db = firestore.client()


@app.post("/full-process")
async def full_process(file: UploadFile = File(...), user_id: str = Query(...)):
    try:
        audio_file = await file.read()

        transcription_response = openai.audio.transcribe("whisper", file=audio_file)

        if "text" not in transcription_response:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio or no text found.")
        
        transcription = transcription_response["text"]

        gpt_response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": transcription}
            ],
            max_tokens=150,
            temperature=0.7
        )

        if not gpt_response or "choices" not in gpt_response or not gpt_response["choices"]:
            raise HTTPException(status_code=400, detail="Failed to generate response.")
        
        generated_response = gpt_response["choices"][0]["text"].strip()

        doc_ref = db.collection("conversations").document(user_id).collection("conversation").add({
            "transcription": transcription,
            "response": generated_response
        })

        tts_response = openai.audio.speech.create(
            model="tts-1",
            input=generated_response,
            voice="nova"
        )

        if not tts_response or "audio" not in tts_response:
            raise HTTPException(status_code=500, detail="Text-to-speech conversion failed.")
        
        # If one wants to save the audio file, uncomment the following line
        # audio_file = f"{uuid.uuid4()}.mp3"
        # with open(audio_file, "wb") as audio_file:
        #     audio_file.write(tts_response["audio"]
        #                      )

        audio_stream = io.BytesIO(tts_response["audio"])
        return {StreamingResponse(audio_stream, media_type="audio/mpeg")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/speech-to-text")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        audio_file = await file.read()

        response = openai.audio.transcriptions.create("whisper", file=audio_file)

        if "text" not in response:
            raise HTTPException(status_code=400, detail="Failed to transcribe audio or no text found.")
        
        transcription = response["text"]

        return {"transcription": transcription}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-response")
async def generate_response(text: str):
    try:
        gpt_response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": text}
            ],
            max_tokens=150,
            temperature=0.7
            )
        
        if not gpt_response or "choices" not in gpt_response or not gpt_response["choices"]:
            raise HTTPException(status_code=400, detail="Failed to generate response.")
        
        generated_response = gpt_response["choices"][0]["text"].strip()
        return {"response": generated_response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/text-to-speech")
async def text_to_speech(text: str):
    try:
        tts_response = openai.audio.speech.create(
            model="tts-1",
            input=text,
            voice="nova"
        )

        if not tts_response or "audio" not in tts_response:
            raise HTTPException(status_code=500, detail="Text-to-speech conversion failed.")
        

        # If one wants to save the audio file, uncomment the following lines
        # audio_file = f"{uuid.uuid4()}.mp3"
        # with open(audio_file, "wb") as audio_file:
        #     audio_file.write(tts_response["audio"]
        #                      )
        # return {"audio": f"/download_audio/{audio_file}"}

        audio_stream = io.BytesIO(tts_response["audio"])
        return {StreamingResponse(audio_stream, media_type="audio/mpeg")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/conversation-history")
async def conversation_history(user_id: str = Query(...)):
    try:
        conversations_ref = db.collection("users").document(user_id).collection("conversations")
        conversations = conversations_ref.stream()

        history = []
        for conversation in conversations:
            history.append(conversation.to_dict())

        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Create an endpoint to handle chat requests
# @app.post("/chat", response_model=ChatResponse)
# async def chat(request: ChatRequest):
#     try:
#         # Generate response using OpenAI API
#         response = openai.chat.completions.create(
#             model="gpt-4",  # or use "gpt-3.5-turbo"
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant."},
#                 {"role": "user", "content": request.message},
#             ]
#         )

#         assistant_response = response['choices'][0]['message']['content']

#         # Save the conversation to Firestore
#         save_conversation(db, request.message, assistant_response)

#         return ChatResponse(response=assistant_response)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # Additional routes and logic can be added here