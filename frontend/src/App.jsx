import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Camera from "./components/Camera";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="flex flex-col items-center pt-8 pb-6">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-indigo-600 transition">
            FocusAI
          </Link>
          <p className="text-sm text-gray-500 mb-4">Smart Study Assistant</p>

          <nav className="flex gap-6 text-sm font-medium">
            <Link to="/" className="text-indigo-600 hover:text-indigo-800">Home</Link>
            <Link to="/study" className="text-indigo-600 hover:text-indigo-800">Study</Link>
            <Link to="/history" className="text-indigo-600 hover:text-indigo-800">History</Link>
            <Link to="/settings" className="text-indigo-600 hover:text-indigo-800">Settings</Link>
          </nav>
        </header>

        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/study" element={<Camera />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}