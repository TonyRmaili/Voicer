// src/hooks/useSpeech.js
import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { sendTranscriptToOpenAI, textToSpeechWithOpenAI } from '../components/API';

export const useSpeech = (selectedPersona) => {
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();

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
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  const handleSendTranscript = async () => {
    const assistantResponse = await sendTranscriptToOpenAI(transcript, selectedPersona);
    if (assistantResponse) {
      setResponse(assistantResponse);
      setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: assistantResponse }]);
      handleTextToSpeech(assistantResponse);
    }
  };

  const handleTextToSpeech = async (text) => {
    const audioBlob = await textToSpeechWithOpenAI(text, selectedPersona.voice);
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    }
  };

  return {
    response,
    speaking,
    listening,
    conversation,
    handleListen,
    setConversation,
  };
};
