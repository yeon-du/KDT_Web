"use client";

import { AMOUNT_MAX, AMOUNT_MIN, AMOUNT_PRESETS, CURRENCIES, FREQUENCIES } from "@/lib/constants";
import { formatNumber, formatRate } from "@/lib/format";
import { CurrencyCode, FrequencyKey, RateStatus } from "@/lib/types";
import { motion } from "framer-motion";

interface InputPanelProps {
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
}

export default function InputPanel({
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
}: InputPanelProps) {
  const handleAmountInput = (raw: string) => {
    const digits = Number(raw.replace(/[^0-9]/g, ""));
    onAmountChange(Math.min(Math.max(digits || 0, AMOUNT_MIN), AMOUNT_MAX));
  };

  return (
    <div
      aria-label="비교 조건 입력"
      className="relative z-10 rounded-3xl border border-white/[0.16] bg-white/[0.07] p-6 shadow-panel backdrop-blur-sm sm:p-8"
    >
      <div aria-label="비교 통화" className="mb-6 grid grid-cols-[0.8fr_auto_1.3fr] items-center gap-3">
        <div className="rounded-2xl border border-white/[0.14] bg-black/[0.09] p-3.5">
          <small className="mb-1 block text-[10px] text-[#8fa69f]">보내는 통화</small>
          <strong className="text-sm tracking-wide text-white">🇰🇷 KRW</strong>
        </div>
        <span className="text-coral">→</span>
        <label className="min-w-0 rounded-2xl border border-white/[0.14] bg-black/[0.09] p-2.5 pr-3.5 focus-within:ring-2 focus-within:ring-coral/60">
          <small className="mb-1 block text-[10px] text-[#8fa69f]">받는 통화</small>
          <select
            value={targetCurrency}
            onChange={(e) => onTargetCurrencyChange(e.target.value as CurrencyCode)}
            aria-label="받는 통화"
            className="w-full min-w-0 cursor-pointer border-0 bg-transparent text-[13px] font-bold text-white outline-none sm:text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-forest text-white">
                {c.flag} {c.code} · {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label htmlFor="amount" className="mb-2.5 block text-xs text-[#cdd8d4]">
        비교할 금액
      </label>
      <div className="flex h-[62px] items-center gap-3 rounded-2xl bg-paper px-5 shadow-[inset_0_-3px_0_var(--tw-shadow-color)] shadow-coral focus-within:ring-2 focus-within:ring-coral/60 sm:h-[66px]">
        <input
          id="amount"
          inputMode="numeric"
          value={formatNumber(amount)}
          onChange={(e) => handleAmountInput(e.target.value)}
          aria-describedby="amount-limit"
          className="w-full min-w-0 border-0 bg-transparent text-right text-[27px] font-bold tracking-tight text-ink outline-none sm:text-[34px]"
        />
        <span className="text-sm font-semibold text-muted">원</span>
      </div>

      <div aria-label="금액 빠른 선택" className="mt-2.5 grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-4">
        {AMOUNT_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onAmountChange(preset)}
            className="rounded-full border border-white/[0.17] px-1 py-2 text-[11px] text-[#c8d6d1] transition-all hover:border-transparent hover:bg-white hover:text-forest"
          >
            {preset / 10000}만원
          </button>
        ))}
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-[11px] text-[#aebfba]">송금 주기</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="송금 주기 선택">
          {FREQUENCIES.map((f) => {
            const active = f.key === frequency;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFrequencyChange(f.key)}
                aria-pressed={active}
                className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-coral text-forest shadow-[0_0_12px_rgba(42,245,195,0.35)]"
                    : "border border-white/[0.18] text-[#c8d6d1] hover:border-white/40 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-[#8fa69f]">
          {FREQUENCIES.find((f) => f.key === frequency)?.helper}
        </p>
      </div>

      <div className="mt-6 flex items-center text-xs">
        <span className="text-[#aebfba]">{targetCurrency} 기준환율</span>
        <strong className="ml-auto text-[15px] text-white">
          1 {targetCurrency} = {formatRate(displayRate)}원
        </strong>
        {!(useLiveRate && rateStatus === "live") && (
          <small className={`ml-2 flex items-center gap-1 ${rateStatus === "error" ? "text-[#ff8a80]" : "text-[#f2aa90]"}`}>
            {rateStatus === "error" && <span aria-hidden>⚠</span>}
            {rateStatus === "loading" ? "연결 중" : rateStatus === "error" ? "연결 실패 · 마지막 값 사용" : "수동 모드"}
          </small>
        )}
      </div>

      <input
        id="rate"
        type="range"
        min={1200}
        max={1600}
        step={1}
        value={usdKrw}
        onChange={(e) => onUsdKrwChange(Number(e.target.value))}
        aria-label="기준환율"
        disabled={useLiveRate}
        className="mt-4 h-[3px] w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-coral disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:shadow-md"
      />

      <div className="mt-3.5 flex justify-between gap-2.5">
        <button
          onClick={() => onToggleLiveRate(!useLiveRate)}
          className="-m-2 cursor-pointer bg-transparent p-2 text-[10px] text-[#f2aa90] transition hover:text-white"
        >
          {useLiveRate ? "직접 입력으로 전환" : "실시간 환율 사용"}
        </button>
        <motion.button
          onClick={onRefresh}
          disabled={rateStatus === "loading"}
          whileTap={{ rotate: 180 }}
          className="-m-2 cursor-pointer bg-transparent p-2 text-[10px] text-[#b9cac5] transition hover:text-white disabled:cursor-wait disabled:opacity-45"
        >
          ↻ 지금 새로고침
        </motion.button>
      </div>

      <p id="amount-limit" className="mt-3.5 text-[10px] text-[#91a7a0]">
        10만원부터 5억원까지 비교 · 실시간 모드는 60초마다 자동 갱신
      </p>
    </div>
  );
}
