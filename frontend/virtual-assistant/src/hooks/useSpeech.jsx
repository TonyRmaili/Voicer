import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { sendTranscriptToBackend, textToSpeechWithOpenAI } from '../components/API';
import { useAuth } from './useAuth';

export const useSpeech = (selectedPersona) => {
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();
  const { user } = useAuth();

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
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  const handleSendTranscript = async () => {
    if (transcript.toLowerCase().includes(END_KEYWORD)) {
      const goodbyeMessage = "Goodbye! Ending the conversation.";
      setConversationEnded(true);
      setResponse(goodbyeMessage);
      setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: goodbyeMessage }]);
      handleTextToSpeech(goodbyeMessage, true);
      return;
    }

    const email = user?.email;
    const assistantResponse = await sendTranscriptToBackend(transcript, selectedPersona, email);

    if (assistantResponse) {
      setResponse(assistantResponse);
      setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: assistantResponse }]);
      handleTextToSpeech(assistantResponse);
    }
  };

  const handleTextToSpeech = async (text, isFinal = false) => {
    const audioBlob = await textToSpeechWithOpenAI(text, selectedPersona.voice);
    if (audioBlob) {
      setAudioBlob(audioBlob);

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (!isFinal && !conversationEnded) {
          handleListen();
        }
      };

      audio.play();
    }
  };

  const restartConversation = () => {
    setConversationEnded(false);
    handleListen();
  };

  return {
    response,
    speaking,
    listening,
    conversation,
    audioBlob,
    handleListen,
    setConversation,
    conversationEnded,
    restartConversation,
  };
};
