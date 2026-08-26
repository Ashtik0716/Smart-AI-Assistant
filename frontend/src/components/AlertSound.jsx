import { useRef, useState, useEffect } from "react";
import { uploadSound, getSounds, deleteSound } from "../services/api";

export default function AlertSound({ audioRef, onSoundReady, volume, onVolumeChange }) {
  const [fileName, setFileName] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const API_ORIGIN = "http://localhost:5000"; // backend serves files from here, not through /api

  // On mount, check if a sound was already saved from a previous session.
  useEffect(() => {
    getSounds()
      .then((sounds) => {
        if (sounds.length > 0) {
          setFileName(sounds[0].fileName);
          setObjectUrl(`${API_ORIGIN}${sounds[0].fileUrl}`);
          onSoundReady?.(`${API_ORIGIN}${sounds[0].fileUrl}`);
        }
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav"];
    const validExtension = /\.(mp3|wav)$/i.test(file.name);
    if (!validTypes.includes(file.type) && !validExtension) {
      alert("Please upload an .mp3 or .wav file.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadSound(file);
      const fullUrl = `${API_ORIGIN}${result.fileUrl}`;
      setFileName(result.fileName);
      setObjectUrl(fullUrl);
      onSoundReady?.(fullUrl);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handleStop = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handleStop);
    audio.addEventListener("ended", handleStop);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handleStop);
      audio.removeEventListener("ended", handleStop);
    };
  }, [objectUrl]);

  const handleTestSound = () => {
    if (audioRef.current && objectUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleRemoveSound = async () => {
    try {
      await deleteSound("current"); // id is unused server-side, single-sound model
      setFileName(null);
      setObjectUrl(null);
      onSoundReady?.(null);
    } catch (err) {
      alert("Failed to remove sound: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-sm p-4 rounded-lg border border-gray-200 bg-white flex flex-col gap-3">
      <h3 className="font-semibold text-gray-800">Alert Sound</h3>

      <label className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm text-center cursor-pointer">
        {uploading ? "Uploading..." : "Upload Sound"}
        <input
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Selected: <span className="font-medium">{fileName ?? "None"}</span></span>
        {fileName && (
          <button
            onClick={handleRemoveSound}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Remove
          </button>
        )}
      </div>
      {loadError && <div className="text-xs text-red-500">Couldn't load saved sound: {loadError}</div>}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Volume</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTestSound}
          disabled={!objectUrl || isPlaying}
          className="flex-1 px-3 py-2 rounded bg-indigo-600 text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700"
        >
          Test Sound
        </button>
        <button
          onClick={handleStopSound}
          disabled={!isPlaying}
          className="flex-1 px-3 py-2 rounded bg-red-600 text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700"
        >
          Stop Alarm
        </button>
      </div>

      <audio ref={audioRef} src={objectUrl ?? undefined} crossOrigin="anonymous" />
    </div>
  );
}