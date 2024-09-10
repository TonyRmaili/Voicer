import React, { useState, useEffect } from 'react';

const CreateCustomAssistant = ({ handleClose, onSave  }) => {
  const [name, setName] = useState('');
  const [voice, setVoice] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const availableVoices = ["onyx", "alloy"];


  const handleSave = () => {
    if (name && voice && systemPrompt) {
      
      onSave({ name, voice, systemPrompt });
      setName('');
      setVoice('');
      setSystemPrompt('');
      handleClose(); // Close the modal after saving
    } else {
      alert('Please fill in all the fields.');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleClose} // Close modal when clicking on the backdrop
    >
      <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside the modal
      >
        <h2 className="text-2xl font-bold text-white mb-4">Create Custom Assistant</h2>

        {/* Modal content */}
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
            Assistant Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-lg"
            placeholder="Enter assistant name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="voice">
            Voice
          </label>
          <select
            id="voice"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-lg"
          >
            <option value="">Select a voice</option>
            {availableVoices.map((voiceOption) => (
              <option key={voiceOption} value={voiceOption}>
                {voiceOption.charAt(0).toUpperCase() + voiceOption.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="systemPrompt">
            System Prompt
          </label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-lg"
            placeholder="Enter system prompt"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose} // Close the modal on "Cancel"
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomAssistant;
