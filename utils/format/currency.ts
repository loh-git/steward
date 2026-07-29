// Simple function to format a number as a GBP string
export function formatGBP(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Simple function to format a number as positive or negative GBP string
export function formatSignedGBP(amount: number, decimals = 2): string {
  const prefix = amount >= 0 ? "+" : "−";
  return `${prefix}${formatGBP(Math.abs(amount), decimals)}`;
}
