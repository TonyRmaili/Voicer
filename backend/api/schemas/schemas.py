from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str


class Chat(BaseModel):
    role: str
    prompt: str
    user : str


class CustomAssistant(BaseModel):
    name: str
    prompt: str
    voice: str