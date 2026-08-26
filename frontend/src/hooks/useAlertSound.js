import { useRef, useCallback } from "react";

/**
 * Wraps a shared <audio> element so drowsiness detection can trigger
 * playback imperatively, while respecting volume and avoiding
 * overlapping repeat plays while already drowsy (handled by the
 * caller only calling play() on the OPEN→DROWSY edge).
 */
export function useAlertSound() {
  const audioElRef = useRef(null); // set by the AlertSound component
  const soundUrlRef = useRef(null);
  const volumeRef = useRef(0.8);

  const setSound = useCallback((url) => {
    soundUrlRef.current = url;
  }, []);

  const setVolume = useCallback((v) => {
    volumeRef.current = v;
    if (audioElRef.current) audioElRef.current.volume = v;
  }, []);

  const playAlert = useCallback(() => {
    if (!audioElRef.current || !soundUrlRef.current) return;
    audioElRef.current.volume = volumeRef.current;
    audioElRef.current.currentTime = 0;
    audioElRef.current.play().catch(() => {
      // Autoplay can be blocked by the browser if there's been no
      // user interaction yet — in practice, clicking "Start Camera"
      // counts as interaction, so this should rarely fire.
    });
  }, []);

  return { audioElRef, setSound, setVolume, playAlert };
}