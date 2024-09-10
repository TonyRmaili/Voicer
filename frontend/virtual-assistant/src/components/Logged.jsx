import React, { useEffect, useState, useRef } from 'react';
import therapistImage from '../assets/mentor.png';
import teacherImage from '../assets/teacher.png';
import chefImage from '../assets/kock.png';
import trainerImage from '../assets/trainer.png';
import generalImage from '../assets/general.png'; 
import customImage from '../assets/custom_assistant.jpg'; 
import assistantImage from '../assets/assistent.png';
import logoImage from '../assets/logo.png';
import { useSpeech } from '../hooks/useSpeech';
import swedishImage from '../assets/swedish.png';
import germanImage from '../assets/german.png';
import frenchImage from '../assets/french.png';
import englishImage from '../assets/english.png';
import { saveConversationToFirestore } from '../firebase';
import { FiLogOut } from 'react-icons/fi';
import Wavify from 'react-wavify';
import CreateCustomAssistant from './CreateCustomAssistant';
import { sendCustomAssistantToBackend, scanAssistants } from '../components/API';


const languages = {
  sv: { name: 'Swedish', flag: swedishImage },
  de: { name: 'German', flag: germanImage },
  fr: { name: 'French', flag: frenchImage },
  en: { name: 'English', flag: englishImage }
};




const Logged = ({ user, logout }) => {

  const personas = [
    { id: 'assistant', name: 'Assistant', image: assistantImage, voice: 'alloy' }, 
    { id: 'general', name: 'General', image: generalImage, voice: 'neutral' }, 
    { id: 'teacher', name: 'Teacher', image: teacherImage, voice: 'alloy' },
    { id: 'therapist', name: 'Therapist', image: therapistImage, voice: 'alloy' },
    { id: 'chef', name: 'Chef', image: chefImage, voice: 'onyx' },
    { id: 'personal_trainer', name: 'Personal trainer', image: trainerImage, voice: 'onyx' },
  ];

  

  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
  const [dropdownOpen, setDropdownOpen] = useState(false); // Control dropdown visibility
  const { speaking, listening, conversation, handleListen, audioBlob } = useSpeech(selectedPersona);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isCustomAssistantModalOpen, setIsCustomAssistantModalOpen] = useState(false);


  const [customAssistants, setCustomAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await scanAssistants(); // Fetch data from the API
        setCustomAssistants(result);
        console.log(result)
      } catch (err) {
        setError(err.message); // Handle errors
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchData(); // Call the function
  }, []); // Empty dependency array ensures it runs once

  useEffect(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onloadeddata = () => {
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };

      return () => {
        audioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };
    }
  }, [audioBlob]);

  
  const handleOpenModal = () => {
    setIsCustomAssistantModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsCustomAssistantModalOpen(false); // Close the modal
  };


  const handleSaveConversation = async () => {
    if (user && conversation.length > 0) {
      await saveConversationToFirestore(user.uid, conversation);
    } else {
      alert('No conversation to save.');
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLanguageSelect = (languageKey) => {
    setSelectedLanguage(languageKey);
    setDropdownOpen(false); // Close the dropdown
    console.log(`${languageKey} selected`);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-64 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <img src={logoImage} alt="Logo" className="h-14" />
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
                speed: 0.15,
                points: 3
              }}
            />
          </div>
        )}

        {/* Redesigned Square Animation Box with Larger Vibrating Circle */}
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
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          {selectedPersona ? (
            <>
              <div className="flex items-center space-x-2">
                <img
                  src={selectedPersona.image}
                  alt={selectedPersona.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <h2 className="text-xl font-bold">{selectedPersona.name}</h2>
              </div>
            </>
          ) : (
            <p className="text-2xl text-gray-400">Select a persona to start chatting</p>
          )}

          {/* Right side controls: Language Dropdown and Logout */}
          <div className="flex items-center space-x-6">
            {/* Custom Dropdown for Language Selection with Flags */}

            <div className="relative flex">
            <button 
            className="mr-8 border border-gray-300 bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
            onClick={handleOpenModal}>
            Create Custom Assistant
            </button>

              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-all duration-300 ease-in-out shadow-lg"
              >
                <img
                  src={languages[selectedLanguage].flag}
                  alt={languages[selectedLanguage].name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{languages[selectedLanguage].name}</span>
                <svg
                  className={`w-4 h-4 transition-transform transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden">
                  {Object.keys(languages).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleLanguageSelect(key)}
                      className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-gray-700 transition-all duration-200 ease-in-out text-white"
                    >
                      <img src={languages[key].flag} alt={languages[key].name} className="w-5 h-5 rounded-full" />
                      <span>{languages[key].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all duration-300 ease-in-out shadow-lg text-white"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
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
            onClick={handleListen}
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
      </div>

      {isCustomAssistantModalOpen && (
      <CreateCustomAssistant
      handleClose={handleCloseModal}
      onSave={(data) => {
        console.log('Saved assistant data:', data);
        sendCustomAssistantToBackend(data.name,data.systemPrompt,data.voice)
      }}
      />
    )}

    </div>
    
  );
};

export default Logged;
