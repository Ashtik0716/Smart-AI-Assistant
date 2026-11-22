import { Link } from "react-router-dom";
import { Brain, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function initials(name = "") {
  return (
    name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?"
  );
}

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-line bg-ink-900/60 px-4 py-3 backdrop-blur sm:px-6">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/40 bg-brand/10">
          <Brain className="h-6 w-6 text-brand" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-xl font-extrabold">
            Focus<span className="text-brand">AI</span>
          </span>
          <span className="block text-xs text-mist">Smart Study Assistant</span>
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-ink-950">
                {initials(user.name)}
              </span>
            )}
            <span className="hidden text-sm font-semibold uppercase tracking-wide sm:inline">{user.name}</span>
          </div>
          <span className="hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
          <button
            onClick={logout}
            aria-label="Log out"
            className="inline-flex items-center gap-2 text-sm text-mist transition hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      )}
    </header>
  );
}