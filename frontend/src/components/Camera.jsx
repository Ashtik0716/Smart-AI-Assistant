import { useState, useEffect, useRef } from "react";
import { Camera as CameraIcon, Play, Square } from "lucide-react";
import { useCamera } from "../hooks/useCamera";
import { useFaceLandmarker } from "../hooks/useFaceLandmarker";
import { useDrowsiness } from "../hooks/useDrowsiness";
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

const RING = {
  [STATUS.ATTENTIVE]: "border-emerald-400/70",
  [STATUS.POSSIBLY_TIRED]: "border-amber-400",
  [STATUS.DROWSY]: "border-red-500",
  [STATUS.NO_FACE]: "border-slate-500",
};

const DOT = { ok: "bg-emerald-400", warn: "bg-amber-400", bad: "bg-red-500" };

export default function Camera() {
  const { videoRef, status, error, startCamera, stopCamera } = useCamera();
  const cameraActive = status === "active";

  const [alertUrl, setAlertUrl] = useState(null);
  const [volume, setVolume] = useState(0.8);
  const [alertCount, setAlertCount] = useState(0);
  const sharedAudioRef = useRef(null);

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
          headPoseEnabled: data.headPoseEnabled,
        });
        setVolume(data.alertVolume);
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setSettingsLoaded(true));
  }, []);

  const { modelStatus, faceDetected, closure, headPitch } = useFaceLandmarker(
    videoRef,
    cameraActive && settingsLoaded
  );

  const { status: drowsinessStatus, drowsyEventCount, isDrowsy } = useDrowsiness(
    closure,
    {
      earThreshold: detectionSettings.earThreshold,
      drowsyDurationMs: detectionSettings.drowsyDurationMs,
      enabled: detectionSettings.alertsEnabled,
      headPoseEnabled: detectionSettings.headPoseEnabled,
    },
    headPitch
  );

  const displayStatus = !faceDetected ? STATUS.NO_FACE : drowsinessStatus;

  // --- Study session tracking ---
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [drowsyMs, setDrowsyMs] = useState(0);
  const [noFaceMs, setNoFaceMs] = useState(0);
  const tickRef = useRef(null);
  const lastTickRef = useRef(null);

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
      if (isDrowsy) setDrowsyMs((prev) => prev + delta);
      if (!faceDetected) setNoFaceMs((prev) => prev + delta);
    }, 500);
    return () => clearInterval(tickRef.current);
  }, [sessionActive, isDrowsy, faceDetected]);

  const attentiveMs = Math.max(elapsedMs - drowsyMs - noFaceMs, 0);
  const trackedMs = Math.max(elapsedMs - noFaceMs, 0);
  const attentionScore = trackedMs > 0 ? Math.round((attentiveMs / trackedMs) * 100) : 100;

  const handleStartSession = async () => {
    if (!cameraActive) {
      const ok = await startCamera();
      if (!ok) return; // the reason is shown in the camera panel
    }
    setElapsedMs(0);
    setDrowsyMs(0);
    setNoFaceMs(0);
    setAlertCount(0);
    setSessionActive(true);
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

  // --- What the status chip and the video border say ---
  const monitoring = cameraActive && modelStatus === "ready";
  const sessionNote = sessionActive ? "Session running" : "Camera on, session not started";
  const chip = (() => {
    if (status === "error") return { tone: "bad", title: "Camera problem", detail: "Check camera permission" };
    if (status === "requesting") return { tone: "warn", title: "Waiting for the camera", detail: "Allow access if your browser asks" };
    if (!cameraActive) return { tone: "ok", title: "Ready", detail: "Camera is off" };
    if (modelStatus === "loading") return { tone: "warn", title: "Loading AI model", detail: "This takes a few seconds" };
    if (modelStatus === "error") return { tone: "bad", title: "Model failed to load", detail: "Refresh the page" };
    return {
      [STATUS.ATTENTIVE]: { tone: "ok", title: "Attentive", detail: sessionNote },
      [STATUS.POSSIBLY_TIRED]: { tone: "warn", title: "Possibly tired", detail: sessionNote },
      [STATUS.DROWSY]: { tone: "bad", title: "Drowsiness detected", detail: sessionNote },
      [STATUS.NO_FACE]: { tone: "warn", title: "No face detected", detail: sessionNote },
    }[displayStatus];
  })();
  const ring = monitoring ? RING[displayStatus] : "border-line";

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-w-0 flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Study session</h1>
            <p className="mt-2 max-w-xl text-mist">
              Keep this tab open while you study. FocusAI alerts you if your eyes stay closed.
            </p>
          </div>

          <div className="panel flex items-center gap-3 px-4 py-3" role="status" aria-live="polite">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT[chip.tone]}`} aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{chip.title}</p>
              <p className="text-xs text-mist">{chip.detail}</p>
            </div>
          </div>
        </header>

        <div className="panel p-3 sm:p-4">
          <div className={`relative aspect-video overflow-hidden rounded-xl border-2 bg-black transition-colors duration-300 ${ring}`}>
            <video ref={videoRef} className="h-full w-full -scale-x-100 object-cover" playsInline muted />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="mb-1 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-ink-800">
                  <CameraIcon className="h-7 w-7 text-mist" aria-hidden="true" />
                </span>
                {status === "error" ? (
                  <>
                    <p className="font-semibold text-red-300">Can’t access the camera</p>
                    <p className="text-sm text-mist">{error}</p>
                  </>
                ) : status === "requesting" ? (
                  <>
                    <p className="font-semibold">Waiting for the browser…</p>
                    <p className="text-sm text-mist">
                      Choose Allow if a permission prompt appears. If nothing appears, check the camera icon in the address bar.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Camera not started</p>
                    <p className="text-sm text-mist">Click &ldquo;Start Study&rdquo; to begin monitoring</p>
                  </>
                )}
              </div>
            )}

            {monitoring && closure && (
              <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs text-slate-200">
                Eye closure {Math.round(closure.avgClosure * 100)}%
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {!sessionActive ? (
              <button
                onClick={handleStartSession}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-b from-emerald-400 to-emerald-600 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Start Study
              </button>
            ) : (
              <button
                onClick={handleStopSession}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-b from-red-500 to-red-700 px-7 py-3 font-semibold text-white shadow-lg shadow-red-900/40 transition hover:brightness-110"
              >
                <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                Stop Session
              </button>
            )}
            <button
              onClick={stopCamera}
              disabled={!cameraActive || sessionActive}
              title={sessionActive ? "Stop the session first" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-800 px-6 py-3 text-sm font-medium text-mist transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-mist"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Stop Camera
            </button>
          </div>
        </div>

        {sessionActive && (
          <div className="grid grid-cols-3 gap-3">
            <div className="panel flex justify-center py-4"><StudyTimer elapsedMs={elapsedMs} /></div>
            <div className="panel flex justify-center py-4"><AttentionScore score={attentionScore} /></div>
            <div className="panel flex flex-col items-center py-4">
              <span className="text-sm text-gray-500">Drowsiness events</span>
              <span className="text-2xl font-semibold">{drowsyEventCount}</span>
            </div>
          </div>
        )}
      </section>

      <aside>
        <AlertSound
          audioRef={sharedAudioRef}
          onSoundReady={(url) => setAlertUrl(url)}
          volume={volume}
          onVolumeChange={setVolume}
        />
      </aside>
    </div>
  );
}