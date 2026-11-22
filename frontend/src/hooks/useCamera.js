import { useRef, useState, useCallback, useEffect } from "react";

const DENIED =
  "Camera permission was denied. Allow camera access for this site in your browser settings, then try again.";

const MESSAGES = {
  NotAllowedError: DENIED,
  PermissionDeniedError: DENIED,
  NotFoundError: "No camera was found. Check that one is connected and not disabled.",
  NotReadableError:
    "The camera is in use by another app or tab, or the system blocked it. Close anything else using the camera and try again.",
  SecurityError: "The browser blocked camera access for this page.",
};

/**
 * Manages webcam access: requests permission, attaches the stream to a <video>
 * element, and reports a status the UI can show: idle | requesting | active | error.
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    console.log("startCamera called");
    setStatus("requesting");
    setError(null);

    // The camera API only exists on localhost or HTTPS pages.
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("This page can’t use the camera. Open it at http://localhost:5173 or over HTTPS.");
      return false;
    }

    try {
      let stream;
      try {
        console.log("asking the browser for the camera…");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
      } catch (err) {
        // Some webcams reject specific sizes. Retry with no preferences.
        if (err.name !== "OverconstrainedError") throw err;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      console.log("camera stream received");
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setStatus("active");
      return true;
    } catch (err) {
      console.error("Camera error:", err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStatus("error");
      setError(MESSAGES[err.name] || `Unable to access the camera: ${err.message}`);
      return false;
    }
  }, []);
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, []);

  // Release the camera when leaving the page, without touching state.
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    []
  );

  return { videoRef, status, error, startCamera, stopCamera };
}