"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatGBP } from "@/utils/format/currency";
import { ChartIcon } from "./icons";

export type TrendPoint = {
  month: string;
  income: number;
  outgoings: number;
  savings: number;
  remaining: number;
};

type SeriesKey = "income" | "outgoings" | "savings" | "remaining";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "income", label: "Income", color: "#059669" },
  { key: "outgoings", label: "Outgoings", color: "#f43f5e" },
  { key: "savings", label: "Savings", color: "#7c3aed" },
  { key: "remaining", label: "Remaining", color: "#000000" },
];

export default function FinanceTrendChart({
  data,
  subtitle,
}: {
  data: TrendPoint[];
  subtitle: string;
}) {
  // Toggling a series off doesn't remove it from `data`, it just tells the
  // matching <Line> to hide itself — the legend below doubles as the toggle.
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());

  const toggle = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key as SeriesKey)) next.delete(key as SeriesKey);
      else next.add(key as SeriesKey);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <ChartIcon />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Income, Outgoings &amp; Savings</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value: number) => formatGBP(value)}
              width={72}
            />
            <Tooltip formatter={(value) => formatGBP(Number(value))} />
            {/* Clicking a legend entry toggles that line's visibility — doubles
                as the "which series do I want to see" control from the brief,
                without needing separate checkboxes. */}
            <Legend
              onClick={(entry) => toggle(String(entry.dataKey))}
              wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                hide={hidden.has(s.key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
