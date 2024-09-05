from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str


class Chat(BaseModel):
    role: str
    prompt: str