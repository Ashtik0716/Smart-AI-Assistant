import { NavLink } from "react-router-dom";
import { CalendarDays, Clock, House, Settings, Sprout } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/study", label: "Study Session", icon: Clock },
  { to: "/history", label: "History", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-brand/20 text-sky-300 ring-1 ring-brand/40"
      : "text-mist hover:bg-ink-800 hover:text-white"
  }`;

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-line bg-ink-900/40 p-4 lg:flex">
      <nav className="flex flex-col gap-1.5" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-ink-900 p-4">
        <Sprout className="h-6 w-6 text-emerald-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium leading-snug">Small steps every day create big results.</p>
        <svg viewBox="0 0 200 60" className="mt-3 h-12 w-full text-emerald-500/30" aria-hidden="true">
          <path d="M0 60 L50 20 L80 45 L120 10 L170 50 L200 30 L200 60 Z" fill="currentColor" />
        </svg>
      </div>
    </aside>
  );
}

// Below the lg breakpoint the sidebar is hidden, so show the same links as a scrolling strip.
export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:hidden" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={(s) => `${linkClass(s)} shrink-0 py-2`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}