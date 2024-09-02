import { collection, addDoc, getDocs, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';

// Function to save a conversation to Firestore
export const saveConversationToFirestore = async (userId, conversation) => {
  try {
    const conversationRef = await addDoc(collection(firestore, 'conversations'), {
      userId: userId,
      timestamp: serverTimestamp(), // Use Firestore server timestamp
      data: conversation,
    });
    console.log("Conversation saved successfully with ID:", conversationRef.id);
    return conversationRef.id;
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
};

// Function to load all conversations for a specific user from Firestore
export const loadConversationsForUser = async (userId) => {
  try {
    const conversationsRef = collection(firestore, 'conversations');
    const querySnapshot = await getDocs(conversationsRef);
    const conversations = [];

    querySnapshot.forEach((doc) => {
      const conversationData = doc.data();
      if (conversationData.userId === userId) {
        conversations.push({
          id: doc.id,
          timestamp: conversationData.timestamp,
          data: conversationData.data,
        });
      }
    });

    return conversations;
  } catch (error) {
    console.error("Error loading conversations:", error);
    throw error;
  }
};

// Function to load a specific conversation by its ID from Firestore
export const loadConversation = async (conversationId) => {
  try {
    const conversationRef = doc(firestore, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (conversationDoc.exists()) {
      return conversationDoc.data().data;
    } else {
      throw new Error("Conversation not found");
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
    throw error;
  }
};
