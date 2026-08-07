import { RateTrendPoint, RateTrendSummary } from "./rateTrend";
import { CurrencyCode } from "./types";

// Real historical daily exchange rates via Frankfurter (ECB reference
// rates: https://api.frankfurter.dev) — a free, keyless, CORS-enabled
// public API meant for exactly this kind of client-side use, unlike the
// remittance providers' internal calculator APIs which require an
// authenticated app session and don't allow cross-origin browser calls.
//
// Limitation: only one rate per weekday (ECB doesn't publish on weekends
// or EU holidays), so this only covers the "일주일" range. There's no free
// public feed for intraday (실시간/하루) KRW history, so those ranges stay
// on the mock generator in lib/rateTrend.ts.
const FRANKFURTER_BASE = "https://api.frankfurter.dev/v1";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchRealWeeklyTrend(targetCurrency: CurrencyCode): Promise<RateTrendSummary | null> {
  try {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 12); // pad past weekends/holidays for ~7 trading days

    const url = `${FRANKFURTER_BASE}/${isoDate(start)}..${isoDate(end)}?base=${targetCurrency}&symbols=KRW`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json()) as { rates: Record<string, { KRW: number }> };
    const entries = Object.entries(data.rates ?? {}).sort(
      ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
    );
    if (entries.length < 2) return null;

    const points: RateTrendPoint[] = entries.map(([date, v]) => ({
      t: new Date(date).getTime(),
      label: new Date(date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
      rate: Math.round(v.KRW * 100) / 100,
    }));

    const rates = points.map((p) => p.rate);
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const first = points[0].rate;
    const last = points[points.length - 1].rate;
    const changeAbs = Math.round((last - first) * 100) / 100;
    const changePct = first ? Math.round((changeAbs / first) * 10000) / 100 : 0;

    return { points, high, low, changeAbs, changePct, source: "real" };
  } catch {
    return null;
  }
}
