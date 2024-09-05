import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const sendTranscriptToBackend = async (transcript, selectedPersona, email) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/prompt',
      {
        role: selectedPersona.id, 
        prompt: transcript,
        user : email,
        
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error communicating with backend:', error);
    return null;
  }
};


export const textToSpeechWithOpenAI = async (text, voice) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        voice: voice,
        input: text
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return new Blob([response.data], { type: 'audio/mp3' });
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};
