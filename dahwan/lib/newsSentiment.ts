import { CurrencyCode } from "./types";

// "foreign_bullish" = the selected foreign currency strengthening vs KRW
// (원/외화 환율 상승 요인), "krw_bullish" = KRW strengthening (환율 하락 요인).
export type NewsStance = "foreign_bullish" | "krw_bullish" | "neutral";

export interface NewsSentimentItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string; // ISO
  stance: NewsStance;
  score: number; // -1 (원화 강세) ~ 1 (외화 강세)
  reason: string;
  link?: string; // original article URL — only set for real (non-mock) items
}

export type MoodRange = "live" | "1d" | "7d";

export const MOOD_RANGES: { key: MoodRange; label: string }[] = [
  { key: "live", label: "실시간" },
  { key: "1d", label: "하루" },
  { key: "7d", label: "일주일" },
];

export const RANGE_CONFIG: Record<MoodRange, { count: number; spanMinutes: number }> = {
  live: { count: 5, spanMinutes: 180 },
  "1d": { count: 8, spanMinutes: 60 * 24 },
  "7d": { count: 12, spanMinutes: 60 * 24 * 7 },
};

export interface NewsSentimentSummary {
  items: NewsSentimentItem[];
  aggregateScore: number; // -100 ~ 100
  label: string;
  updatedAt: string;
  // Where sentiment appears to be heading vs the prior period — for a
  // money-move decision, the trajectory matters as much as the snapshot.
  trend: "rising" | "falling" | "flat";
  trendDelta: number;
  currency: CurrencyCode;
  source: "real" | "mock";
}

// Short, natural-sounding Korean label per currency, used in headline
// reasons and the mood gauge label (e.g. "엔화 강세 우위" rather than the
// stiffer "JPY 강세 우위").
export const CURRENCY_SHORT_LABEL: Record<CurrencyCode, string> = {
  USD: "달러",
  JPY: "엔화",
  EUR: "유로화",
  GBP: "파운드화",
  SGD: "싱가포르달러",
  CAD: "캐나다달러",
  AUD: "호주달러",
};

type HeadlineSeed = Omit<NewsSentimentItem, "id" | "publishedAt">;

