import { useEffect, useRef, useState, useCallback } from "react";
import { createFaceLandmarker, detectFaceForVideo } from "../ai/faceLandmarker";
import { getEyeAspectRatio } from "../ai/eyeAspectRatio";
import { getEyeClosureScore } from "../ai/eyeClosureScore";
import { getHeadPitch } from "../ai/headPose";

const DETECTION_INTERVAL_MS = 100; // run detection ~10x/sec instead of ~60x/sec

export function useFaceLandmarker(videoRef, active) {
  const landmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const lastRunRef = useRef(0); // NEW: tracks last detection timestamp for throttling
  const [modelStatus, setModelStatus] = useState("loading");
  const [faceDetected, setFaceDetected] = useState(false);
  const [ear, setEar] = useState(null);
  const [closure, setClosure] = useState(null);
  const [headPitch, setHeadPitch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    createFaceLandmarker()
      .then((landmarker) => {
        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setModelStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setModelStatus("error");
      });
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
    };
  }, []);

  const loop = useCallback((now) => {
    // Keep the animation frame chain running smoothly, but only do
    // the expensive detection + state updates every DETECTION_INTERVAL_MS.
    if (now - lastRunRef.current >= DETECTION_INTERVAL_MS) {
      lastRunRef.current = now;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        const detection = detectFaceForVideo(landmarker, video, now);
        const hasFace = detection.faceLandmarks.length > 0;

        setFaceDetected(hasFace);

        if (hasFace) {
          setEar(getEyeAspectRatio(detection.faceLandmarks[0]));
          setClosure(getEyeClosureScore(detection.faceBlendshapes));
          setHeadPitch(getHeadPitch(detection.facialTransformationMatrixes)); // NEW
        } else {
          setEar(null);
          setClosure(null);
          setHeadPitch(null); // NEW
        }
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef]);

  useEffect(() => {
    if (active && modelStatus === "ready") {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, modelStatus, loop]);

  return { modelStatus, faceDetected, ear, closure, headPitch };
}