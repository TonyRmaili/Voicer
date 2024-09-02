from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize the FastAPI app
app = FastAPI()

# Set up your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


# Define a request model
class ChatRequest(BaseModel):
    message: str

# Define a response model
class ChatResponse(BaseModel):
    response: str

# Create an endpoint to handle chat requests

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Send a request to the OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4",  # or use "gpt-3.5-turbo" or another available model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": request.message},
            ]
        )

        # Extract the assistant's response
        assistant_response = response['choices'][0]['message']['content']

        # Return the response
        return ChatResponse(response=assistant_response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
