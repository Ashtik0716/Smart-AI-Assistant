import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate } from "../utils/format";

// Recharts draws SVG, so these are plain hex values that match the theme tokens.
const COLORS = { grid: "#1b2a4d", axis: "#8e9bbb", brand: "#3b82f6", good: "#34d399" };
const MAX_POINTS = 30;
const TABS = [
  { id: "attention", label: "Attention" },
  { id: "time", label: "Study time" },
];

const shortDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

const axisTick = { fill: COLORS.axis, fontSize: 12 };

function ChartTooltip({ active, payload, metric }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-ink-900 px-3 py-2 text-xs shadow-lg">
      <p className="text-mist">{p.full}</p>
      <p className="mt-1 text-sm font-semibold text-white">
        {metric === "attention" ? `${p.attention}% attention` : `${p.minutes} min`}
      </p>
    </div>
  );
}

export default function AttentionChart({ sessions }) {
  const [metric, setMetric] = useState("attention");

  // The API returns newest first. Charts read left to right, so take the latest
  // sessions and flip them to oldest-first.
  const points = useMemo(
    () =>
      sessions
        .slice(0, MAX_POINTS)
        .reverse()
        .map((s, i) => ({
          n: i + 1,
          label: shortDate(s.startedAt),
          full: formatDate(s.startedAt),
          attention: s.attentionScore,
          minutes: Math.round(s.durationMs / 6000) / 10, // one decimal, so short sessions still show
        })),
    [sessions]
  );

  const xAxis = (
    <XAxis
      dataKey="n"
      tickFormatter={(n) => points[n - 1]?.label}
      tick={axisTick}
      tickLine={false}
      axisLine={{ stroke: COLORS.grid }}
      interval="preserveStartEnd"
      minTickGap={28}
    />
  );

  return (
    <section className="panel mt-4 p-5" aria-labelledby="chart-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="chart-title" className="text-lg font-bold">
          {metric === "attention" ? "Attention over time" : "Study time per session"}
        </h2>
        <div className="inline-flex rounded-full border border-line bg-ink-800 p-1 text-sm" role="group" aria-label="Chart metric">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetric(tab.id)}
              aria-pressed={metric === tab.id}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                metric === tab.id ? "bg-brand text-white" : "text-mist hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {points.length < 2 ? (
        <p className="mt-6 text-sm text-mist">Your chart appears after your second session.</p>
      ) : (
        <>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metric === "attention" ? (
                <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="attentionFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.brand} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={COLORS.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={COLORS.grid} vertical={false} />
                  {xAxis}
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ReferenceLine
                    y={80}
                    stroke={COLORS.good}
                    strokeDasharray="4 4"
                    label={{ value: "80%", position: "insideTopRight", fill: COLORS.good, fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip metric="attention" />} cursor={{ stroke: COLORS.grid }} />
                  <Area
                    type="monotone"
                    dataKey="attention"
                    stroke={COLORS.brand}
                    strokeWidth={2}
                    fill="url(#attentionFill)"
                    dot={{ r: 3, fill: COLORS.brand, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke={COLORS.grid} vertical={false} />
                  {xAxis}
                  <YAxis tickFormatter={(v) => `${v}m`} tick={axisTick} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip metric="time" />} cursor={{ fill: "rgba(59, 130, 246, 0.08)" }} />
                  <Bar dataKey="minutes" fill={COLORS.brand} radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-mist">
            Your last {points.length} sessions, oldest on the left. The table below lists every session.
          </p>
        </>
      )}
    </section>
  );
}