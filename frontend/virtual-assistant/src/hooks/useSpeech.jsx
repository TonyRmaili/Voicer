

import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { sendTranscriptToBackend, textToSpeechWithOpenAI } from '../components/API';

export const useSpeech = (selectedPersona) => {
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);  // Added audioBlob state
  const [conversationEnded, setConversationEnded] = useState(false);  // Track conversation end
  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();

  // The keyword to end the conversation
  const END_KEYWORD = "goodbye";

  useEffect(() => {
    if (isListening) {
      setListening(true);
    } else {
      setListening(false);
      if (transcript) {
        handleSendTranscript();
      }
    }
  }, [isListening]);

  const handleListen = () => {
    if (!conversationEnded) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });  // Set continuous to false for short bursts
    }
  };

  const handleSendTranscript = async () => {
    // Check if the transcript contains the end keyword
    if (transcript.toLowerCase().includes(END_KEYWORD)) {
      const goodbyeMessage = "Goodbye! Ending the conversation.";
      
      // Set conversation as ended, and prepare for audio playback
      setConversationEnded(true);
      setResponse(goodbyeMessage);
      setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: goodbyeMessage }]);
      
      // Generate and play the goodbye audio
      handleTextToSpeech(goodbyeMessage, true);  // true indicates this is the final audio
      return;
    }

    // Send the transcript and selected persona to the backend
    const assistantResponse = await sendTranscriptToBackend(transcript, selectedPersona);
    if (assistantResponse) {
      setResponse(assistantResponse);
      setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: assistantResponse }]);
      handleTextToSpeech(assistantResponse);
    }
  };

  const handleTextToSpeech = async (text, isFinal = false) => {
    const audioBlob = await textToSpeechWithOpenAI(text, selectedPersona.voice);
    if (audioBlob) {
      setAudioBlob(audioBlob);  // Set the audioBlob state

      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);

        // If the goodbye audio has played, do not start listening again
        if (!isFinal && !conversationEnded) {
          handleListen();
        }
      };

      audio.play();
    }
  };

  const restartConversation = () => {
    setConversationEnded(false);  // Reset conversation ended flag
    handleListen();  // Start listening again
  };

  return {
    response,
    speaking,
    listening,
    conversation,
    audioBlob,  // Return audioBlob for external components
    handleListen,
    setConversation,
    conversationEnded,
    restartConversation,  // Expose the restart function
  };
};
