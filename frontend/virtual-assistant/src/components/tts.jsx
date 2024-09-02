import { textToSpeechWithOpenAI } from './API';

export const handleTextToSpeech = async (text, voice, setSpeaking) => {
  const audioBlob = await textToSpeechWithOpenAI(text, voice);
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