import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Bell, Play, ShieldCheck, Target } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSessions } from "../services/api";
import { formatDuration, formatDate, scoreTone } from "../utils/format";

const STATES = [
    { dot: "bg-emerald-400", title: "Attentive", text: "Eyes open and your face is in view." },
    { dot: "bg-amber-400", title: "Possibly tired", text: "Eyes closed for part of the time you set." },
    { dot: "bg-red-500", title: "Drowsiness detected", text: "Closed for the full time. Your alarm plays." },
    { dot: "bg-slate-500", title: "No face detected", text: "You’re out of frame. This time isn’t scored." },
];

const STEPS = [
    {
        title: "Start a session",
        text: "Your camera opens and the AI model loads in your browser. Your video is never uploaded.",
    },
    {
        title: "Study as usual",
        text: "Blinking is fine. FocusAI only reacts when your eyes stay closed longer than the time you set.",
    },
    {
        title: "Wake up, then review",
        text: "Your alarm plays once per episode. Stop the session to save your attention score.",
    },
];

const FEATURES = [
    { icon: Target, title: "Focus detection", text: "Watches your eyes and head position.", tone: "bg-emerald-500/15 text-emerald-400" },
    { icon: Bell, title: "Smart alerts", text: "Plays the sound you uploaded when your eyes stay closed.", tone: "bg-sky-500/15 text-sky-400" },
    { icon: Activity, title: "Study analytics", text: "Track your attention score session by session.", tone: "bg-violet-500/15 text-violet-400" },
    { icon: ShieldCheck, title: "Privacy first", text: "Only session stats and settings are saved. Video stays on your device.", tone: "bg-amber-500/15 text-amber-400" },
];

export default function Home() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState(null); // null while loading
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        getSessions()
            .then(setSessions)
            .catch(() => setFailed(true));
    }, []);

    const firstName = user?.name?.split(" ")[0];
    const totalMs = sessions ? sessions.reduce((sum, s) => sum + s.durationMs, 0) : 0;
    const avgAttention = sessions?.length
        ? Math.round(sessions.reduce((sum, s) => sum + s.attentionScore, 0) / sessions.length)
        : 0;

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
            {/* Hero + legend */}
            <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                    {firstName && <p className="text-sm text-mist">Welcome back, {firstName}</p>}
                    <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Stay Focused,{" "}
                        <span className="bg-linear-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                            Achieve More
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-mist">
                        FocusAI uses your webcam to notice when your eyes stay closed while you study, then plays the
                        alarm you chose. The video is analysed in your browser and never uploaded.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            to="/study"
                            className="inline-flex items-center gap-2 rounded-full bg-linear-to-b from-emerald-400 to-emerald-600 px-7 py-3 font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:brightness-110"
                        >
                            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                            Start studying
                        </Link>
                        <Link
                            to="/history"
                            className="inline-flex items-center rounded-full border border-line bg-ink-800 px-6 py-3 text-sm font-medium text-mist transition hover:text-white"
                        >
                            View history
                        </Link>
                    </div>
                </div>

                <div className="panel p-5">
                    <h2 className="text-sm font-semibold">What the camera border means</h2>
                    <ul className="mt-4 flex flex-col gap-4">
                        {STATES.map(({ dot, title, text }) => (
                            <li key={title} className="flex items-start gap-3">
                                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
                                <div>
                                    <p className="text-sm font-medium">{title}</p>
                                    <p className="text-xs text-mist">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Progress */}
            {!failed && (
                <section aria-labelledby="progress-title">
                    <h2 id="progress-title" className="text-xl font-bold">Your progress</h2>

                    {sessions === null ? (
                        <p className="mt-4 text-sm text-mist">Loading your progress…</p>
                    ) : sessions.length === 0 ? (
                        <div className="panel mt-4 flex flex-col items-start gap-3 p-6">
                            <p className="font-semibold">No sessions yet</p>
                            <p className="text-sm text-mist">
                                Your first one takes about a minute to set up: allow the camera and press start. You can upload your own alarm any time.
                            </p>
                            <Link to="/study" className="text-sm font-medium text-brand hover:underline">
                                Start your first session
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
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

                            <ul className="panel mt-3 divide-y divide-line/60">
                                {sessions.slice(0, 3).map((s) => (
                                    <li key={s._id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                                        <span>{formatDate(s.startedAt)}</span>
                                        <span className="text-mist">{formatDuration(s.durationMs)}</span>
                                        <span className={`font-semibold ${scoreTone(s.attentionScore)}`}>{s.attentionScore}%</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/history" className="mt-3 inline-block text-sm font-medium text-brand hover:underline">
                                See all sessions
                            </Link>
                        </>
                    )}
                </section>
            )}

            {/* How it works */}
            <section aria-labelledby="how-title">
                <h2 id="how-title" className="text-xl font-bold">How it works</h2>
                <ol className="mt-4 grid gap-3 md:grid-cols-3">
                    {STEPS.map(({ title, text }, i) => (
                        <li key={title} className="panel p-5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-sky-300">
                                {i + 1}
                            </span>
                            <h3 className="mt-3 font-semibold">{title}</h3>
                            <p className="mt-1 text-sm text-mist">{text}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Features */}
            <section aria-labelledby="features-title">
                <h2 id="features-title" className="sr-only">Features</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ icon: Icon, title, text, tone }) => (
                        <li key={title} className="panel p-4">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                            <p className="mt-1 text-sm text-mist">{text}</p>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}