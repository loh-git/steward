"use client";

export default function ItemCountBadge({
  count,
  color,
}: {
  count: number;
  color: "green" | "pink" | "purple";
}) {
  const styles = {
    green: "bg-bottle-100 text-bottle-700",
    pink: "bg-ledger-100 text-ledger-700",
    purple: "bg-brass-100 text-brass-700",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[11px] font-bold ${styles[color]}`}
    >
      {count} Items
    </span>
  );
}
