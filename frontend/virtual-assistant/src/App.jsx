import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

//// State Management and Speech Recognition Setup ////
const App = () => {
  const [response, setResponse] = useState(''); // Holds the response from OpenAI
  const [listening, setListening] = useState(false); // Tracks if the app is listening
  const [speaking, setSpeaking] = useState(false); // Tracks if the app is speaking
  const [selectedVoice, setSelectedVoice] = useState('alloy'); // Tracks selected voice ('alloy' for female, 'onyx' for male)
  const [selectedRole, setSelectedRole] = useState('teacher'); // Tracks selected role ('teacher' or 'mentor')

  const { transcript, resetTranscript, listening: isListening } = useSpeechRecognition(); // Speech recognition states and controls

  //// Effect Hook to Update Listening State ////
  useEffect(() => {
    if (isListening) {
      setListening(true); // Set listening state to true when speech recognition is active
    } else {
      setListening(false); // Set listening state to false when speech recognition is inactive
      if (transcript) {
        sendTranscriptToOpenAI(); // Automatically send the transcript when listening stops
      }
    }
  }, [isListening]); // Dependency array ensures this effect runs when `isListening` changes

  //// Handle Start Listening Button Click ////
  const handleListen = () => {
    resetTranscript(); // Reset the transcript to start fresh
    SpeechRecognition.startListening({ continuous: false }); // Start speech recognition, stops automatically when the user stops speaking
  };

  //// Send Transcript to OpenAI and Get Response ////
  const sendTranscriptToOpenAI = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Get OpenAI API key from environment variables
      
      // Role-specific system prompt to inform the AI about its role
      const rolePrompt = selectedRole === 'teacher'
        ? "You are an English teacher. Provide a very short and simple answer focused on English language learning. Politely refuse to answer questions that are not related to English language learning."
        : "You are a mentor. Provide very short and simple advice focused on personal development and guidance. Politely refuse to answer questions that are not related to personal development.";

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // Use the GPT-4 model for generating responses
          messages: [
            { role: 'system', content: rolePrompt },
            { role: 'user', content: transcript }
          ] // Send the user's transcript as input along with the role prompt
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // Authorization header with API key
            'Content-Type': 'application/json' // Set content type to JSON
          }
        }
      );

      if (response.data.choices && response.data.choices[0]) {
        const assistantResponse = response.data.choices[0].message.content; // Extract the assistant's response
        setResponse(assistantResponse); // Update the response state with the assistant's reply
        textToSpeechWithOpenAI(assistantResponse); // Convert the response to speech
      } else {
        console.error('Unexpected response structure:', response.data); // Log if the response structure is unexpected
      }
    } catch (error) {
      console.error('Error communicating with OpenAI:', error); // Log any errors encountered during the API call
    }
  };

  /////////////////////////////////////////////////////////////////////////////
  //// Convert Text Response to Speech Using OpenAI's TTS API ////
  const textToSpeechWithOpenAI = async (text) => {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY; // Get OpenAI API key from environment variables
      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model: 'tts-1', // Use the tts-1 model for generating speech (could be tts-1-hd for higher quality)
          voice: selectedVoice, // Use the selected voice ('alloy' for female, 'onyx' for male)
          input: text // The text to be converted to speech
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`, // Authorization header with API key
            'Content-Type': 'application/json' // Set content type to JSON
          },
          responseType: 'arraybuffer' // Expect the response to be an arraybuffer (audio data)
        }
      );

      // Create a blob from the audio response
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' }); // Convert the response to a Blob of type MP3
      const audioUrl = URL.createObjectURL(audioBlob); // Create a URL for the Blob

      // Create an audio element and play the audio
      const audio = new Audio(audioUrl); // Create a new audio element with the Blob URL
      audio.onplay = () => setSpeaking(true); // Set speaking state to true when audio starts
      audio.onended = () => {
        setSpeaking(false); // Set speaking state to false when audio ends
        URL.revokeObjectURL(audioUrl); // Clean up the object URL to free memory
      };

      audio.play(); // Play the audio
    } catch (error) {
      console.error('Error generating speech:', error); // Log any errors during the TTS process
    }
  };

  /////////////////////////////////////////////////////////////////////////////

  //// Render the App's UI ////
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-col w-1/2 p-4 bg-white border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4">Conversation</h2>
        <div className="flex flex-col p-4 mb-4 bg-gray-100 rounded-lg shadow-inner overflow-y-auto" style={{ height: '80vh' }}>
          <div className="mb-2">
            <h3 className="font-bold text-blue-500">You:</h3>
            <p>{transcript}</p> {/* Display the user's spoken transcript */}
          </div>
          <div>
            <h3 className="font-bold text-green-500">Assistant:</h3>
            <p>{response}</p> {/* Display the assistant's response */}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-1/2 p-8 bg-gray-50 relative">
        {/* Role Selection Buttons */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setSelectedRole('teacher')}
            className={`px-4 py-2 font-bold text-white rounded-lg ${selectedRole === 'teacher' ? 'bg-purple-500' : 'bg-gray-400'} hover:bg-purple-600`}
          >
            Teacher
          </button>
          <button
            onClick={() => setSelectedRole('mentor')}
            className={`px-4 py-2 font-bold text-white rounded-lg ${selectedRole === 'mentor' ? 'bg-green-500' : 'bg-gray-400'} hover:bg-green-600`}
          >
            Mentor
          </button>
        </div>

        {/* Voice Selection Buttons */}
        <div className="absolute top-4 right-4 space-x-2">
          <button
            onClick={() => setSelectedVoice('alloy')}
            className={`px-4 py-2 font-bold text-white rounded-lg ${selectedVoice === 'alloy' ? 'bg-pink-500' : 'bg-gray-400'} hover:bg-pink-600`}
          >
            Female Voice
          </button>
          <button
            onClick={() => setSelectedVoice('onyx')}
            className={`px-4 py-2 font-bold text-white rounded-lg ${selectedVoice === 'onyx' ? 'bg-blue-500' : 'bg-gray-400'} hover:bg-blue-600`}
          >
            Male Voice
          </button>
        </div>

        {/* Listen Button */}
        <button
          onClick={handleListen}
          className="px-6 py-3 mt-16 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Start Listening {/* The button now only says "Start Listening" */}
        </button>

        {/* Speaking Animation */}
        <div className={`mt-8 flex space-x-2 ${speaking ? 'animate-bounce' : ''}`}>
          <div className="w-4 h-16 bg-blue-500 rounded" style={{ animationDelay: '0.1s' }} />
          <div className="w-4 h-12 bg-blue-500 rounded" style={{ animationDelay: '0.2s' }} />
          <div className="w-4 h-8 bg-blue-500 rounded" style={{ animationDelay: '0.3s' }} />
          <div className="w-4 h-12 bg-blue-500 rounded" style={{ animationDelay: '0.4s' }} />
          <div className="w-4 h-16 bg-blue-500 rounded" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
};

export default App;
