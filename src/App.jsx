import { useState, useRef } from "react";
import ControlPanel from "./components/ControlPanel";
import Countdown from "./components/CountDown";

const App = () => {
  const mediaRecorderRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [videoURL, setVideoURL] = useState(null);

  
  const handleStart = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: audioOn, 
      });

      let userMicStream = null;
      if (micOn) {
        userMicStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userMicStream.getAudioTracks().forEach(track => {
          displayStream.addTrack(track);
        });
        setMicStream(userMicStream);
      }

      setMediaStream(displayStream);
      setShowControls(true);
    } catch (err) {
      alert("Error accessing media devices: " + err.message);
    }
  };

  const startCountdown = () => {
    setShowCountdown(true);
  };

  const startRecording = () => {
    if (!mediaStream) return;

    const chunks = [];
    const recorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedChunks(chunks);
      setVideoURL(url);
    };

    recorder.start();
    setIsRecording(true);
    setIsPaused(false);
    setShowCountdown(false);
  };

  const toggleRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (isPaused) {
      recorder.resume();
      setIsPaused(false);
    } else {
      recorder.pause();
      setIsPaused(true);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder) recorder.stop();

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }

    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    setShowControls(false);
    setMediaStream(null);
    setMicStream(null);
  };

  const downloadRecording = () => {
    if (!videoURL) return;
    const a = document.createElement("a");
    a.href = videoURL;
    a.download = "recording.webm";
    a.click();
  };

  
  const toggleMic = () => {
    if (!micStream) return;

    micStream.getAudioTracks().forEach(track => {
      track.enabled = !micOn;
    });

    setMicOn(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Loom-like Screen Recorder</h1>

      {!mediaStream && (
        <button onClick={handleStart} className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Start Recording Setup
        </button>
      )}

      {showCountdown && <Countdown onFinish={startRecording} />}

      {showControls && (
        <ControlPanel
          isRecording={isRecording}
          isPaused={isPaused}
          micOn={micOn}
          audioOn={audioOn}
          toggleRecording={toggleRecording}
          stopRecording={stopRecording}
          setMicOn={toggleMic}
          setAudioOn={setAudioOn}
          startCountdown={startCountdown}
        />
      )}

      {videoURL ? (
        <div className="mt-8 text-center">
          <video src={videoURL} controls className="w-full max-w-xl mx-auto" />
          <button onClick={downloadRecording} className="mt-4 bg-green-600 text-white px-6 py-2 rounded">
            Download Recording
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mt-8">No video recorded yet.</p>
      )}
    </div>
  );
};

export default App;