// Prototype-stage mock headline pools, one per supported currency, so
// switching "받는 통화" also switches which macro narrative drives the
// sentiment feed instead of always showing USD-centric headlines. In
// production this would be replaced by a scheduled job that pulls real
// FX-related headlines (Naver News API / RSS) per currency and classifies
// each with an LLM or Korean sentiment model.
const HEADLINE_POOLS: Record<CurrencyCode, HeadlineSeed[]> = {
  USD: [
    {
      headline: "美 연준, 추가 금리 인상 가능성 시사…달러 강세 압력",
      source: "연합인포맥스",
      stance: "foreign_bullish",
      score: 0.7,
      reason: "금리 인상 기대는 달러 매력도를 높여 원/달러 상승 압력으로 작용해요.",
    },
    {
      headline: "무역수지 3개월 연속 흑자…원화 강세 요인 부각",
      source: "한국경제",
      stance: "krw_bullish",
      score: -0.6,
      reason: "수출 흑자 확대는 달러 공급을 늘려 원화 강세 재료로 해석돼요.",
    },
    {
      headline: "외국인 순매수 이어져…코스피·원화 동반 강세",
      source: "매일경제",
      stance: "krw_bullish",
      score: -0.5,
      reason: "외국인 자금 유입은 원화 수요를 늘리는 요인으로 꼽혀요.",
    },
    {
      headline: "중동 리스크 재부각…안전자산 선호에 달러 강세",
      source: "이데일리",
      stance: "foreign_bullish",
      score: 0.65,
      reason: "지정학적 불안은 대표적 안전자산인 달러 수요를 키워요.",
    },
    {
      headline: "한국은행, 기준금리 동결…환율 영향은 제한적",
      source: "연합뉴스",
      stance: "neutral",
      score: 0.05,
      reason: "예상된 동결로 시장 영향은 크지 않은 것으로 평가돼요.",
    },
    {
      headline: "미국 고용지표 예상치 하회…달러 약세 전환",
      source: "블룸버그",
      stance: "krw_bullish",
      score: -0.55,
      reason: "고용 둔화는 금리 인하 기대를 키워 달러 약세로 이어질 수 있어요.",
    },
    {
      headline: "중국 경기 둔화 우려…신흥국 통화 동반 약세",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "중국발 불확실성은 원화를 포함한 신흥국 통화 약세 압력으로 작용해요.",
    },
    {
      headline: "반도체 수출 호조…경상수지 개선 기대",
      source: "서울경제",
      stance: "krw_bullish",
      score: -0.45,
      reason: "주력 수출 품목 호조는 원화 강세 재료로 언급돼요.",
    },
    {
      headline: "달러인덱스 연고점 경신…글로벌 강달러 지속",
      source: "인베스팅닷컴",
      stance: "foreign_bullish",
      score: 0.75,
      reason: "달러인덱스 상승은 원/달러 환율에도 동반 상승 압력을 줘요.",
    },
    {
      headline: "외환당국, 변동성 확대 시 미세조정 가능성 시사",
      source: "기획재정부",
      stance: "neutral",
      score: -0.05,
      reason: "구두 개입성 발언으로 단기 변동성을 완화하는 요인이에요.",
    },
    {
      headline: "글로벌 금값 급등…안전자산 선호 심리 확산",
      source: "파이낸셜뉴스",
      stance: "foreign_bullish",
      score: 0.3,
      reason: "위험회피 심리 확산은 통상 달러 강세와 함께 나타나요.",
    },
    {
      headline: "국내 증시로 외국인 자금 유입 재개",
      source: "조선비즈",
      stance: "krw_bullish",
      score: -0.4,
      reason: "증시 자금 유입은 원화 매수 수요로 이어질 수 있어요.",
    },
  ],
  JPY: [
    {
      headline: "일본은행, 마이너스 금리 정책 정상화 시사…엔화 강세 기대",
      source: "연합인포맥스",
      stance: "foreign_bullish",
      score: 0.65,
      reason: "금리 정상화는 엔화 자산 매력을 높여 강세 압력으로 작용해요.",
    },
    {
      headline: "엔캐리 트레이드 청산 우려 확대…엔화 변동성 커져",
      source: "한국경제",
      stance: "foreign_bullish",
      score: 0.55,
      reason: "저금리를 이용한 엔 매도 포지션이 청산되면 엔화가 강세를 보일 수 있어요.",
    },
    {
      headline: "미·일 금리차 축소 전망…엔화 매력도 상승",
      source: "매일경제",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "금리차가 좁혀지면 엔 캐리 수요가 줄어 엔화 강세로 이어질 수 있어요.",
    },
    {
      headline: "일본 무역적자 지속…엔저 압력 여전",
      source: "이데일리",
      stance: "krw_bullish",
      score: -0.5,
      reason: "무역적자는 엔화 매도 압력으로 작용해 원/엔 환율 하락 요인이 돼요.",
    },
    {
      headline: "일본 근원물가 둔화…추가 긴축 신중론",
      source: "블룸버그",
      stance: "krw_bullish",
      score: -0.4,
      reason: "물가 둔화는 금리 인상 속도를 늦춰 엔화 약세 재료로 해석돼요.",
    },
    {
      headline: "일본 정부, 엔저 구두개입 강도 높여",
      source: "니혼게이자이",
      stance: "foreign_bullish",
      score: 0.45,
      reason: "당국의 구두개입은 단기적으로 엔화 강세를 유도하려는 신호예요.",
    },
    {
      headline: "일본 수출기업 실적 호조…엔저 수혜 지속",
      source: "조선비즈",
      stance: "krw_bullish",
      score: -0.35,
      reason: "엔저가 기업 실적에 유리하게 작용해 정책 전환 유인이 낮아질 수 있어요.",
    },
    {
      headline: "글로벌 안전자산 선호 확산…엔화 동반 강세",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.6,
      reason: "엔화도 전통적인 안전자산으로 꼽혀 위험회피 심리에 강세를 보여요.",
    },
    {
      headline: "일본은행 총재 발언 예정…시장 관망세",
      source: "연합뉴스",
      stance: "neutral",
      score: 0.05,
      reason: "정책 방향 확인 전까지는 큰 변동성 없이 관망하는 분위기예요.",
    },
  ],
  EUR: [
    {
      headline: "ECB, 추가 금리 인하 신중론 부각…유로 강세",
      source: "연합인포맥스",
      stance: "foreign_bullish",
      score: 0.6,
      reason: "긴축 유지 기대는 유로화 매력도를 높이는 요인이에요.",
    },
    {
      headline: "독일 제조업 지표 부진…유로존 경기 둔화 우려",
      source: "로이터",
      stance: "krw_bullish",
      score: -0.5,
      reason: "경기 둔화 우려는 유로화 약세 재료로 해석돼요.",
    },
    {
      headline: "유로존 인플레이션 목표치 근접…통화정책 정상화 기대",
      source: "블룸버그",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "물가 안정은 ECB의 정책 여력을 넓혀 유로 강세 요인이 될 수 있어요.",
    },
    {
      headline: "유로존 실업률 반등…경기 회복 지연 신호",
      source: "매일경제",
      stance: "krw_bullish",
      score: -0.45,
      reason: "고용 둔화는 유로화 약세 압력으로 작용할 수 있어요.",
    },
    {
      headline: "유로존 무역수지 흑자 확대",
      source: "이데일리",
      stance: "foreign_bullish",
      score: 0.4,
      reason: "무역흑자 확대는 유로화 수요를 늘리는 요인이에요.",
    },
    {
      headline: "독일 국채금리 상승…유로화 동반 강세",
      source: "인베스팅닷컴",
      stance: "foreign_bullish",
      score: 0.55,
      reason: "금리 상승은 유로존 자산의 상대적 매력을 높여요.",
    },
    {
      headline: "유럽 에너지 가격 재상승…경상수지 부담",
      source: "파이낸셜뉴스",
      stance: "krw_bullish",
      score: -0.4,
      reason: "에너지 수입 부담 증가는 유로화 약세 재료로 꼽혀요.",
    },
    {
      headline: "ECB 위원, 신중한 정책 기조 재확인",
      source: "연합뉴스",
      stance: "neutral",
      score: 0.0,
      reason: "예상 수준의 발언으로 시장 영향은 제한적이에요.",
    },
  ],
  GBP: [
    {
      headline: "영란은행, 금리 동결 속 매파적 발언…파운드 강세",
      source: "연합인포맥스",
      stance: "foreign_bullish",
      score: 0.6,
      reason: "매파적 신호는 파운드화 강세 압력으로 이어질 수 있어요.",
    },
    {
      headline: "영국 소비자물가 상승률 둔화",
      source: "블룸버그",
      stance: "krw_bullish",
      score: -0.45,
      reason: "물가 둔화는 금리 인하 기대를 키워 파운드 약세 요인이 돼요.",
    },
    {
      headline: "영국 소매판매 예상치 상회…경기 회복 기대",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "소비 개선은 파운드화 강세 재료로 해석돼요.",
    },
    {
      headline: "영국 GDP 성장률 부진…경기 침체 우려",
      source: "이데일리",
      stance: "krw_bullish",
      score: -0.5,
      reason: "성장 둔화 우려는 파운드화 약세 압력으로 작용해요.",
    },
    {
      headline: "런던 금융시장, 안전자산 선호에 파운드 강세",
      source: "파이낸셜뉴스",
      stance: "foreign_bullish",
      score: 0.4,
      reason: "글로벌 위험회피 심리 속에 파운드화도 일부 강세를 보일 수 있어요.",
    },
    {
      headline: "영국 무역적자 확대…파운드 약세 재료",
      source: "매일경제",
      stance: "krw_bullish",
      score: -0.4,
      reason: "무역적자 확대는 파운드화 수요를 낮추는 요인이에요.",
    },
    {
      headline: "영란은행 위원 발언 엇갈려…시장 혼조",
      source: "연합뉴스",
      stance: "neutral",
      score: 0.05,
      reason: "위원별 견해차로 방향성이 뚜렷하지 않은 상황이에요.",
    },
  ],
  SGD: [
    {
      headline: "싱가포르 통화청, 정책밴드 유지…싱가포르달러 안정",
      source: "연합인포맥스",
      stance: "neutral",
      score: 0.1,
      reason: "정책 유지로 큰 변동 없이 안정적인 흐름이 예상돼요.",
    },
    {
      headline: "싱가포르 비석유 수출 호조",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "수출 개선은 싱가포르달러 강세 재료로 해석돼요.",
    },
    {
      headline: "아시아 금융허브로 자금 유입 확대",
      source: "블룸버그",
      stance: "foreign_bullish",
      score: 0.55,
      reason: "역내 자금 유입 확대는 싱가포르달러 수요를 높이는 요인이에요.",
    },
    {
      headline: "싱가포르 물가상승률 둔화",
      source: "이데일리",
      stance: "krw_bullish",
      score: -0.35,
      reason: "물가 둔화는 긴축 기대를 낮춰 통화 강세 압력을 완화할 수 있어요.",
    },
    {
      headline: "중국 경기 둔화, 역내 교역국 통화에 부담",
      source: "매일경제",
      stance: "krw_bullish",
      score: -0.45,
      reason: "주요 교역국인 중국의 둔화는 싱가포르달러에도 부담 요인이에요.",
    },
    {
      headline: "싱가포르 제조업 PMI 확장세 지속",
      source: "파이낸셜뉴스",
      stance: "foreign_bullish",
      score: 0.4,
      reason: "제조업 경기 확장은 통화 강세를 뒷받침하는 요인이에요.",
    },
    {
      headline: "역내 채권으로 외국인 자금 유입",
      source: "인베스팅닷컴",
      stance: "foreign_bullish",
      score: 0.35,
      reason: "채권 자금 유입은 싱가포르달러 수요 증가로 이어질 수 있어요.",
    },
  ],
  CAD: [
    {
      headline: "캐나다은행, 금리 동결…통화정책 신중 기조",
      source: "연합인포맥스",
      stance: "neutral",
      score: 0.05,
      reason: "예상된 동결로 시장 영향은 제한적인 편이에요.",
    },
    {
      headline: "국제 유가 급등…오일머니 캐나다달러 강세",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.65,
      reason: "캐나다는 주요 산유국이라 유가 상승이 통화 강세로 직결되는 경우가 많아요.",
    },
    {
      headline: "캐나다 고용지표 예상치 상회",
      source: "블룸버그",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "고용 개선은 캐나다달러 강세 재료로 해석돼요.",
    },
    {
      headline: "국제 유가 하락 전환…캐나다달러 약세 압력",
      source: "이데일리",
      stance: "krw_bullish",
      score: -0.55,
      reason: "유가 하락은 원자재 통화인 캐나다달러에 약세 요인으로 작용해요.",
    },
    {
      headline: "캐나다 주택시장 냉각 지속",
      source: "매일경제",
      stance: "krw_bullish",
      score: -0.4,
      reason: "주택경기 둔화는 캐나다달러 약세 재료로 꼽혀요.",
    },
    {
      headline: "미·캐나다 교역 확대…경상수지 개선",
      source: "파이낸셜뉴스",
      stance: "foreign_bullish",
      score: 0.4,
      reason: "교역 확대에 따른 경상수지 개선은 통화 강세 요인이에요.",
    },
    {
      headline: "캐나다 물가상승률 목표치 상회",
      source: "연합뉴스",
      stance: "foreign_bullish",
      score: 0.35,
      reason: "물가 상승은 추가 긴축 기대를 키워 통화 강세로 이어질 수 있어요.",
    },
  ],
  AUD: [
    {
      headline: "호주중앙은행, 매파적 금리 동결…호주달러 강세",
      source: "연합인포맥스",
      stance: "foreign_bullish",
      score: 0.6,
      reason: "매파적 신호는 호주달러 강세 압력으로 이어질 수 있어요.",
    },
    {
      headline: "철광석 가격 급등…원자재 통화 호주달러 강세",
      source: "로이터",
      stance: "foreign_bullish",
      score: 0.65,
      reason: "호주는 주요 자원 수출국이라 원자재 가격 상승이 통화 강세로 이어져요.",
    },
    {
      headline: "중국 경기 둔화 우려…호주달러 약세 압력",
      source: "블룸버그",
      stance: "krw_bullish",
      score: -0.55,
      reason: "최대 교역국인 중국의 경기 둔화는 호주달러에 부담 요인이에요.",
    },
    {
      headline: "호주 고용지표 서프라이즈…경기 호조",
      source: "매일경제",
      stance: "foreign_bullish",
      score: 0.5,
      reason: "고용 개선은 호주달러 강세 재료로 해석돼요.",
    },
    {
      headline: "철광석 가격 조정…자원 수출 둔화 우려",
      source: "이데일리",
      stance: "krw_bullish",
      score: -0.45,
      reason: "핵심 수출품 가격 하락은 호주달러 약세 압력으로 작용해요.",
    },
    {
      headline: "호주 소비자물가 둔화…금리 인하 기대 확산",
      source: "파이낸셜뉴스",
      stance: "krw_bullish",
      score: -0.4,
      reason: "물가 둔화에 따른 금리 인하 기대는 호주달러 약세 요인이에요.",
    },
    {
      headline: "호주 무역수지 흑자 확대",
      source: "인베스팅닷컴",
      stance: "foreign_bullish",
      score: 0.4,
      reason: "무역흑자 확대는 호주달러 수요를 늘리는 요인이에요.",
    },
  ],
};

