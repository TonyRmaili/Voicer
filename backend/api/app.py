from fastapi import FastAPI, HTTPException, Depends, status,Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated
from fastapi import Query
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from dotenv import load_dotenv
import os
import sys
import json
from fastapi.responses import JSONResponse
from LLM_text.LLM_texter import LLMTexter
from api.schemas.schemas import Chat, CustomAssistant
from scan_assistants import scan
from create_custom_assistant import create_assistant
# uvicorn app.main:app --reload

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

@app.post("/prompt", tags=["chat"])
def post_prompt(chat: Chat):
    texter = LLMTexter(role=chat.role, user=chat.user)
    response = texter.conversation(prompt=chat.prompt)
    return response



@app.post("/custom_assistant", tags=["Custom"])
def create_custom_assistant(custom_assistant: CustomAssistant):
    assistants = create_assistant(name=custom_assistant.name,
                                  prompt=custom_assistant.prompt,
                                  voice=custom_assistant.voice)
    
    
    print(assistants)
    return assistants


@app.get("/scan_assistants", tags=["Assistants"])
def scan_assistants():
    store = scan()
    return store