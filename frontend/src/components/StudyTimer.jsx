import { useEffect, useState } from "react";

/**
 * Displays elapsed study time as HH:MM:SS. Purely presentational —
 * receives elapsedMs from the parent so the timer logic lives in one
 * place (Camera.jsx) alongside the session start/stop state.
 */
export default function StudyTimer({ elapsedMs }) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm text-gray-500">Study Time</span>
      <span className="text-2xl font-mono font-semibold">
        {hours}:{minutes}:{seconds}
      </span>
    </div>
  );
}