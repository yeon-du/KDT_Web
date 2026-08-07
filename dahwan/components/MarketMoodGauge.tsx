"use client";

import { motion } from "framer-motion";

interface MarketMoodGaugeProps {
  score: number; // -100 ~ 100
  label: string;
  // Short display name of the currently-selected target currency (e.g.
  // "엔화", "유로화") — the gauge's right-hand axis caption should track
  // whichever currency is selected, not always say "달러".
  foreignLabel: string;
}

export default function MarketMoodGauge({ score, label, foreignLabel }: MarketMoodGaugeProps) {
  const clamped = Math.max(-100, Math.min(100, score));
  const positionPct = ((clamped + 100) / 200) * 100;
  const tone = clamped >= 15 ? "text-[#ff8a80]" : clamped <= -15 ? "text-coral" : "text-muted";

  return (
    <div aria-label="환율 뉴스 심리 게이지">
      <div className="flex items-baseline justify-between">
        <span className={`text-2xl font-bold tracking-tight ${tone}`}>
          {clamped > 0 ? "+" : ""}
          {clamped}
        </span>
        <span className={`text-sm font-semibold ${tone}`}>{label}</span>
      </div>

      <div className="relative mt-4 h-2.5 w-full overflow-visible rounded-full bg-gradient-to-r from-coral via-forest2 to-[#ff8a80] opacity-90">
        <motion.div
          initial={false}
          animate={{ left: `${positionPct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 16 }}
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-forest bg-ink shadow-[0_0_10px_rgba(234,241,244,0.5)]"
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-muted">
        <span>원화 강세</span>
        <span>중립</span>
        <span>{foreignLabel} 강세</span>
      </div>
    </div>
  );
}
