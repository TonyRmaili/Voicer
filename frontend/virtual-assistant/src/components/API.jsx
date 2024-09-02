import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const sendTranscriptToOpenAI = async (transcript, selectedPersona) => {
  const rolePrompt = selectedPersona.id === 'teacher'
    ? "You are an English teacher. Provide a very short and simple answer focused on English language learning. Politely refuse to answer questions that are not related to English language learning."
    : "You are a mentor. Provide very short and simple advice focused on personal development and guidance. Politely refuse to answer questions that are not related to personal development.";

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: rolePrompt },
          { role: 'user', content: transcript }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected response structure:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
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
