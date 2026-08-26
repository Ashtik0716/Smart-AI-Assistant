/**
 * Pure state-machine logic for drowsiness detection, kept separate
 * from React so it's easy to reason about and test independently.
 *
 * Call `updateDrowsinessState(prevState, avgEAR, thresholds, now)` on
 * every frame. It returns the new state — it does NOT use timers or
 * side effects, so it's deterministic and easy to debug.
 */

export const EYE_STATE = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
};

export const STATUS = {
  ATTENTIVE: "ATTENTIVE", // 🟢
  POSSIBLY_TIRED: "POSSIBLY_TIRED", // 🟡
  DROWSY: "DROWSY", // 🔴
  NO_FACE: "NO_FACE",
};

/**
 * @param prevState { eyeState, closedSince, isDrowsy } | null
 * @param avgEAR current average EAR reading, or null if no face detected
 * @param earThreshold below this EAR, eyes are considered closed
 * @param drowsyDurationMs how long eyes must stay closed to trigger drowsy
 * @param now current timestamp (ms), e.g. performance.now()
 */

const HEAD_DROOP_THRESHOLD_DEGREES = 25; // pitch beyond this = head drooping forward

export function updateDrowsinessState(
  prevState,
  avgEAR,
  earThreshold,
  drowsyDurationMs,
  now,
  headPitch = null,
  headPoseEnabled = false
) {
  if (avgEAR === null) {
    return {
      eyeState: prevState?.eyeState ?? EYE_STATE.OPEN,
      closedSince: prevState?.closedSince ?? null,
      isDrowsy: false,
    };
  }

  const eyesClosedByEAR = avgEAR > earThreshold;
  const headDrooping = headPoseEnabled && headPitch !== null && headPitch > HEAD_DROOP_THRESHOLD_DEGREES;

  // Either signal counts as "closed/drowsy state" — head droop alone
  // (even with eyes technically open, which can happen right as
  // someone's head falls) also starts the timer.
  const eyesClosedNow = eyesClosedByEAR || headDrooping;

  if (eyesClosedNow) {
    const closedSince = prevState?.eyeState === EYE_STATE.CLOSED
      ? prevState.closedSince
      : now;

    const closedDuration = now - closedSince;
    const isDrowsy = closedDuration >= drowsyDurationMs;

    return { eyeState: EYE_STATE.CLOSED, closedSince, isDrowsy };
  }

  return { eyeState: EYE_STATE.OPEN, closedSince: null, isDrowsy: false };
}

export function getDisplayStatus(state, drowsyDurationMs, now) {
  if (!state || state.eyeState === EYE_STATE.OPEN) return STATUS.ATTENTIVE;
  if (state.isDrowsy) return STATUS.DROWSY;

  const closedDuration = now - state.closedSince;
  if (closedDuration > drowsyDurationMs * 0.4) return STATUS.POSSIBLY_TIRED;

  return STATUS.ATTENTIVE;
}