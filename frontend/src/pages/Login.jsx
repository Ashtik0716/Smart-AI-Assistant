import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Brain } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-xl border border-line bg-ink-800 px-3 py-2.5 text-sm text-white placeholder:text-mist focus:outline-none focus:ring-2 focus:ring-brand";

export default function Login() {
  const { user, login, register, googleLogin } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in (or just signed in): leave this page.
  if (user) return <Navigate to={redirectTo} replace />;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/40 bg-brand/10">
          <Brain className="h-6 w-6 text-brand" aria-hidden="true" />
        </span>
        <span className="text-2xl font-extrabold">
          Focus<span className="text-brand">AI</span>
        </span>
      </div>

      <div className="panel flex w-full max-w-sm flex-col gap-4 p-6">
        <h1 className="text-center text-xl font-bold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <div className="flex justify-center">
          <GoogleLogin
            theme="filled_black"
            text={mode === "login" ? "signin_with" : "signup_with"}
            onSuccess={async (res) => {
              setError(null);
              try {
                await googleLogin(res.credential);
              } catch (err) {
                setError(err.message);
              }
            }}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-mist">
          <div className="h-px flex-1 bg-line" />
          or
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Name"
              aria-label="Name"
              value={form.name}
              onChange={update("name")}
              required
              maxLength={80}
              autoComplete="name"
              className={inputClass}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={form.email}
            onChange={update("email")}
            required
            autoComplete="email"
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            aria-label="Password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={mode === "register" ? 8 : undefined}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={inputClass}
          />

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:bg-ink-700 disabled:text-mist"
          >
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-sm text-brand hover:underline"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}