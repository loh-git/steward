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
  ReferenceLine,
} from "recharts";
import { formatGBP } from "@/utils/format/currency";
import { ChartIcon } from "./icons";

export type TrendPoint = {
  month: string;
  /** Full month and year, e.g. "October 2026" (the axis only has room for "Oct"). */
  label: string;
  income: number;
  outgoings: number;
  savings: number;
  remaining: number;
};

type SeriesKey = "income" | "outgoings" | "savings" | "remaining";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "income", label: "Income", color: "#1f5940" },
  { key: "outgoings", label: "Outgoings", color: "#a32638" },
  { key: "savings", label: "Savings", color: "#9c7a2e" },
  { key: "remaining", label: "Remaining", color: "#1a1714" },
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

  // Mobile only: which month the panel under the chart describes. A tooltip under a finger would
  // cover the lines, so on phones the hover tooltip is hidden and tapping or dragging along the
  // chart moves this selection instead. Larger screens keep the hover tooltip and never show the
  // panel. Defaults to the first month so the panel is never empty.
  const [selected, setSelected] = useState(0);
  const selectedPoint = data[selected] ?? data[0];

  const toggle = (key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key as SeriesKey)) next.delete(key as SeriesKey);
      else next.add(key as SeriesKey);
      return next;
    });
  };

  const selectFromChart = (state: { activeIndex?: unknown }) => {
    const index = Number(state.activeIndex);
    if (Number.isInteger(index) && data[index]) setSelected(index);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-ink-200 bg-paper-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-ink-800">
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-ledger-100 text-ledger-700 sm:flex">
            <ChartIcon />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Income, Outgoings &amp; Savings</h2>
            <p className="text-xs text-ink-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            onClick={selectFromChart}
            onMouseMove={selectFromChart}
            onTouchMove={selectFromChart}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#d9d3c7" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#716758" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#716758" }}
              tickFormatter={(value: number) => formatGBP(value)}
              width={72}
            />
            <Tooltip formatter={(value) => formatGBP(Number(value))} />
            {/* Marks the month the mobile panel below describes. Phones only. */}
            {selectedPoint ? (
              <ReferenceLine
                x={selectedPoint.month}
                stroke="#716758"
                strokeDasharray="4 3"
                className="sm:hidden"
              />
            ) : null}
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

      {selectedPoint ? (
        <div className="mt-4 rounded-md bg-ink-50 p-3 sm:hidden" aria-live="polite">
          <p className="font-display text-base font-semibold text-ink-900">
            {selectedPoint.label}
          </p>
          <dl className="mt-2 flex flex-col gap-2 text-sm">
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-ink-700">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </dt>
                <dd className="font-semibold text-ink-900">{formatGBP(selectedPoint[s.key])}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-ink-600">Tap or drag along the chart to change month</p>
        </div>
      ) : null}
    </div>
  );
}
