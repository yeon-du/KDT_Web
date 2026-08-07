"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MarketMoodGauge from "./MarketMoodGauge";
import NewsSentimentFeed from "./NewsSentimentFeed";
import RateTrendChart from "./RateTrendChart";
import { formatRate } from "@/lib/format";
import { CURRENCY_SHORT_LABEL, MOOD_RANGES, MoodRange, NewsSentimentSummary } from "@/lib/newsSentiment";
import { RateTrendSummary } from "@/lib/rateTrend";
import { CurrencyCode } from "@/lib/types";

interface MarketMoodSectionProps {
  summary: NewsSentimentSummary | null;
  loading: boolean;
  onRefresh: () => void;
  range: MoodRange;
  onRangeChange: (range: MoodRange) => void;
  trend: RateTrendSummary | null;
  onTrendRefresh: () => void;
  targetCurrency: CurrencyCode;
}

const TREND_META = {
  rising: { arrow: "▲", label: "상승 흐름", color: "text-[#ff8a80]" },
  falling: { arrow: "▼", label: "하락 흐름", color: "text-coral" },
  flat: { arrow: "▬", label: "보합", color: "text-muted" },
} as const;

type View = "mood" | "trend";

export default function MarketMoodSection({
  summary,
  loading,
  onRefresh,
  range,
  onRangeChange,
  trend,
  onTrendRefresh,
  targetCurrency,
}: MarketMoodSectionProps) {
  const [view, setView] = useState<View>("mood");
  const newsTrend = summary ? TREND_META[summary.trend] : null;

  const rateTrendDirection: keyof typeof TREND_META | null = trend
    ? trend.changePct > 0.05
      ? "rising"
      : trend.changePct < -0.05
      ? "falling"
      : "flat"
    : null;
  const rateTrendMeta = rateTrendDirection ? TREND_META[rateTrendDirection] : null;

  return (
    <section aria-label="시장 동향" className="px-6 sm:px-10 lg:px-[clamp(24px,7.5vw,120px)]">
      <div className="mx-auto max-w-[1140px] rounded-3xl border border-line bg-paper p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-coral">Prototype · 실험 기능</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">시장 동향</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted">5분마다 자동 갱신</span>
            <button
              onClick={view === "mood" ? onRefresh : onTrendRefresh}
              disabled={view === "mood" && loading}
              className="rounded-full border border-line px-3 py-1.5 text-[11px] text-muted transition hover:border-coral/50 hover:text-ink disabled:cursor-wait disabled:opacity-50"
            >
              ↻ 지금 새로고침
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="보기 선택" className="inline-flex gap-1 rounded-full border border-line bg-forest2 p-1">
            <button
              role="tab"
              aria-selected={view === "mood"}
              onClick={() => setView("mood")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                view === "mood" ? "bg-coral text-forest" : "text-muted hover:text-ink"
              }`}
            >
              뉴스 심리
            </button>
            <button
              role="tab"
              aria-selected={view === "trend"}
              onClick={() => setView("trend")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                view === "trend" ? "bg-coral text-forest" : "text-muted hover:text-ink"
              }`}
            >
              환율 추이
            </button>
          </div>
          <div role="tablist" aria-label="기간 선택" className="inline-flex gap-1 rounded-full border border-line bg-forest2 p-1">
            {MOOD_RANGES.map((r) => (
              <button
                key={r.key}
                role="tab"
                aria-selected={range === r.key}
                onClick={() => onRangeChange(r.key)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  range === r.key ? "bg-coral text-forest" : "text-muted hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "mood" ? (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid items-start gap-6 sm:grid-cols-[1fr_1.1fr]"
            >
              <div>
                {summary ? (
                  <>
                    <MarketMoodGauge
                      score={summary.aggregateScore}
                      label={summary.label}
                      foreignLabel={CURRENCY_SHORT_LABEL[targetCurrency] ?? targetCurrency}
                    />
                    {newsTrend && (
                      <p className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${newsTrend.color}`}>
                        <span aria-hidden>{newsTrend.arrow}</span>
                        선택 기간 동안 {newsTrend.label}
                        <span className="text-[10px] font-normal text-muted">
                          ({summary.trendDelta > 0 ? "+" : ""}
                          {summary.trendDelta}p)
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <div className="h-24 animate-pulse rounded-xl bg-forest2" />
                )}
                <p className="mt-4 text-[10px] leading-relaxed text-muted">
                  선택한 받는 통화({CURRENCY_SHORT_LABEL[targetCurrency] ?? targetCurrency}) 관련 뉴스 헤드라인의
                  방향성을 집계한 참고 지표예요. 통화를 바꾸면 헤드라인도 함께 바뀌어요. 투자 조언이 아니며, 실제
                  데이터 연동 전 프로토타입 단계로 모의 데이터를 사용하고 있습니다.
                </p>
              </div>
              <div className="max-h-[280px] overflow-y-auto pr-1">
                <span className="mb-2 block text-[11px] font-semibold text-muted">
                  {CURRENCY_SHORT_LABEL[targetCurrency] ?? targetCurrency} 관련 최근 헤드라인
                </span>
                {summary ? (
                  <NewsSentimentFeed items={summary.items} currency={targetCurrency} />
                ) : (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-lg bg-forest2" />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="trend"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid items-start gap-6 sm:grid-cols-[1.1fr_1fr]"
            >
              <div>
                {trend?.source === "real" && (
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-semibold text-coral">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />
                    실제 ECB 공시환율 (Frankfurter)
                  </span>
                )}
                {trend ? (
                  <RateTrendChart points={trend.points} label={targetCurrency} />
                ) : (
                  <div className="h-[120px] animate-pulse rounded-xl bg-forest2" />
                )}
                <p className="mt-4 text-[10px] leading-relaxed text-muted">
                  {trend?.source === "real"
                    ? "유럽중앙은행(ECB) 기준 영업일 종가를 무료 공개 API(Frankfurter)로 직접 받아온 실제 과거 환율이에요. 주말·휴장일은 데이터가 없어 건너뛰어요."
                    : "맨 끝 지점은 지금 이 순간의 실제 환율이에요. 다만 그 앞의 흐름은 무료로 받을 수 있는 실시간·일중 히스토리 데이터가 없어, 현재 시세를 기준으로 만든 모의 흐름이에요."}
                </p>
              </div>
              <div>
                {trend ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="block text-[10px] text-muted">현재 {targetCurrency} 환율</span>
                        <strong className="mt-1 block text-2xl font-bold tracking-tight text-ink">
                          {formatRate(trend.points[trend.points.length - 1]?.rate ?? 0)}원
                        </strong>
                      </div>
                      {rateTrendMeta && (
                        <span className={`flex items-center gap-1 text-[12px] font-semibold ${rateTrendMeta.color}`}>
                          <span aria-hidden>{rateTrendMeta.arrow}</span>
                          {trend.changePct > 0 ? "+" : ""}
                          {trend.changePct}%
                        </span>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-forest2 px-3.5 py-3">
                        <span className="block text-[10px] text-muted">선택 기간 최저</span>
                        <b className="mt-1 block text-sm font-semibold text-ink">{formatRate(trend.low)}원</b>
                      </div>
                      <div className="rounded-xl bg-forest2 px-3.5 py-3">
                        <span className="block text-[10px] text-muted">선택 기간 최고</span>
                        <b className="mt-1 block text-sm font-semibold text-ink">{formatRate(trend.high)}원</b>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-24 animate-pulse rounded-xl bg-forest2" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
