from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import os
from api.models.models import save_conversation
from api.schemas.schemas import ChatRequest, ChatResponse
import firebase_admin
from firebase_admin import firestore, credentials

load_dotenv()

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

cred = credentials.Certificate("service-account.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Create an endpoint to handle chat requests
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Generate response using OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",  # or use "gpt-3.5-turbo"
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": request.message},
            ]
        )

        assistant_response = response['choices'][0]['message']['content']

        # Save the conversation to Firestore
        save_conversation(request.message, assistant_response)

        return ChatResponse(response=assistant_response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Additional routes and logic can be added here