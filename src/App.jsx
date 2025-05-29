import { useState, useRef, useEffect } from "react";
import ControlPanel from "./components/ControlPanel";
import Countdown from "./components/CountDown";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "./Utils/constant";

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

  const [myVideos, setMyVideos] = useState([]);
  const [showMyVideos, setShowMyVideos] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadedVideoURL, setUploadedVideoURL] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (recordedChunks.length === 0) {
      alert("No recording to upload.");
      return null;
    }

    if (!videoTitle.trim()) {
      alert("Please enter a title before uploading.");
      return null;
    }

    const blob = new Blob(recordedChunks, { 
      type: 'video/webm' 
    });
    const file = new File([blob], `${Date.now()}-recording.webm`, { 
      type: 'video/webm'
    });

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", videoTitle);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required to upload.");
      return null;
    }

    try {
      setIsUploading(true);
      const res = await fetch(BACKEND_URL + "/api/videos/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log('Upload response:', data);
      if (res.ok) {
        alert("Upload successful!");
        setUploadedVideoURL(data.video.videoUrl);
      }
      else {
        console.error('Upload failed:', data);
        alert(data.error || "Upload failed.");
        return null;
      }
    } catch (err) {
      console.error('Upload error details:', err);
      alert("Upload error: " + err.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    }
  }, [])

  useEffect(() => {
    const fetchMyVideos = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(BACKEND_URL + "/api/videos/my-videos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res);

        const data = await res.json();
        // console.log("RAW RESPONSE TEXT:", text);
        if (res.ok) {
          setMyVideos(data.videos || []);
        } else {
          console.error(data.error || "Failed to fetch videos");
        }
      } catch (err) {
        console.error("Error fetching videos:", err.message);
      }
    };

    if (showMyVideos) fetchMyVideos();
  }, [showMyVideos]);

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

      <button
        onClick={() => setShowMyVideos(!showMyVideos)}
        className="px-4 py-2 mb-4 rounded bg-green-500 text-white"
      >
        {showMyVideos ? "Hide My Videos" : "Show My Videos"}
      </button>

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

          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Enter video title"
            className="mt-4 p-2 border border-gray-300 rounded w-full max-w-xl"
          />

          <div className="flex gap-4 justify-center mt-4">
            <button
              onClick={async () => {
                if (!uploadedVideoURL) {
                  alert("Please upload the video first");
                  return;
                }
                window.open(uploadedVideoURL, '_blank');
              }}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Download Recording
            </button>

            <button
              onClick={async () => {
                if (!uploadedVideoURL) {
                  alert("Please upload the video first");
                  return;
                }
                await navigator.clipboard.writeText(uploadedVideoURL);
                alert("Video link copied to clipboard!");
              }}
              className="bg-purple-600 text-white px-6 py-2 rounded"
            >
              Share Video Link
            </button>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`${isUploading ? "bg-gray-400" : "bg-blue-600"
                } text-white px-6 py-2 rounded`}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mt-8">No video recorded yet.</p>
      )}

      {showMyVideos && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">My Uploaded Videos</h2>
          {myVideos.length === 0 ? (
            <p>No videos found.</p>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(showAll ? myVideos : myVideos.slice(0, 3)).map((video) => (
                  <div key={video._id} className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-2 truncate">{video.title}</h3>

                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-64 object-cover rounded mb-2"
                      preload="metadata"
                    />

                    <a
                      href={video.videoUrl}
                      download
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Download Recording
                    </a>
                  </div>
                ))}
              </div>

              {myVideos.length > 3 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                  >
                    {showAll ? "Show Less" : "Show All Videos"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;