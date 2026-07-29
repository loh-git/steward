// Turns a stored ISO timestamp (e.g. "2026-07-15T09:30:00Z") into something human-readable
// for display, e.g. "15 Jul 2026, 09:30". Used anywhere we show "last updated" for an entry.
export function formatLastUpdated(iso: string | null | undefined): string {
  // No timestamp at all (null/undefined/empty string) just means we've never saved this yet.
  if (!iso) return "no data yet";
  try {
    // en-GB gives us day-month-year ordering (UK date format) rather than the US month-day-year.
    // dateStyle: "medium" -> "15 Jul 2026", timeStyle: "short" -> "09:30".
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    // If iso was some malformed/unparsable string, don't blow up the UI, just fall back
    // to the same "no data yet" message we use for the missing case above.
    return "no data yet";
  }
}
