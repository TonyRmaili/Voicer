
import openai

openai.api_key = 'your-openai-api-key-here'

def generate_response(chat_request: ChatRequest) -> ChatResponse:
    # Send a request to the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-4",  # or use "gpt-3.5-turbo"
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": chat_request.message},
        ]
    )

    assistant_response = response['choices'][0]['message']['content']

    # Save the conversation to Firestore
    save_conversation(chat_request.message, assistant_response)

    return ChatResponse(response=assistant_response)
