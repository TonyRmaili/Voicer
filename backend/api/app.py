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
from api.schemas.schemas import Chat
import openai

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