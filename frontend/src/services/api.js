/**
 * Centralized API client for the backend. Every network call the
 * frontend makes goes through here — components import these
 * functions instead of calling fetch() directly, so the base URL
 * and error handling logic live in exactly one place.
 */

const API_BASE = "http://localhost:5000/api";

/**
 * Shared fetch wrapper: parses JSON, throws a readable error on
 * non-2xx responses instead of silently returning bad data.
 */
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: options.body instanceof FormData
      ? undefined // let the browser set multipart headers for file uploads
      : { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// --- Sessions ---

export function createSession(sessionData) {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
}

export function getSessions() {
  return request("/sessions");
}

export function getSessionById(id) {
  return request(`/sessions/${id}`);
}

// --- Settings ---

export function getSettings() {
  return request("/settings");
}

export function updateSettings(settings) {
  return request("/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

// --- Sounds ---

export function uploadSound(file) {
  const formData = new FormData();
  formData.append("sound", file);
  return request("/sounds", {
    method: "POST",
    body: formData,
  });
}

export function getSounds() {
  return request("/sounds");
}

export function deleteSound(id) {
  return request(`/sounds/${id}`, { method: "DELETE" });
}

export function deleteSession(id) {
  return request(`/sessions/${id}`, { method: "DELETE" });
}