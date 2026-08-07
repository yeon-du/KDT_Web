export type CurrencyCode = "USD" | "JPY" | "EUR" | "GBP" | "SGD" | "CAD" | "AUD";

export interface Currency {
  code: CurrencyCode;
  flag: string;
  name: string;
}

export type FrequencyKey = "once" | "monthly" | "quarterly" | "semiannual" | "yearly";

export interface Frequency {
  key: FrequencyKey;
  label: string;
  count: number;
  helper: string;
}

export interface RatesResponse {
  usdKrw: number;
  usdtKrw: number;
  usdcKrw: number;
  kimchiPremium: number;
  // Market-implied cost assumptions — simulated here, but designed to be
  // swapped for real feeds (e.g. published bank FX-buy rates, remittance
  // provider quotes) so the comparison updates itself instead of relying
  // on a manually-set slider.
  bankSpread: number;
  remittanceSpread: number;
  fxRates: Record<CurrencyCode, number>;
  fetchedAt: string;
  // "real" when usdKrw/usdtKrw/usdcKrw/fxRates came from Frankfurter (ECB)
  // + Upbit's public APIs; "mock" when those calls failed/were unavailable
  // and it fell back to the simulated generator. bankSpread/remittanceSpread
  // are always simulated either way — no public feed publishes those.
  source: "real" | "mock";
}

export type RateStatus = "loading" | "live" | "error";

export type RouteKey = "exchange" | "remittance" | "usdt";

export interface RouteDetail {
  label: string;
  value: number;
  color: string;
}

export interface RouteResult {
  key: RouteKey;
  name: string;
  eyebrow: string;
  received: number;
  totalCost: number;
  effectiveRate: number;
  details: RouteDetail[];
  note: string;
  speed: string;
  risk: "낮음" | "높음";
}

export type StableAsset = "USDT" | "USDC";

export interface NetworkDefinition {
  asset: StableAsset;
  network: string;
  standard: string;
  fee: number;
  time: string;
  compatibility: string;
  tone: "green" | "blue" | "purple";
}

export interface NetworkOption extends NetworkDefinition {
  price: number;
  received: number;
  totalCost: number;
  premium: number;
}

export interface AssumptionInputs {
  amount: number;
  usdKrw: number;
  bankSpread: number;
  remittanceSpread: number;
  kimchiPremium: number;
  targetCurrency: CurrencyCode;
  fxRate: number;
}

// Real named remittance/fintech services, modeled from a specific quote
// snapshot the person collected (applied rate + flat fee per provider).
// This is NOT a live feed — there's no public API access to these
// providers from a static-export client app — so spreadPct/feeKrw are
// fixed example values, clearly labeled as such in the UI.
export interface RemittanceProviderDef {
  id: string;
  name: string;
  spreadPct: number;
  feeKrw: number;
  note: string;
}

export interface RemittanceProviderResult extends RemittanceProviderDef {
  appliedRate: number;
  received: number;
  totalCost: number;
}

// Client-only "환율 알림" — no push server exists (static export), so this
// only fires a browser Notification (and, if `email` is set and EmailJS is
// configured, an email too) while the tab is open, checked against the
// same live/manual rate the rest of the app already has in memory.
export interface RateAlert {
  id: string;
  currency: CurrencyCode;
  direction: "above" | "below";
  targetRate: number;
  createdAt: string;
  triggeredAt?: string;
  email?: string;
}
