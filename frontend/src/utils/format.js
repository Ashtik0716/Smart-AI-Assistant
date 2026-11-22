export const formatDuration = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "<1m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const scoreTone = (score) =>
  score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";