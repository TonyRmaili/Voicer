import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

const VisualPlayer = () => {
  const waveformRef = useRef(null);
  const waveSurfer = useRef(null);

  useEffect(() => {
    waveSurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#d4d4d4',
      progressColor: '#4caf50',
      cursorColor: '#333',
      barWidth: 2,
      responsive: true,
    });

    waveSurfer.current.load('your-audio-file.mp3');

    return () => {
      waveSurfer.current.destroy();
    };
  }, []);

  return (
    <div>
      <div ref={waveformRef}></div>
    </div>
  );
};

export default VisualPlayer;
