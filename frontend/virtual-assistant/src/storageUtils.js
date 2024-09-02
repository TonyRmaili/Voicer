import { ref, uploadString, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const saveConversationToStorage = async (userId, conversation) => {
  try {
    const fileName = `conversations/${userId}/${Date.now()}.json`;
    const storageRef = ref(storage, fileName);
    const jsonString = JSON.stringify(conversation);
    await uploadString(storageRef, jsonString);
    console.log("Conversation saved successfully");
    return fileName;
  } catch (error) {
    console.error("Error saving conversation:", error);
    throw error;
  }
};

const loadConversationsForUser = async (userId) => {
  try {
    const listRef = ref(storage, `conversations/${userId}`);
    const res = await listAll(listRef);
    const conversations = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const response = await fetch(url);
        const data = await response.json();
        return {
          id: itemRef.name,
          data: data,
        };
      })
    );
    return conversations;
  } catch (error) {
    console.error("Error loading conversations:", error);
    throw error;
  }
};

const loadConversation = async (userId, conversationId) => {
  try {
    const fileRef = ref(storage, `conversations/${userId}/${conversationId}`);
    const url = await getDownloadURL(fileRef);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading conversation:", error);
    throw error;
  }
};

export { saveConversationToStorage, loadConversationsForUser, loadConversation };
