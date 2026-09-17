export const USD_RATE = 4.08682;

const MYR_CURRENCIES = new Set(["MYR", "RM"]);

export function formatUsd(amount: number | null | undefined, currency: string): string | null {
  if (amount == null || !Number.isFinite(amount) || amount === 0) return null;
  const isMyr = MYR_CURRENCIES.has(currency.toUpperCase());
  const value = isMyr ? amount / USD_RATE : amount;
  const code = isMyr ? "USD" : currency;
  return `${code} ${Math.round(value).toLocaleString("en-US")}`;
}

export function formatUsdRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string
): string | null {
  const low = formatUsd(min, currency);
  const high = formatUsd(max, currency);
  if (!low) return high;
  if (!high || low === high) return low;
  return `${low} – ${high}`;
}