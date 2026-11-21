import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UserMenu from "./components/UserMenu";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Camera from "./components/Camera";
import History from "./pages/History";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <header className="relative flex flex-col items-center pt-8 pb-6">
              <div className="absolute top-4 right-4">
                <UserMenu />
              </div>
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
                <Route path="/login" element={<Login />} />
                <Route path="/study" element={<ProtectedRoute><Camera /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}