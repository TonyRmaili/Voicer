import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { uploadAudio } from './audioUtils'; 

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [transcription, setTranscription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Set the currently logged-in user
    setUser(auth.currentUser);

    // Request microphone access and set up the MediaRecorder
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
    }).catch((err) => {
      console.error("Microphone access denied:", err);
    });
  }, []);

  const handleStartRecording = () => {
    if (mediaRecorder) {
      setIsRecording(true);
      mediaRecorder.start();

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(blob);
        setAudioURL(audioURL);
        
        // Send the blob to OpenAI for transcription
        uploadAudio(blob, setTranscription); // Passing setTranscription as a callback
      };
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      setIsRecording(false);
      mediaRecorder.stop();
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h2 className="text-3xl font-semibold mb-4">Welcome to your Dashboard!</h2>
      {user ? (
        <p className="mb-4">Logged in as: <strong>{user.email}</strong></p>
      ) : (
        <p className="mb-4">No user is logged in.</p>
      )}

      <button
        onMouseDown={handleStartRecording}
        onMouseUp={handleStopRecording}
        className={`py-2 px-4 ${isRecording ? 'bg-red-700' : 'bg-blue-600'} text-white font-semibold rounded hover:${isRecording ? 'bg-red-800' : 'bg-blue-700'}`}
      >
        {isRecording ? "Recording..." : "Hold to Record"}
      </button>

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {transcription && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Transcription:</h3>
          <p>{transcription}</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-4 py-2 px-4 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
