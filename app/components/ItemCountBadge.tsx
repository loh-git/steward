"use client";

export default function ItemCountBadge({
  count,
  color,
}: {
  count: number;
  color: "green" | "pink" | "purple";
}) {
  const styles = {
    green: "bg-emerald-100 text-emerald-700",
    pink: "bg-rose-100 text-rose-700",
    purple: "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${styles[color]}`}
    >
      {count} Items
    </span>
  );
}
