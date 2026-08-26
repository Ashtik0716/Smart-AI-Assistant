/**
 * Reads eye-closure from MediaPipe's blendshape output instead of
 * raw landmark geometry. Blendshapes are trained to represent
 * expression regardless of head pose, so looking down at a notebook
 * no longer gets misread as "eyes closing" the way geometric EAR did.
 *
 * Returns a 0 (fully open) to 1 (fully closed) score, averaged
 * across both eyes.
 */
export function getEyeClosureScore(blendshapesResult) {
  if (!blendshapesResult || blendshapesResult.length === 0) return null;

  const categories = blendshapesResult[0].categories;
  const findScore = (name) => categories.find((c) => c.categoryName === name)?.score ?? 0;

  const leftBlink = findScore("eyeBlinkLeft");
  const rightBlink = findScore("eyeBlinkRight");

  return { leftBlink, rightBlink, avgClosure: (leftBlink + rightBlink) / 2 };
}