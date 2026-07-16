export function formatGBP(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatSignedGBP(amount: number, decimals = 2): string {
  const prefix = amount >= 0 ? "+" : "−";
  return `${prefix}${formatGBP(Math.abs(amount), decimals)}`;
}
