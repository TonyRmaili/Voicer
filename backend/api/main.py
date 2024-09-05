from fastapi import FastAPI, HTTPException
import openai
import firebase_admin
from firebase_admin import firestore, credentials
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

# Firebase initialization
cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Function to get persona-specific prompt
def get_persona_prompt(persona: str) -> str:
    prompts = {
        "teacher": """
        You are a teacher. Only provide responses related to teaching, education, or learning. 
        If the user asks something unrelated, respond with: 'I can only discuss education-related topics.'
        """,
        "mentor": """
        You are a mentor. Provide advice, encouragement, and guidance. 
        If the user asks about unrelated topics, respond with: 'I can only provide mentoring and guidance.'
        """
    }

    # Return the prompt for the selected persona, or a default prompt if not found
    return prompts.get(persona, "You are a helpful assistant. Please assist the user with their queries.")

@app.post("/full-process")
async def full_process(request: dict):
    try:
        transcript = request['transcript']
        persona_prompt = request['personaPrompt']
        selected_persona = request['selectedPersona']

        # Keywords to guide the conversation
        teaching_keywords = ["teach", "school", "education", "learn"]
        advice_keywords = ["advice", "guidance", "encouragement", "help"]

        if selected_persona == "teacher" and not any(keyword in transcript.lower() for keyword in teaching_keywords):
            return {"response": "I'm here to discuss teaching topics. Please ask me something related to education."}

        if selected_persona == "mentor" and not any(keyword in transcript.lower() for keyword in advice_keywords):
            return {"response": "As your mentor, I offer advice and encouragement. Let's stick to that."}

        # Generate a response using GPT-4 with the persona-specific prompt and conversation context
        gpt_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": persona_prompt}  # Use the provided persona prompt here
            ] + [{"role": "user", "content": transcript}],
            max_tokens=100,
            temperature=0.5
        )

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
