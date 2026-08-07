"use client";

import AnimatedNumber from "./AnimatedNumber";
import { formatCurrency, formatKrw } from "@/lib/format";
import { CurrencyCode, Frequency, RouteResult } from "@/lib/types";
import { motion } from "framer-motion";

interface AIInsightCardProps {
  best: RouteResult;
  runnerUp: RouteResult;
  savingsTarget: number; // in target currency
  savingsPct: number;
  totalSavingsKrw: number;
  frequency: Frequency;
  targetCurrency: CurrencyCode;
  sentimentScore?: number | null; // -100 ~ 100, optional market-mood signal
  sentimentLabel?: string;
}

// Compact, single-glance insight strip. Sits above the hero result card
// rather than as its own large block below — the point is a quick "here's
// what to do" read, not a paragraph.
export default function AIInsightCard({
  best,
  runnerUp,
  savingsTarget,
  savingsPct,
  totalSavingsKrw,
  frequency,
  targetCurrency,
  sentimentScore,
  sentimentLabel,
}: AIInsightCardProps) {
  const showSentiment = typeof sentimentScore === "number" && !!sentimentLabel;
  const hasGap = runnerUp.key !== best.key && savingsTarget > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-coral/25 bg-white/[0.06] px-4 py-2.5 text-[12px] backdrop-blur-sm"
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-coral text-[10px] font-bold text-forest">
        AI
      </span>
      <span className="font-semibold text-white">
        <span className="text-coral">{best.name}</span>이 가장 유리해요
      </span>
      {hasGap && (
        <span className="text-[#c4d2ce]">
          {runnerUp.name} 대비{" "}
          <strong className="text-coral">
            <AnimatedNumber value={savingsTarget} format={(v) => formatCurrency(v, targetCurrency)} />
          </strong>{" "}
          (+<AnimatedNumber value={savingsPct} format={(v) => v.toFixed(1)} />%) 더 받음
        </span>
      )}
      {frequency.count > 1 && (
        <span className="text-[#c4d2ce]">
          · {frequency.label} 반복 시 연 <AnimatedNumber value={totalSavingsKrw} format={formatKrw} /> 절감
        </span>
      )}
      {showSentiment && <span className="text-coral2">· 뉴스 심리 {sentimentLabel}</span>}
    </motion.div>
  );
}
