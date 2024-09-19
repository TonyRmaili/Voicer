import { useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { sendTranscriptToBackend, textToSpeechWithOpenAI } from '../components/API';  // Modify API to handle language
import { useAuth } from './useAuth';

export const useSpeech = (selectedPersona, selectedLanguage) => { 
  useEffect(() => {
    console.log("Selected Language in useSpeech:", selectedLanguage);
  }, [selectedLanguage]);

  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isStopped, setIsStopped] = useState(false); 
  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition();
  const { user } = useAuth();
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null);  

  const END_KEYWORD = "goodbye";

  useEffect(() => {
    if (isListening) {
      setListening(true);
    } else {
      setListening(false);
      if (transcript && !conversationEnded && !isStopped) {
        handleSendTranscript();
      }
    }
  }, [isListening]);

  const handleListen = () => {
    
    setIsStopped(false);
    setConversationEnded(false);

    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
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

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;  

    try {
      const assistantResponse = await sendTranscriptToBackend(transcript, selectedPersona, email, selectedLanguage, { signal });

      if (assistantResponse && !isStopped) {
        setResponse(assistantResponse);
        setConversation(prev => [...prev, { role: 'user', content: transcript }, { role: 'assistant', content: assistantResponse }]);
        handleTextToSpeech(assistantResponse);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("API request was cancelled.");
      } else {
        console.error("An error occurred:", error);
      }
    }
  };

  const handleTextToSpeech = async (text, isFinal = false) => {
    if (isStopped) return;  // Stop if the conversation was interrupted

    // Pass selectedLanguage to the TTS service
    const audioBlob = await textToSpeechWithOpenAI(text, selectedPersona.voice, selectedLanguage);  
    if (audioBlob && !isStopped) {
      setAudioBlob(audioBlob);

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (!isFinal && !conversationEnded && !isStopped) {
          handleListen();  // Continue listening if the conversation isn't over
        }
      };

      audio.play();
    }
  };

  const handleStopAndSayGoodbye = async () => {
    setIsStopped(true); 
    setConversationEnded(true);

    // Abort any ongoing API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();  
    }

    SpeechRecognition.stopListening();  // Stop speech recognition

    // Stop any ongoing audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
    }

    const goodbyeMessage = "Goodbye! Ending the conversation.";
    setResponse(goodbyeMessage);
    setConversation(prev => [...prev, { role: 'assistant', content: goodbyeMessage }]);
    console.log("AI stopped.");
  };

  return {
    response,
    speaking,
    listening,
    conversation,
    audioBlob,
    handleListen,
    handleStopAndSayGoodbye,
    setConversation,
    conversationEnded,
  };
};
