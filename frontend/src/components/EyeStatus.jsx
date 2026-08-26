import { STATUS } from "../ai/drowsinessDetector";

const STATUS_CONFIG = {
  [STATUS.ATTENTIVE]: { emoji: "🟢", label: "Attentive", color: "text-green-600" },
  [STATUS.POSSIBLY_TIRED]: { emoji: "🟡", label: "Possibly tired", color: "text-yellow-600" },
  [STATUS.DROWSY]: { emoji: "🔴", label: "Drowsiness detected", color: "text-red-600" },
  [STATUS.NO_FACE]: { emoji: "⚪", label: "No face detected", color: "text-gray-500" },
};

export default function EyeStatus({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[STATUS.ATTENTIVE];

  return (
    <div className={`flex items-center gap-2 text-lg font-semibold ${config.color}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  );
}