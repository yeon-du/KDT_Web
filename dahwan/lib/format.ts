import { CurrencyCode } from "./types";

const krwFormatter = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const usdFormatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatKrw(value: number): string {
  return `${krwFormatter.format(Math.round(value))}원`;
}

export function formatUsd(value: number): string {
  return `$${usdFormatter.format(value)}`;
}

export function formatNumber(value: number): string {
  return krwFormatter.format(value);
}

// For "1 {currency} = X원" style rate displays specifically. JPY's rate is
// naturally small (~9원/엔) — rounding it to a whole number the way
// formatNumber does for amounts loses ~5% of precision (9.53 → "10"). Only
// switches to 2 decimals below 100, so normal-sized rates (USD/EUR/etc,
// typically 1,000+) still render as clean whole numbers.
export function formatRate(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Math.abs(value) < 100
    ? new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : krwFormatter.format(Math.round(value));
}

export function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}
