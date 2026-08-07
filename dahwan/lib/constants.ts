import { Currency, CurrencyCode, Frequency, NetworkDefinition, RemittanceProviderDef } from "./types";

// EmailJS (https://www.emailjs.com) lets a purely static, serverless site
// (this project uses `output: "export"` — no backend) send real emails
// straight from the browser. Free tier: 200 emails/month. To turn this on:
//   1. Sign up at emailjs.com, add an Email Service (e.g. connect your own
//      Gmail) — that gives you a Service ID.
//   2. Create an Email Template with variables {{to_email}}, {{currency}},
//      {{direction}}, {{target_rate}}, {{current_rate}} in the body — that
//      gives you a Template ID.
//   3. Account → General → find your Public Key.
//   4. Put all three in a local .env.local file (see .env.local.example —
//      NOT committed, already covered by .gitignore's ".env*.local" rule)
//      for local dev, and as GitHub repo Secrets for the deploy workflow to
//      inject at build time. Values are read from env vars below instead of
//      being hardcoded here, so they never end up in source control.
//   5. In EmailJS → Account → Security, restrict allowed origins to your
//      site's domain (e.g. https://yeon-du.github.io) — the Public Key
//      itself isn't a traditional secret (EmailJS is designed to have it
//      shipped in client-side code, the same way a Google Maps API key or
//      Stripe publishable key is), but keeping it out of the repo and
//      origin-restricted is still the right habit, and it's what lets you
//      change/rotate it without touching code.
// Until these are set, email sending is skipped (alerts still work via the
// existing browser Notification, unaffected).
export const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "YOUR_SERVICE_ID";
export const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "YOUR_TEMPLATE_ID";
export const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "YOUR_PUBLIC_KEY";

export const CURRENCIES: Currency[] = [
  { code: "USD", flag: "🇺🇸", name: "미국 달러" },
  { code: "JPY", flag: "🇯🇵", name: "일본 엔" },
  { code: "EUR", flag: "🇪🇺", name: "유로" },
  { code: "GBP", flag: "🇬🇧", name: "영국 파운드" },
  { code: "SGD", flag: "🇸🇬", name: "싱가포르 달러" },
  { code: "CAD", flag: "🇨🇦", name: "캐나다 달러" },
  { code: "AUD", flag: "🇦🇺", name: "호주 달러" },
];

// Fallback USD-relative FX multipliers, used when live rates are unavailable.
export const FX_FALLBACK: Record<CurrencyCode, number> = {
  USD: 1,
  JPY: 146,
  EUR: 0.86,
  GBP: 0.75,
  SGD: 1.28,
  CAD: 1.37,
  AUD: 1.53,
};

export const FREQUENCIES: Frequency[] = [
  { key: "once", label: "이번 한 번", count: 1, helper: "1회 송금" },
  { key: "monthly", label: "매월", count: 12, helper: "연 12회" },
  { key: "quarterly", label: "분기마다", count: 4, helper: "연 4회" },
  { key: "semiannual", label: "반기마다", count: 2, helper: "연 2회" },
  { key: "yearly", label: "매년", count: 1, helper: "연 1회" },
];

export const NETWORK_DEFINITIONS: NetworkDefinition[] = [
  { asset: "USDT", network: "Tron", standard: "TRC-20", fee: 1, time: "1~5분", compatibility: "높음", tone: "green" },
  { asset: "USDT", network: "Solana", standard: "SPL", fee: 0.1, time: "1~3분", compatibility: "보통", tone: "blue" },
  { asset: "USDT", network: "Ethereum", standard: "ERC-20", fee: 3.5, time: "3~15분", compatibility: "높음", tone: "purple" },
  { asset: "USDC", network: "Solana", standard: "SPL", fee: 0.1, time: "1~3분", compatibility: "높음", tone: "blue" },
  { asset: "USDC", network: "Polygon", standard: "PoS", fee: 0.1, time: "2~5분", compatibility: "보통", tone: "purple" },
  { asset: "USDC", network: "Arbitrum", standard: "One", fee: 0.15, time: "2~10분", compatibility: "보통", tone: "blue" },
  { asset: "USDC", network: "Ethereum", standard: "ERC-20", fee: 3.5, time: "3~15분", compatibility: "높음", tone: "purple" },
];

