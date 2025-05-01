const ControlPanel = ({
    isRecording,
    isPaused,
    micOn,
    audioOn,
    toggleRecording,
    stopRecording,
    setMicOn,     
    setAudioOn,
    startCountdown,
  }) => {
    return (
      <div className="fixed bottom-10 right-10 bg-white shadow-xl rounded-xl p-4 flex items-center gap-4 z-50">
        
        
        <button
          onClick={isRecording ? toggleRecording : startCountdown}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition ${
            isRecording ? (isPaused ? 'bg-yellow-500' : 'bg-red-600') : 'bg-red-500'
          }`}
          aria-label={isRecording ? (isPaused ? 'Resume Recording' : 'Pause Recording') : 'Start Recording'}
          title={isRecording ? (isPaused ? 'Resume' : 'Pause') : 'Start'}
        >
          {isRecording ? (isPaused ? '▶️' : '⏸️') : '●'}
        </button>
  
        
        <button
          onClick={setMicOn}
          className={`px-3 py-1 rounded text-white transition ${
            micOn ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-label="Toggle Microphone"
        >
          Mic {micOn ? 'On' : 'Off'}
        </button>
  
        
        <button
          onClick={() => setAudioOn(prev => !prev)}
          className={`px-3 py-1 rounded text-white transition ${
            audioOn ? 'bg-green-500' : 'bg-gray-400'
          }`}
          aria-label="Toggle System Audio"
          title="Takes effect on next recording"
        >
          Audio {audioOn ? 'On' : 'Off'}
        </button>
  
    
        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            aria-label="Stop and Save Recording"
          >
            Recording Done
          </button>
        )}
      </div>
    );
  };
  
  export default ControlPanel;
  