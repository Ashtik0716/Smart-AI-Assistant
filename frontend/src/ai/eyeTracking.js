import { LEFT_EYE, RIGHT_EYE } from "./eyeAspectRatio";

/**
 * Returns the raw {x, y} points for both eyes from a full face
 * landmark array — used for optional on-screen visualization.
 */
export function getEyePoints(faceLandmarks) {
  return {
    left: LEFT_EYE.map((i) => faceLandmarks[i]),
    right: RIGHT_EYE.map((i) => faceLandmarks[i]),
  };
}