import { useEffect, useState } from "react";
import { getSessions, deleteSession } from "../services/api";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this session? This can't be undone.")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const formatDuration = (ms) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading history...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Failed to load history: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Study History</h2>

      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No study sessions yet — start one to see it here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-left text-sm text-gray-500">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Duration</th>
                <th className="py-2 pr-4">Attention</th>
                <th className="py-2 pr-4">Alerts</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="border-b border-gray-100">
                  <td className="py-2 pr-4">{formatDate(session.startedAt)}</td>
                  <td className="py-2 pr-4">{formatDuration(session.durationMs)}</td>
                  <td className="py-2 pr-4">{session.attentionScore}%</td>
                  <td className="py-2 pr-4">{session.alertsPlayed}</td>
                  <td className="py-2 pr-4 text-right">
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}