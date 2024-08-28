// src/utils/audioUtils.js

export const uploadAudio = async (audioBlob, setTranscription) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");
  
    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`
        },
        body: formData
      });
  
      if (response.ok) {
        const data = await response.json();
        setTranscription(data.text);
      } else {
        console.error("Failed to transcribe audio");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };
  