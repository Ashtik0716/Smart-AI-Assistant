import { useState, useEffect, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useDrowsiness } from "../hooks/useDrowsiness";
import EyeStatus from "./EyeStatus";
import AlertSound from "./AlertSound";
import StudyTimer from "./StudyTimer";
import AttentionScore from "./AttentionScore";
import { STATUS } from "../ai/drowsinessDetector";
import { createSession, getSettings } from "../services/api";

const FALLBACK_SETTINGS = {
  earThreshold: 0.5,
  drowsyDurationMs: 2000,
  alertVolume: 0.8,
  alertsEnabled: true,
  headPoseEnabled: false,
};

export default function Camera() {
  const { videoRef, status, error, startCamera, stopCamera } = useCamera();
  const cameraActive = status === "active";

  const [alertUrl, setAlertUrl] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [alertCount, setAlertCount] = useState(0);
  const sharedAudioRef = useRef(null);

  // Settings must be declared BEFORE anything that reads detectionSettings
  const [detectionSettings, setDetectionSettings] = useState(FALLBACK_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    getSettings()
      .then((data) => {
        setDetectionSettings({
          earThreshold: data.earThreshold,
          drowsyDurationMs: data.drowsyDurationMs,
          alertVolume: data.alertVolume,
          alertsEnabled: data.alertsEnabled,
          headPoseEnabled: data.headPoseEnabled, // NEW
        });
        setVolume(data.alertVolume);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setSettingsLoaded(true));
  }, []);

  const { modelStatus, faceDetected, ear, closure, headPitch } = useFaceLandmarker(videoRef, cameraActive && settingsLoaded);

const { status: drowsinessStatus, drowsyEventCount, isDrowsy } = useDrowsiness(
  closure,
  {
    earThreshold: detectionSettings.earThreshold,
    drowsyDurationMs: detectionSettings.drowsyDurationMs,
    enabled: detectionSettings.alertsEnabled,
    headPoseEnabled: detectionSettings.headPoseEnabled, // NEW
  },
  headPitch // NEW
);

  const displayStatus = !faceDetected ? STATUS.NO_FACE : drowsinessStatus;

  // --- Study session tracking ---
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [drowsyMs, setDrowsyMs] = useState(0);
  const tickRef = useRef(null);
  const lastTickRef = useRef(null);
  const [noFaceMs, setNoFaceMs] = useState(0);

  useEffect(() => {
    if (!sessionActive) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    lastTickRef.current = performance.now();
    tickRef.current = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setElapsedMs((prev) => prev + delta);

      if (isDrowsy) {
        setDrowsyMs((prev) => prev + delta);
      }
      if (!faceDetected) {
        setNoFaceMs((prev) => prev + delta);
      }
    }, 500);

    return () => clearInterval(tickRef.current);
  }, [sessionActive, isDrowsy, faceDetected]);

  const attentiveMs = Math.max(elapsedMs - drowsyMs - noFaceMs, 0);
  const trackedMs = Math.max(elapsedMs - noFaceMs, 0);
  const attentionScore = trackedMs > 0 ? Math.round((attentiveMs / trackedMs) * 100) : 100;

  const handleStartSession = () => {
    setElapsedMs(0);
    setDrowsyMs(0);
    setNoFaceMs(0);
    setSessionActive(true);
    if (!cameraActive) startCamera();
  };

  const handleStopSession = async () => {
    setSessionActive(false);
    try {
      await createSession({
        durationMs: elapsedMs,
        attentiveMs,
        drowsyMs,
        attentionScore,
        drowsinessEvents: drowsyEventCount,
        alertsPlayed: alertCount,
        startedAt: new Date(Date.now() - elapsedMs).toISOString(),
        endedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to save session:", err);
    }
  };

  const [wasDrowsy, setWasDrowsy] = useState(false);
  useEffect(() => {
    if (sessionActive && detectionSettings.alertsEnabled && isDrowsy && !wasDrowsy && alertUrl && sharedAudioRef.current) {
      const audio = sharedAudioRef.current;
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch((err) => console.error("Alert playback failed:", err));
      setAlertCount((c) => c + 1);
    }
    setWasDrowsy(isDrowsy);
  }, [sessionActive, detectionSettings.alertsEnabled, isDrowsy, wasDrowsy, alertUrl, volume]);

      const statusBorderColor = {
    [STATUS.ATTENTIVE]: "border-green-500",
    [STATUS.POSSIBLY_TIRED]: "border-yellow-500",
    [STATUS.DROWSY]: "border-red-500",
    [STATUS.NO_FACE]: "border-gray-300",
  }[displayStatus] ?? "border-gray-300";

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-5">
        {/* Video */}
        <div
          className={`relative w-full max-w-[640px] aspect-video bg-black rounded-xl overflow-hidden border-4 transition-colors duration-300 ${
            cameraActive ? statusBorderColor : "border-gray-200"
          }`}
        >
          <video ref={videoRef} className="w-full h-full object-cover -scale-x-100" playsInline muted />
          {status !== "active" && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
              {status === "error" ? error : "Camera not started"}
            </div>
          )}
          {cameraActive && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 text-xs text-white">
              {modelStatus === "loading" && "Loading AI model..."}
              {modelStatus === "error" && "Model failed to load"}
              {modelStatus === "ready" && !faceDetected && "No face detected"}
              {modelStatus === "ready" && faceDetected && ear && <>EAR: {ear.avgEAR.toFixed(3)}</>}
            </div>
          )}
        </div>

        {/* Status indicator */}
        {cameraActive && (
          <div className="flex items-center justify-center">
            <EyeStatus status={displayStatus} />
          </div>
        )}

        {/* Stats row — only while a session is running */}
        {sessionActive && (
          <div className="w-full grid grid-cols-3 gap-3 py-4 border-y border-gray-100">
            <div className="flex flex-col items-center">
              <StudyTimer elapsedMs={elapsedMs} />
            </div>
            <div className="flex flex-col items-center border-x border-gray-100">
              <AttentionScore score={attentionScore} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">Drowsiness Events</span>
              <span className="text-2xl font-semibold text-gray-800">{drowsyEventCount}</span>
            </div>
          </div>
        )}

        {/* Primary controls */}
        <div className="flex gap-3 w-full justify-center">
          {!sessionActive ? (
            <button
              onClick={handleStartSession}
              className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-sm transition"
            >
              Start Study
            </button>
          ) : (
            <button
              onClick={handleStopSession}
              className="px-8 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-sm transition"
            >
              Stop
            </button>
          )}
          <button
            onClick={stopCamera}
            className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm"
          >
            Stop Camera
          </button>
        </div>
      </div>

      {/* Alert sound settings, in its own card below */}
      <div className="mt-4 flex justify-center">
        <AlertSound
          audioRef={sharedAudioRef}
          onSoundReady={(url) => setAlertUrl(url)}
          volume={volume}
          onVolumeChange={setVolume}
        />
      </div>
    </div>
  );
}