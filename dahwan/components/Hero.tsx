"use client";

import AIInsightCard from "./AIInsightCard";
import AnimatedNumber from "./AnimatedNumber";
import InputPanel from "./InputPanel";
import RaceTrack from "./RaceTrack";
import { formatCurrency, formatKrw } from "@/lib/format";
import { CURRENCIES, FREQUENCIES } from "@/lib/constants";
import { CurrencyCode, FrequencyKey, RateStatus, RouteResult } from "@/lib/types";
import { motion } from "framer-motion";

interface HeroProps {
  amount: number;
  onAmountChange: (v: number) => void;
  targetCurrency: CurrencyCode;
  onTargetCurrencyChange: (v: CurrencyCode) => void;
  frequency: FrequencyKey;
  onFrequencyChange: (v: FrequencyKey) => void;
  usdKrw: number;
  onUsdKrwChange: (v: number) => void;
  useLiveRate: boolean;
  onToggleLiveRate: (v: boolean) => void;
  rateStatus: RateStatus;
  onRefresh: () => void;
  displayRate: number;
  routes: RouteResult[];
  best: RouteResult;
  remittance: RouteResult;
  sentimentScore?: number | null;
  sentimentLabel?: string;
}

export default function Hero({
  amount,
  onAmountChange,
  targetCurrency,
  onTargetCurrencyChange,
  frequency,
  onFrequencyChange,
  usdKrw,
  onUsdKrwChange,
  useLiveRate,
  onToggleLiveRate,
  rateStatus,
  onRefresh,
  displayRate,
  routes,
  best,
  remittance,
  sentimentScore,
  sentimentLabel,
}: HeroProps) {
  const freq = FREQUENCIES.find((f) => f.key === frequency) ?? FREQUENCIES[0];
  const savingsTarget = Math.max(0, best.received - remittance.received);
  // savingsTarget is in target-currency units and displayRate is KRW per 1
  // unit of that currency, so the KRW value is simply savingsTarget *
  // displayRate (not /displayRate — that inverted the conversion and
  // showed numbers off by a factor of targetFxRate^2/usdKrw for non-USD
  // currencies). Matches the equivalent calc in app/page.tsx's stats effect.
  const savingsKrw = savingsTarget * displayRate;
  const savingsPct = remittance.received > 0 ? (savingsTarget / remittance.received) * 100 : 0;
  const totalSavingsKrw = savingsKrw * freq.count;
  const currency = CURRENCIES.find((c) => c.code === targetCurrency) ?? CURRENCIES[0];

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-forest px-6 pb-16 pt-14 text-white sm:px-10 sm:pt-16 lg:px-[clamp(24px,7.5vw,120px)] lg:pt-[74px]"
    >
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-8 select-none font-serif text-[280px] leading-none text-white/[0.03] sm:text-[440px]">
        $
      </div>

      <div className="relative z-10 grid gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-[36px_clamp(48px,8vw,130px)]">
        <div>
          <p className="mb-5 text-xs font-bold text-[#96b9af]">실제로 받는 돈까지 한눈에</p>
          <h1 className="max-w-[650px] text-[42px] font-extrabold leading-[1.13] tracking-tight sm:text-[56px] lg:text-[68px]">
            보내는 돈은 같아도,
            <br />
            받는 돈은 달라요.
          </h1>
          <p className="mt-6 max-w-[570px] text-[15px] leading-[1.75] text-[#c4d2ce] sm:text-base">
            원하는 수취 통화를 고르면 수수료와 스프레드를 모두 반영해 은행 환전, 해외송금, 코인 경로를
            최종 수령액 순으로 비교합니다. 아래에서 어떤 경로가 더 많이 받는지 바로 확인하세요.
          </p>
        </div>

        <InputPanel
          amount={amount}
          onAmountChange={onAmountChange}
          targetCurrency={targetCurrency}
          onTargetCurrencyChange={onTargetCurrencyChange}
          frequency={frequency}
          onFrequencyChange={onFrequencyChange}
          usdKrw={usdKrw}
          onUsdKrwChange={onUsdKrwChange}
          useLiveRate={useLiveRate}
          onToggleLiveRate={onToggleLiveRate}
          rateStatus={rateStatus}
          onRefresh={onRefresh}
          displayRate={displayRate}
        />
      </div>

      <div className="relative z-10 mt-6">
        <AIInsightCard
          best={best}
          runnerUp={remittance}
          savingsTarget={savingsTarget}
          savingsPct={savingsPct}
          totalSavingsKrw={totalSavingsKrw}
          frequency={freq}
          targetCurrency={targetCurrency}
          sentimentScore={sentimentScore}
          sentimentLabel={sentimentLabel}
        />
      </div>

      <motion.section
        layout
        aria-label="핵심 비교 결과"
        aria-live="polite"
        className="relative z-10 mt-9 grid gap-5 rounded-3xl bg-paper p-6 text-ink shadow-card sm:p-8 lg:grid-cols-[1fr_1fr_0.9fr]"
      >
        <div className="border-b border-line pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <div className="mb-3 border-t-4 border-coral pt-3">
            <span className="text-[11px] font-bold text-coral">지금 입력 기준 결과</span>
            <p className="mt-1 text-sm font-semibold">{best.name}이 가장 유리합니다</p>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-xl bg-forest2 p-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between min-[420px]:gap-2">
            <div className="min-w-0">
              <span className="block text-[10px] text-muted">내가 보내는 금액</span>
              <strong className="mt-1 block truncate text-lg tracking-tight text-ink">{formatKrw(amount)}</strong>
            </div>
            {/* Was left-aligned when stacked on mobile (a rotated block-level
                glyph doesn't center itself just because its parent stretches
                to full width) — text-center pulls it to the middle, between
                the two amounts above/below it. */}
            <span aria-hidden className="block rotate-90 text-center text-coral min-[420px]:rotate-0">→</span>
            {/* Flag+currency code used to sit on its own line below the
                amount, making this block 3 lines tall against the other
                side's 2 — since both sides are vertically centered as a
                whole, that extra line pushed this side's number off the
                other side's number's height. Inlined it next to the amount
                instead so both blocks are the same 2-line height and the
                two amounts land at the same vertical position. */}
            <div className="min-w-0 min-[420px]:text-right">
              <span className="block text-[10px] text-muted">실제로 받는 금액</span>
              <strong className="mt-1 flex flex-wrap items-baseline gap-1.5 truncate text-xl tracking-tight text-coral min-[420px]:justify-end">
                <AnimatedNumber value={best.received} format={(v) => formatCurrency(v, targetCurrency)} />
                <small className="text-[10px] font-medium text-muted">
                  {currency.flag} {targetCurrency}
                </small>
              </strong>
            </div>
          </div>
        </div>

        <div className="border-b border-line pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <span className="mb-3 block text-[11px] font-bold text-muted">수령액 순위</span>
          <RaceTrack routes={routes} targetCurrency={targetCurrency} />
        </div>

        <div className="flex flex-col rounded-xl border border-coral/20 bg-mint p-4">
          <span className="text-[12px] leading-snug text-muted">{freq.label} 기준 · 해외송금 대비</span>
          <strong className="mt-2 block text-2xl leading-tight text-coral">
            {savingsKrw > 0 ? (
              <>
                <AnimatedNumber value={savingsKrw} format={formatKrw} /> 이득
              </>
            ) : (
              "동일 수준"
            )}
          </strong>
          <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
            {savingsTarget > 0
              ? `회당 ${formatCurrency(savingsTarget, targetCurrency)} 더 받음 · +${savingsPct.toFixed(2)}%`
              : "현재 해외송금 경로가 최적이에요"}
          </p>
          <p className="mt-3 border-t border-coral/15 pt-2.5 text-[11px] leading-relaxed text-muted">
            총 송금액 {formatKrw(amount * freq.count)} · {freq.helper}
          </p>
        </div>
      </motion.section>
    </section>
  );
}
