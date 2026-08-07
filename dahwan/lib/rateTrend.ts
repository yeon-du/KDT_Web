import { MoodRange } from "./newsSentiment";

// Mock historical series generator for the "환율 추이" view. Reuses the same
// 실시간/하루/일주일 range mechanism as the news-sentiment panel (MoodRange)
// so both views share one range switcher. Not real historical data — this
// is a static export with no server to persist a real time series, so we
// random-walk backward from the app's current live/manual rate. Swap for a
// real FX history fetch if a backend is ever added.

export interface RateTrendPoint {
  t: number; // epoch ms
  label: string;
  rate: number;
}

export interface RateTrendSummary {
  points: RateTrendPoint[];
  changeAbs: number;
  changePct: number;
  high: number;
  low: number;
  source: "real" | "mock";
}

const RANGE_TREND_CONFIG: Record<MoodRange, { count: number; stepMinutes: number; volatilityPct: number }> = {
  live: { count: 24, stepMinutes: 5, volatilityPct: 0.03 },
  "1d": { count: 24, stepMinutes: 60, volatilityPct: 0.1 },
  "7d": { count: 28, stepMinutes: 60 * 6, volatilityPct: 0.3 },
};

function formatLabel(range: MoodRange, date: Date): string {
  return range === "7d"
    ? date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })
    : date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function summarize(points: RateTrendPoint[]): Omit<RateTrendSummary, "source"> {
  const rates = points.map((p) => p.rate);
  const high = Math.max(...rates);
  const low = Math.min(...rates);
  const first = points[0].rate;
  const last = points[points.length - 1].rate;
  const changeAbs = Math.round((last - first) * 100) / 100;
  const changePct = first ? Math.round((changeAbs / first) * 10000) / 100 : 0;
  return { points, changeAbs, changePct, high, low };
}

export function generateMockRateTrend(range: MoodRange, endRate: number): RateTrendSummary {
  const config = RANGE_TREND_CONFIG[range];
  const now = Date.now();

  // Walk backward from the current rate with light mean-reversion so the
  // series stays plausible instead of drifting arbitrarily far.
  const rates: number[] = [endRate];
  for (let i = 1; i < config.count; i++) {
    const prevRate = rates[0];
    const noise = (Math.random() * 2 - 1) * (config.volatilityPct / 100) * prevRate;
    rates.unshift(Math.max(1, prevRate + noise));
  }

  const points: RateTrendPoint[] = rates.map((rate, idx) => {
    const t = now - (config.count - 1 - idx) * config.stepMinutes * 60_000;
    return { t, label: formatLabel(range, new Date(t)), rate: Math.round(rate * 100) / 100 };
  });

  return { ...summarize(points), source: "mock" };
}

// Extends an existing mock series by one point instead of regenerating the
// whole random walk from scratch. Regenerating on every refresh was the bug
// behind "그래프가 너무 급격하게 바뀌는" — each refresh drew an entirely new,
// independent random walk, so the whole chart shape (not just the newest
// point) jumped around every time. Stepping keeps everything before "now"
// stable and just slides the window forward, like a real live chart would.
export function stepMockRateTrend(prev: RateTrendSummary, range: MoodRange, newRate: number): RateTrendSummary {
  const now = Date.now();
  const points = [...prev.points.slice(1), { t: now, label: formatLabel(range, new Date(now)), rate: Math.round(newRate * 100) / 100 }];
  return { ...summarize(points), source: "mock" };
}