export const AMOUNT_PRESETS = [1_000_000, 5_000_000, 10_000_000, 50_000_000];

export const AMOUNT_MIN = 100_000;
export const AMOUNT_MAX = 500_000_000;

export const DEFAULTS = {
  amount: 15_000_000,
  usdKrw: 1392,
  bankSpread: 0.6,
  remittanceSpread: 0.35,
  kimchiPremium: 1.15,
};

// Flat handling fee for bank exchange. Several banking/fintech apps genuinely
// charge ₩0 for a pure online 외화예금 conversion (spread-only), but not all
// do, and even fee-free apps typically charge something once you actually
// move the converted balance out (withdrawal/wire). Showing a flat ₩0 here
// made the bank route look artificially cheaper than remittance/USDT (which
// both show real flat fees) with nothing to represent that. This is a
// representative estimate, not any one bank's published rate — same
// "clearly-labeled placeholder, not fabricated precision" approach as the
// USDT route's $20 withdrawal fee.
export const BANK_FEE_KRW = 3_000;

// Flat cost of moving fiat off a crypto exchange into an actual bank account
// (SWIFT wire or similar) once you've sold the stablecoin overseas — a real,
// separate cost from the on-chain network fee. Applies regardless of which
// specific coin/network is picked, so it's shared between computeRoutes()'s
// own "auto" USDT simulation and computeCoinOptions() (picked network) to
// keep their totals consistent with each other. $20 is a representative
// flat figure (varies by exchange/withdrawal method; not tied to one
// specific provider).
export const WITHDRAWAL_FEE_USD = 20;

// Modeled from a real quote snapshot (5 named remittance/fintech apps,
// ~1,000,000원 송금 기준) the person collected directly from each
// service. spreadPct is backed out from each provider's applied rate vs.
// the implied mid-market rate at that moment; feeKrw is each provider's
// stated flat fee. These are fixed example values — not a live feed —
// since there's no public API access to these providers from a
// static-export client app. Actual rates move throughout the day and
// promotions change, so the UI labels this clearly as a snapshot example.
export const REMITTANCE_PROVIDERS: RemittanceProviderDef[] = [
  {
    id: "hanpass",
    name: "Hanpass",
    spreadPct: 1.03,
    feeKrw: 0,
    note: "스프레드 중심 · 송금 수수료 없음",
  },
  {
    id: "sentbe",
    name: "Sentbe",
    spreadPct: 1.15,
    feeKrw: 0,
    note: "스프레드 중심 · 송금 수수료 없음",
  },
  {
    id: "wirebarley",
    name: "WireBarley",
    spreadPct: 1.17,
    feeKrw: 0,
    note: "스프레드 중심 · 송금 수수료 없음",
  },
  {
    id: "moin",
    name: "Moin",
    spreadPct: 0.17,
    feeKrw: 12_000,
    note: "스프레드는 거의 없지만 건당 정액 수수료 부과",
  },
  {
    id: "utransfer",
    name: "Utransfer",
    spreadPct: 3.6,
    feeKrw: 5_000,
    note: "스프레드·수수료 모두 상대적으로 높은 편",
  },
];

// Custom monogram badge colors for the remittance-provider icon swap in
// RouteIcon.tsx. These are NOT the companies' official brand colors (no
// scraped/fetched logo assets are used here, to stay clear of trademark
// issues) — just distinct, legible accent colors so each provider is
// visually distinguishable once picked.
export const PROVIDER_BADGES: Record<string, { initial: string; bg: string; fg: string }> = {
  hanpass: { initial: "H", bg: "#ffd166", fg: "#1a2b25" },
  sentbe: { initial: "S", bg: "#8ab4ff", fg: "#0e1f3d" },
  wirebarley: { initial: "W", bg: "#2af5c3", fg: "#0e2b23" },
  moin: { initial: "M", bg: "#ff8a80", fg: "#3a0e0e" },
  utransfer: { initial: "U", bg: "#c9a6ff", fg: "#241338" },
};
