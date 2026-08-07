import { CurrencyCode } from "./types";
import { MoodRange, NewsSentimentItem, NewsSentimentSummary, NewsStance, moodLabel } from "./newsSentiment";

// Real headlines via Google News RSS search, proxied through rss2json.com
// (free, keyless) purely to add the CORS headers Google's own RSS endpoint
// doesn't send — a static export has no backend to do that server-side, so
// this mirrors the same "free, keyless, CORS-enabled public endpoint"
// pattern lib/realRateTrend.ts already uses for Frankfurter. If rss2json's
// keyless tier is ever rate-limited or unreachable, this just returns null
// and the caller falls back to the mock generator — same graceful-fallback
// shape as the rate trend fetch.
//
// Real articles don't arrive pre-labeled with a stance/score the way the
// mock pool does, and there's no free sentiment-classification API
// available from client-side JS alone. `classify()` below is a plain
// keyword heuristic on the Korean headline text — good enough for a
// "참고 지표" as the app already bills this, not a claim of real NLP.
const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";

const CURRENCY_QUERY: Record<CurrencyCode, string> = {
  USD: "원달러 환율",
  JPY: "원엔 환율",
  EUR: "원유로 환율",
  GBP: "원파운드 환율",
  SGD: "원 싱가포르달러 환율",
  CAD: "원 캐나다달러 환율",
  AUD: "원 호주달러 환율",
};

const WINDOW_MS: Record<MoodRange, number> = {
  // Real FX headlines don't arrive on a fixed cadence — widened past a
  // literal "few hours" so 실시간 usually has enough real volume to show
  // more than 1-2 items.
  live: 6 * 60 * 60_000,
  "1d": 24 * 60 * 60_000,
  "7d": 7 * 24 * 60 * 60_000,
};

const FOREIGN_TERMS = "달러|엔화|엔|유로|파운드|호주달러|캐나다달러|싱가포르달러";
const FOREIGN_UP = new RegExp(`(${FOREIGN_TERMS})\\s*(강세|급등|상승|고점)`);
const FOREIGN_DOWN = new RegExp(`(${FOREIGN_TERMS})\\s*(약세|급락|하락|저점)`);
const KRW_UP = /원화\s*(강세|상승|급등)/;
const KRW_DOWN = /원화\s*(약세|하락|급락)/;

function classify(headline: string): { stance: NewsStance; score: number } {
  if (FOREIGN_UP.test(headline) || KRW_DOWN.test(headline)) return { stance: "foreign_bullish", score: 0.5 };
  if (FOREIGN_DOWN.test(headline) || KRW_UP.test(headline)) return { stance: "krw_bullish", score: -0.5 };
  return { stance: "neutral", score: 0 };
}

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
}

interface Rss2JsonResponse {
  status: string;
  items?: Rss2JsonItem[];
}

export async function fetchRealNewsSentiment(range: MoodRange, currency: CurrencyCode): Promise<NewsSentimentSummary | null> {
  try {
    const query = CURRENCY_QUERY[currency] ?? CURRENCY_QUERY.USD;
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
    const url = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = (await res.json()) as Rss2JsonResponse;
    if (data.status !== "ok" || !data.items?.length) return null;

    const cutoff = Date.now() - WINDOW_MS[range];
    const inWindow = data.items.filter((item) => new Date(item.pubDate).getTime() >= cutoff);
    // A quiet news period can leave the window with very few real items —
    // falling back to "just the most recent ones" beats showing an
    // almost-empty card.
    const pool = inWindow.length >= 4 ? inWindow : data.items;

    const items: NewsSentimentItem[] = pool.slice(0, 12).map((raw, idx) => {
      // Google News RSS titles are formatted "headline - source"; split on
      // the *last* " - " so a hyphen inside the headline itself isn't
      // mistaken for the separator.
      const cut = raw.title.lastIndexOf(" - ");
      const headline = cut > 0 ? raw.title.slice(0, cut) : raw.title;
      const source = cut > 0 ? raw.title.slice(cut + 3) : "Google 뉴스";
      const { stance, score } = classify(headline);
      return {
        id: `real-${currency}-${range}-${idx}-${raw.link}`,
        headline,
        source,
        publishedAt: new Date(raw.pubDate).toISOString(),
        stance,
        score,
        link: raw.link,
        reason:
          stance === "foreign_bullish"
            ? "헤드라인 키워드 기준 외화 강세 방향으로 분류됐어요."
            : stance === "krw_bullish"
              ? "헤드라인 키워드 기준 원화 강세 방향으로 분류됐어요."
              : "헤드라인에서 뚜렷한 방향성을 찾지 못해 중립으로 분류됐어요.",
      };
    });

    if (!items.length) return null;

    const aggregateScore = Math.round((items.reduce((sum, i) => sum + i.score, 0) / items.length) * 100);

    const byTime = [...items].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    const mid = Math.max(1, Math.floor(byTime.length / 2));
    const avg = (arr: NewsSentimentItem[]) => (arr.length ? arr.reduce((s, i) => s + i.score, 0) / arr.length : 0);
    const trendDelta = Math.round((avg(byTime.slice(mid)) - avg(byTime.slice(0, mid))) * 100);
    const trend: NewsSentimentSummary["trend"] = trendDelta > 4 ? "rising" : trendDelta < -4 ? "falling" : "flat";

    return {
      items: items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
      aggregateScore,
      label: moodLabel(aggregateScore, currency),
      updatedAt: new Date().toISOString(),
      trend,
      trendDelta,
      currency,
      source: "real",
    };
  } catch {
    return null;
  }
}
