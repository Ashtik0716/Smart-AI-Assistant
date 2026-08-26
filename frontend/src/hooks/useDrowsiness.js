import { useEffect, useRef, useState } from "react";
import {
  updateDrowsinessState,
  getDisplayStatus,
  STATUS,
} from "../ai/drowsinessDetector";

/**
 * Tracks drowsiness state over time based on live EAR readings.
 * Also counts total drowsiness events (for stats later) and prevents
 * the same continuous drowsy episode from re-triggering repeatedly.
 *
 * @param ear { avgEAR } | null — latest EAR reading from useFaceLandmarker
 * @param settings { earThreshold, drowsyDurationMs, enabled }
 */
export function useDrowsiness(ear, settings, headPitch) {
  const stateRef = useRef(null); // internal drowsiness state machine
  const [status, setStatus] = useState(STATUS.ATTENTIVE);
  const [drowsyEventCount, setDrowsyEventCount] = useState(0);
  const wasDrowsyRef = useRef(false); // tracks episode edges, not just current frame

  useEffect(() => {
    if (!settings.enabled) {
      setStatus(STATUS.ATTENTIVE);
      return;
    }

    const now = performance.now();
    const avgEAR = ear ? ear.avgClosure ?? ear.avgEAR : null;

    const nextState = updateDrowsinessState(
      stateRef.current,
      avgEAR,
      settings.earThreshold,
      settings.drowsyDurationMs,
      now,
      headPitch,
      settings.headPoseEnabled
    );
    stateRef.current = nextState;

    // Count a new "event" only on the OPEN→DROWSY edge, not every
    // frame while still drowsy — otherwise this would fire hundreds
    // of times per second while eyes stay closed.
    if (nextState.isDrowsy && !wasDrowsyRef.current) {
      setDrowsyEventCount((count) => count + 1);
    }
    wasDrowsyRef.current = nextState.isDrowsy;

    setStatus(getDisplayStatus(nextState, settings.drowsyDurationMs, now));
  }, [ear, settings.earThreshold, settings.drowsyDurationMs, settings.enabled, settings.headPoseEnabled, headPitch]);

  return { status, drowsyEventCount, isDrowsy: stateRef.current?.isDrowsy ?? false };
}