import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-xl mx-auto px-4 text-center flex flex-col items-center gap-6 py-10">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Stay focused. Study smarter.</h2>
        <p className="text-gray-500">
          FocusAI watches for signs of drowsiness while you study — using your webcam,
          processed entirely in your browser — and gently alerts you before you nod off.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="text-2xl mb-1">👁️</div>
          <h3 className="font-semibold text-gray-800 text-sm">Real-time eye tracking</h3>
          <p className="text-xs text-gray-500 mt-1">Detects prolonged eye closure, not normal blinks.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="text-2xl mb-1">🔔</div>
          <h3 className="font-semibold text-gray-800 text-sm">Custom alerts</h3>
          <p className="text-xs text-gray-500 mt-1">Upload your own sound to wake yourself up.</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="text-2xl mb-1">📊</div>
          <h3 className="font-semibold text-gray-800 text-sm">Track your focus</h3>
          <p className="text-xs text-gray-500 mt-1">See your attention score and history over time.</p>
        </div>
      </div>

      <Link
        to="/study"
        className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition"
      >
        Start Studying
      </Link>

      <p className="text-xs text-gray-400">
        Your webcam video never leaves your browser — only session stats and settings are saved.
      </p>
    </div>
  );
}