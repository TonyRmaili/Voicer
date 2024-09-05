
import React, { useEffect, useState, useRef } from 'react';
import mentorImage from '../assets/mentor.png';
import teacherImage from '../assets/teacher.png';
import logoImage from '../assets/logo.png';
import { useSpeech } from '../hooks/useSpeech';
import { saveConversationToFirestore } from '../firebase';
import { FiLogOut } from 'react-icons/fi';
import Wavify from 'react-wavify';  // Example visualizer library

const personas = [
  { id: 'teacher', name: 'Teacher', image: teacherImage, voice: 'alloy' },
  { id: 'mentor', name: 'Mentor', image: mentorImage, voice: 'onyx' },
];

const Logged = ({ user, logout }) => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const { speaking, listening, conversation, handleListen, restartConversation, conversationEnded, audioBlob } = useSpeech(selectedPersona);  // Added conversationEnded and restartConversation
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create an audio element and set its source to the blob URL
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // When the audio starts playing, trigger the visualizer
      audio.onplay = () => {
        setIsPlaying(true);
      };

      // When the audio stops playing, stop the visualizer
      audio.onended = () => {
        setIsPlaying(false);
      };

      // Play the audio once it's loaded
      audio.onloadeddata = () => {
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };

      // Clean up the audio object when the component unmounts or audioBlob changes
      return () => {
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob]);

  const handleSaveConversation = async () => {
    if (user && conversation.length > 0) {
      await saveConversationToFirestore(user.uid, conversation);
    } else {
      alert('No conversation to save.');
    }
  };

  const handleStartListening = () => {
    if (conversationEnded) {
      restartConversation();  // Reset the conversationEnded flag and restart the conversation
    } else {
      handleListen();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <img src={logoImage} alt="Logo" className="h-14" />
            <button
              onClick={logout}
              className="p-2 bg-red-600 rounded-full hover:bg-red-800 hover:font-bold transition duration-300 ease-in-out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm mb-4">
            <span className="truncate">{user.email}</span>
          </div>
          <div className="space-y-2 flex-grow">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`flex items-center space-x-2 w-full p-2 rounded transition duration-300 ease-in-out ${
                  selectedPersona?.id === persona.id
                    ? 'bg-green-500 hover:bg-green-600 text-black font-bold'
                    : 'bg-gray-700 hover:bg-gray-900 text-white'
                }`}
              >
                <img src={persona.image} alt={persona.name} className="w-10 h-10 rounded-full object-cover" />
                <span>{persona.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Visualizer */}
        {audioBlob && isPlaying && (
          <div className="bg-gray-700 p-4 mt-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">AI is Talking...</h3>
            <Wavify
              fill="#f76565"
              paused={false}
              options={{
                height: 20,
                amplitude: 40,
                speed: 0.55,
                points: 3
              }}
            />
          </div>
        )}

        <div className="mt-auto">
          <div className="relative h-24 w-24 bg-gray-700 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`h-12 w-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transform ${speaking ? 'animate-ping animate-vibrate' : ''}`}></div>
            </div>
            <div className={`absolute inset-0 h-2 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 transform ${speaking ? 'animate-gradient-x' : ''}`}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedPersona ? (
          <>
            <div className="bg-gray-800 p-4 flex items-center space-x-2">
              <img
                src={selectedPersona.image}
                alt={selectedPersona.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <h2 className="text-xl font-bold">{selectedPersona.name}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded ${
                      message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-800">
              <button
                onClick={handleStartListening}  // Use the new function to handle listening and restarting
                disabled={speaking}
                className={`w-full px-4 py-2 rounded transition ${
                  speaking
                    ? 'bg-gray-600 cursor-not-allowed'
                    : listening
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                {speaking ? 'AI Speaking...' : listening ? 'Listening...' : 'Start Listening'}
              </button>
              <button
                onClick={handleSaveConversation}
                className="w-full px-4 py-2 mt-4 bg-green-600 rounded hover:bg-green-700 transition"
              >
                Save Conversation
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl text-gray-400">Select a persona to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logged;
