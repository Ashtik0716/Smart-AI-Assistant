import { useEffect, useState } from "react";
import { Music, Save, SlidersHorizontal, Square, Upload, Volume2 } from "lucide-react";
import { uploadSound, getSounds, deleteSound, updateSettings, API_ORIGIN } from "../services/api";

const MAX_BYTES = 10 * 1024 * 1024;

export default function AlertSound({ audioRef, onSoundReady, volume, onVolumeChange }) {
  const [fileName, setFileName] = useState(null);
  const [soundUrl, setSoundUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  // Load the sound saved on the server, if there is one.
  useEffect(() => {
    getSounds()
      .then((sounds) => {
        if (sounds.length > 0) {
          const url = `${API_ORIGIN}${sounds[0].fileUrl}`;
          setFileName(sounds[0].fileName);
          setSoundUrl(url);
          onSoundReady?.(url);
        }
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track playback so the Stop button appears for test sounds and real alarms alike.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const on = () => setIsPlaying(true);
    const off = () => setIsPlaying(false);
    audio.addEventListener("play", on);
    audio.addEventListener("pause", off);
    audio.addEventListener("ended", off);
    return () => {
      audio.removeEventListener("play", on);
      audio.removeEventListener("pause", off);
      audio.removeEventListener("ended", off);
    };
  }, [audioRef, soundUrl]);

  // Keep the slider and the audio element in step.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [audioRef, volume, soundUrl]);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    if (!/\.(mp3|wav)$/i.test(file.name)) {
      setError("Choose an .mp3 or .wav file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadSound(file);
      const url = `${API_ORIGIN}${result.fileUrl}`;
      setFileName(result.fileName);
      setSoundUrl(url);
      onSoundReady?.(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleTest = () => {
    const audio = audioRef.current;
    if (!audio || !soundUrl) return;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => setError("Couldn’t play the sound."));
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const handleRemove = async () => {
    setError(null);
    try {
      await deleteSound("current");
      handleStop();
      setFileName(null);
      setSoundUrl(null);
      onSoundReady?.(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await updateSettings({ alertVolume: volume });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
    }
  };

  return (
    <section className="panel p-5" aria-labelledby="controls-title">
      <h2 id="controls-title" className="flex items-center gap-3 text-lg font-bold">
        <SlidersHorizontal className="h-5 w-5 text-brand" aria-hidden="true" />
        Study controls
      </h2>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Upload className="h-4 w-4 text-brand" aria-hidden="true" />
          Alert sound
        </h3>
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus-within:ring-2 focus-within:ring-brand ${
            dragging ? "border-brand bg-brand/10" : "border-line hover:border-brand/60"
          }`}
        >
          <Upload className="mb-1 h-6 w-6 text-mist" aria-hidden="true" />
          <span className="text-sm">{uploading ? "Uploading…" : "Click to upload or drag and drop"}</span>
          <span className="text-xs text-mist">WAV or MP3, up to 10 MB</span>
          <input
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = ""; // lets the same file be chosen again
            }}
          />
        </label>
        {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Music className="h-4 w-4 text-brand" aria-hidden="true" />
          Selected sound
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-ink-800 px-4 py-3 text-sm">
          <span className={`truncate ${fileName ? "text-white" : "text-mist"}`}>{fileName ?? "None selected"}</span>
          {fileName && (
            <button onClick={handleRemove} className="shrink-0 text-xs font-medium text-red-400 hover:text-red-300">
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm font-semibold">
          <label htmlFor="alert-volume" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-brand" aria-hidden="true" />
            Volume
          </label>
          <span className="text-mist">{Math.round(volume * 100)}%</span>
        </div>
        <input
          id="alert-volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="mt-3 w-full accent-brand"
        />
      </div>

      {isPlaying && (
        <button
          onClick={handleStop}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          <Square className="h-4 w-4 fill-current" aria-hidden="true" />
          Stop alarm
        </button>
      )}

      <div className={`${isPlaying ? "mt-3" : "mt-6"} grid grid-cols-2 gap-3`}>
        <button
          onClick={handleTest}
          disabled={!soundUrl || isPlaying}
          className="flex items-center justify-center gap-2 rounded-xl border border-line bg-ink-800 px-3 py-3 text-sm font-medium transition hover:border-brand/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
          Test sound
        </button>
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save volume"}
        </button>
      </div>
      {saveState === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-400">Couldn’t save. Try again.</p>
      )}

      <audio ref={audioRef} src={soundUrl ?? undefined} crossOrigin="anonymous" />
    </section>
  );
}