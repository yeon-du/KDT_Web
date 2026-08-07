import { FX_FALLBACK } from "./constants";
import { RatesResponse } from "./types";

// Client-side mock market-data generator. Used in place of a server API
// route because this project is built as a static export (no server
// runtime available). Mirrors the same response shape the original
// dashboard bundle expected (rates-response.json): usdKrw, usdtKrw,
// usdcKrw, kimchiPremium, fxRates, fetchedAt.
//
// Swap this out for a real fetch() call to a market-data provider
// (Coinbase / Upbit / your FX vendor) if you later add a server backend.

const BASE_USD_KRW = 1392;
const BASE_KIMCHI_PREMIUM = 1.15;
// Kept aligned with the app's manual defaults (DEFAULTS.bankSpread /
// DEFAULTS.remittanceSpread in lib/constants.ts) on purpose. An earlier
// version used lower, closer-together base spreads here (0.45 / 0.25),
// which narrowed the gap enough that "실시간 반영" mode made bank exchange
// win far more often than the manual defaults ever would — not a realistic
// live signal, just a miscalibrated mock. Bank exchange still legitimately
// wins for smaller transfers because remittance carries a flat ₩26,000 fee
// that a small transfer can't out-earn via its better spread; that
// crossover (~₩10-15M at these settings) is intentional, not a bug.
const BASE_BANK_SPREAD = 0.6;
const BASE_REMITTANCE_SPREAD = 0.35;

function jitter(base: number, magnitudePct: number) {
  const delta = (Math.random() * 2 - 1) * magnitudePct;
  return base * (1 + delta / 100);
}

export function generateMockRates(): RatesResponse {
  const usdKrw = Math.round(jitter(BASE_USD_KRW, 0.15) * 100) / 100;
  const kimchiPremium = Math.round(jitter(BASE_KIMCHI_PREMIUM, 25) * 100) / 100;
  const usdtKrw = Math.round(usdKrw * (1 + kimchiPremium / 100) * 100) / 100;
  const usdcKrw = Math.round(usdKrw * (1 + (kimchiPremium - 0.05) / 100) * 100) / 100;
  const bankSpread = Math.max(0, Math.round(jitter(BASE_BANK_SPREAD, 15) * 100) / 100);
  const remittanceSpread = Math.max(0, Math.round(jitter(BASE_REMITTANCE_SPREAD, 15) * 100) / 100);

  const fxRates = Object.fromEntries(
    Object.entries(FX_FALLBACK).map(([code, mult]) => [code, jitter(mult, 0.1)])
  ) as RatesResponse["fxRates"];

  return {
    usdKrw,
    usdtKrw,
    usdcKrw,
    kimchiPremium,
    bankSpread,
    remittanceSpread,
    fxRates,
    fetchedAt: new Date().toISOString(),
    source: "mock",
  };
}
