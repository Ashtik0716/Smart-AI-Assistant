export const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_ORIGIN}/api`;

// --- Token storage ---
// localStorage is simple but readable by any script on the page (an XSS risk).
// Fine for this project; httpOnly cookies are the stricter option.
const TOKEN_KEY = "focusai_token";
export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
};
export const clearToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
};

async function request(path, options = {}) {
  const headers = {};
  // For file uploads the browser must set the multipart header itself.
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    // An expired or invalid token mid-session: clear it and tell the app to log out.
    if (res.status === 401 && token && !path.startsWith("/auth/")) {
      clearToken();
      window.dispatchEvent(new Event("focusai:unauthorized"));
    }
    throw new Error(errorBody.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// --- Auth ---
export const registerUser = (name, email, password) =>
  request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
export const loginUser = (email, password) =>
  request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const googleLogin = (credential) =>
  request("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
export const getMe = () => request("/auth/me");

// --- Sessions ---
export const createSession = (sessionData) =>
  request("/sessions", { method: "POST", body: JSON.stringify(sessionData) });
export const getSessions = () => request("/sessions");
export const getSessionById = (id) => request(`/sessions/${id}`);
export const deleteSession = (id) => request(`/sessions/${id}`, { method: "DELETE" });

// --- Settings ---
export const getSettings = () => request("/settings");
export const updateSettings = (settings) =>
  request("/settings", { method: "PUT", body: JSON.stringify(settings) });

// --- Sounds ---
export function uploadSound(file) {
  const formData = new FormData();
  formData.append("sound", file);
  return request("/sounds", { method: "POST", body: formData });
}
export const getSounds = () => request("/sounds");
export const deleteSound = (id) => request(`/sounds/${id}`, { method: "DELETE" });