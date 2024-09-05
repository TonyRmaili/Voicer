from fastapi import FastAPI, HTTPException, UploadFile, File, Query
import openai
import firebase_admin
from firebase_admin import firestore, credentials
import os
from dotenv import load_dotenv
import io
from starlette.responses import StreamingResponse

load_dotenv()

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

# Firebase initialization
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Function to get persona-specific prompt
def get_persona_prompt(persona: str) -> str:
    if persona == "teacher":
        return """
        You are a strict teacher. Only provide responses about education, teaching methods, or learning. 
        Refuse to answer any other questions by saying: 'I can only discuss teaching-related topics.'
        """
    elif persona == "mentor":
        return """
        You are a wise mentor. Offer advice, encouragement, and guidance.
        If asked about unrelated topics, politely say: 'I only provide mentoring and advice.'
        """
    else:
        return "You are a general assistant. Help the user with any query they may have."

@app.post("/full-process")
async def full_process(request: dict):
    try:
        transcript = request['transcript']
        selected_persona = request['selectedPersona']

        # Fetch the persona-specific prompt
        persona_prompt = get_persona_prompt(selected_persona)

        # System message construction
        system_message = f"""
        You are playing the role of {selected_persona}. 
        Follow this prompt strictly:
        {persona_prompt}.
        Only respond within the context of this role.
        """


        # Debug: Log the request and system message for verification
        print(f"System Message: {system_message}")
        print(f"Transcript: {transcript}")

        # Generate a response using GPT-4 with the persona-specific prompt
        gpt_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},  # System message defining the persona
                {"role": "user", "content": transcript}  # User's input
            ],
            max_tokens=150,
            temperature=0.5
        )

        # Log the raw response from GPT-4 for debugging
        print(f"GPT-4 Response: {gpt_response}")

        # Extract and return the response
        generated_response = gpt_response["choices"][0]["message"]["content"].strip()
        return {"response": generated_response}

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
        
        audio_stream = io.BytesIO(tts_response["audio"])
        return StreamingResponse(audio_stream, media_type="audio/mpeg")

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
