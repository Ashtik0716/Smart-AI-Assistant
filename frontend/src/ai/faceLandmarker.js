import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );

  const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    delegate: "GPU",
  },
  runningMode: "VIDEO",
  numFaces: 1,
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: true, // NEW: needed for head pose
});

  return faceLandmarker;
}

export function detectFaceForVideo(faceLandmarker, videoElement, timestampMs) {
  return faceLandmarker.detectForVideo(videoElement, timestampMs);
}