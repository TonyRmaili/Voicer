// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);

export const saveConversationToFirestore = async (userId, conversation) => {
  try {
    const docRef = await addDoc(collection(firestore, 'conversations'), {
      userId: userId,
      conversation: conversation,
      timestamp: serverTimestamp(),
    });
    console.log('Document written with ID: ', docRef.id);
    alert('Conversation saved successfully!');
  } catch (e) {
    console.error('Error adding document: ', e);
    alert('Failed to save conversation. Please try again.');
  }
};
