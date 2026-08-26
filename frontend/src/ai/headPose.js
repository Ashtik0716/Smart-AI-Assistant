/**
 * Extracts head pitch (forward/backward nod angle) from MediaPipe's
 * 4x4 facial transformation matrix. This matrix encodes the face's
 * 3D rotation relative to the camera; we only need the pitch component
 * since forward head droop is the relevant drowsiness signal (not
 * left/right turning or tilting).
 *
 * Returns pitch in degrees. Positive = looking down, negative = looking up.
 */
export function getHeadPitch(transformationMatrixes) {
  if (!transformationMatrixes || transformationMatrixes.length === 0) return null;

  const matrix = transformationMatrixes[0].data; // 16 numbers, column-major 4x4

  // Standard pitch extraction from a rotation matrix:
  // matrix indices for a column-major 4x4 map row/col as: m[col*4 + row]
  const m9 = matrix[9]; // R[2][1]
  const m10 = matrix[10]; // R[2][2]

  const pitchRadians = Math.atan2(-m9, m10);
  return pitchRadians * (180 / Math.PI);
}