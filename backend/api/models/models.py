from firebase_admin import firestore

# Initialize Firestore client
db = firestore.client()

def save_conversation(user_message: str, assistant_response: str):
    conversation_ref = db.collection('conversations').document()
    conversation_ref.set({
        'user_message': user_message,
        'assistant_response': assistant_response,
    })

def get_conversation(conversation_id: str):
    conversation_ref = db.collection('conversations').document(conversation_id)
    return conversation_ref.get()