function mulberry32(seed: number) {
  let s = seed | 0;
  return function rng() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

const BUCKET_MS: Record<MoodRange, number> = {
  live: 5 * 60_000,
  "1d": 60 * 60_000,
  "7d": 24 * 60 * 60_000,
};

function timeBucket(range: MoodRange): number {
  return Math.floor(Date.now() / BUCKET_MS[range]);
}

function seededSample<T>(pool: T[], count: number, rng: () => number): T[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function minutesAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export function generateMockNewsSentiment(range: MoodRange = "live", currency: CurrencyCode = "USD"): NewsSentimentSummary {
  const config = RANGE_CONFIG[range];
  const pool = HEADLINE_POOLS[currency] ?? HEADLINE_POOLS.USD;
  const count = Math.min(config.count, pool.length);
  const bucket = timeBucket(range);
  const rng = mulberry32(hashSeed(`${currency}|${range}|${bucket}`));
  const sampled = seededSample(pool, count, rng).map((item, idx) => ({
    ...item,
    id: `${currency}-${range}-${bucket}-${idx}`,
    score: Math.max(-1, Math.min(1, item.score + (rng() * 0.2 - 0.1))),
    publishedAt: minutesAgo(Math.round((idx / count) * config.spanMinutes) + Math.floor(rng() * 20)),
  }));

  const aggregateScore = Math.round(
    (sampled.reduce((sum, item) => sum + item.score, 0) / sampled.length) * 100
  );
  const trendDelta = Math.round(rng() * 30 - 15);
  const trend: NewsSentimentSummary["trend"] = trendDelta > 4 ? "rising" : trendDelta < -4 ? "falling" : "flat";

  return {
    items: sampled.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    aggregateScore,
    label: moodLabel(aggregateScore, currency),
    updatedAt: new Date().toISOString(),
    trend,
    trendDelta,
    currency,
    source: "mock",
  };
}

export function moodLabel(score: number, currency: CurrencyCode = "USD"): string {
  const label = CURRENCY_SHORT_LABEL[currency] ?? "외화";
  if (score >= 40) return `${label} 강세 심리 우세`;
  if (score >= 15) return `${label} 강세 우위`;
  if (score > -15) return "혼조세";
  if (score > -40) return "원화 강세 우위";
  return "원화 강세 심리 우세";
}

export function stanceMeta(stance: NewsStance, currency: CurrencyCode = "USD") {
  const label = CURRENCY_SHORT_LABEL[currency] ?? "외화";
  if (stance === "foreign_bullish") return { label: `${label} 강세`, color: "#ff8a80" };
  if (stance === "krw_bullish") return { label: "원화 강세", color: "#2af5c3" };
  return { label: "중립", color: "#8291a6" };
}
