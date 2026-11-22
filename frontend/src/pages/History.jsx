import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSessions, deleteSession } from "../services/api";
import { formatDuration, formatDate, scoreTone } from "../utils/format";
import AttentionChart from "../components/AttentionChart";

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    setDeleteError(null);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      setConfirmId(null);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center text-mist">Loading history…</div>;
  if (error) return <div className="p-6 text-center text-red-400">Couldn’t load history: {error}</div>;

  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  const avgAttention = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.attentionScore, 0) / sessions.length)
    : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold">Study history</h1>

      {sessions.length === 0 ? (
        <div className="panel mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="font-semibold">No study sessions yet</p>
          <p className="text-sm text-mist">Start a session and it will show up here when you stop it.</p>
          <Link
            to="/study"
            className="mt-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Start a session
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="panel p-4">
              <p className="text-sm text-mist">Sessions</p>
              <p className="mt-1 text-2xl font-bold">{sessions.length}</p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-mist">Total study time</p>
              <p className="mt-1 text-2xl font-bold">{formatDuration(totalMs)}</p>
            </div>
            <div className="panel p-4">
              <p className="text-sm text-mist">Average attention</p>
              <p className={`mt-1 text-2xl font-bold ${scoreTone(avgAttention)}`}>{avgAttention}%</p>
            </div>
          </div>
          <AttentionChart sessions={sessions} />
          <div className="panel mt-4 overflow-x-auto p-2 sm:p-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-mist">
                  <th scope="col" className="px-3 py-2 font-medium">Started</th>
                  <th scope="col" className="px-3 py-2 font-medium">Duration</th>
                  <th scope="col" className="px-3 py-2 font-medium">Attention</th>
                  <th scope="col" className="px-3 py-2 font-medium">Alerts</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session._id} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-3">{formatDate(session.startedAt)}</td>
                    <td className="px-3 py-3">{formatDuration(session.durationMs)}</td>
                    <td className={`px-3 py-3 font-semibold ${scoreTone(session.attentionScore)}`}>
                      {session.attentionScore}%
                    </td>
                    <td className="px-3 py-3">{session.alertsPlayed}</td>
                    <td className="px-3 py-3 text-right">
                      {confirmId === session._id ? (
                        <span className="inline-flex items-center gap-3 text-xs">
                          <span className="text-mist">Delete?</span>
                          <button
                            onClick={() => handleDelete(session._id)}
                            className="font-semibold text-red-400 hover:text-red-300"
                          >
                            Yes
                          </button>
                          <button onClick={() => setConfirmId(null)} className="text-mist hover:text-white">
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmId(session._id)}
                          className="text-xs font-medium text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              Couldn’t delete that session: {deleteError}
            </p>
          )}
        </>
      )}
    </div>
  );
}