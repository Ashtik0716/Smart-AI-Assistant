import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Manages webcam access: requests permission, attaches the stream
 * to a <video> element, and exposes status so the UI can react to
 * permission errors or a missing camera.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | active | error
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
    } catch (err) {
      setStatus("error");
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Unable to access camera: " + err.message);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  return { videoRef, status, error, startCamera, stopCamera };
}