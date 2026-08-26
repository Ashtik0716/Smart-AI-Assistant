/**
 * MediaPipe Face Landmarker landmark indices for the eyes.
 * Each eye uses 6 points: [left corner, top-1, top-2, right corner, bottom-2, bottom-1]
 * following the classic 6-point EAR formulation (Soukupová & Čech).
 * These indices are fixed positions in MediaPipe's 478-point face mesh.
 */
export const LEFT_EYE = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE = [263, 387, 385, 362, 380, 373];

/**
 * Euclidean distance between two normalized landmark points.
 * MediaPipe landmarks are normalized (x, y in [0,1] relative to
 * image width/height), which is fine since EAR is a ratio —
 * absolute scale cancels out.
 */
function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the Eye Aspect Ratio for one eye given its 6 landmark points.
 *
 *        p2   p3
 *    p1          p4
 *        p6   p5
 *
 * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 *
 * A wide-open eye has a higher EAR (vertical distances are large
 * relative to the horizontal eye width). A closed eye's vertical
 * distances shrink toward zero, so EAR drops sharply — that drop
 * is what we detect against a threshold.
 */
function calculateEAR(points) {
  const [p1, p2, p3, p4, p5, p6] = points;
  const verticalA = distance(p2, p6);
  const verticalB = distance(p3, p5);
  const horizontal = distance(p1, p4);

  if (horizontal === 0) return 0; // guard against divide-by-zero
  return (verticalA + verticalB) / (2 * horizontal);
}

/**
 * Given MediaPipe's full landmark array for one face, extracts both
 * eyes' points and returns their individual EAR plus the average —
 * averaging both eyes makes the signal more robust to a single eye
 * being partially occluded (e.g. by hair or an odd head angle).
 */
export function getEyeAspectRatio(faceLandmarks) {
  const leftPoints = LEFT_EYE.map((i) => faceLandmarks[i]);
  const rightPoints = RIGHT_EYE.map((i) => faceLandmarks[i]);

  const leftEAR = calculateEAR(leftPoints);
  const rightEAR = calculateEAR(rightPoints);
  const avgEAR = (leftEAR + rightEAR) / 2;

  return { leftEAR, rightEAR, avgEAR };
}