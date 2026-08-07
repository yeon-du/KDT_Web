"use client";

import { formatCurrency } from "@/lib/format";
import { CurrencyCode, RouteResult } from "@/lib/types";
import { motion } from "framer-motion";

// Small typographic glyphs matching RouteIcon.tsx's default (non-provider)
// badge design (mint circle, coral glyph, font-serif) — kept consistent
// rather than reusing OS emoji here, since these lanes sit in the same
// glance as RouteIcon's carefully-designed badges elsewhere on the card.
const ROUTE_GLYPH: Record<string, string> = {
  exchange: "₩",
  remittance: "↗",
  usdt: "₮",
};

interface RaceTrackProps {
  routes: RouteResult[];
  targetCurrency: CurrencyCode;
}

/**
 * Ranks the three transfer routes by final received amount as horizontal
 * bars (not a speed/time race — despite the component name, what's being
 * compared is "who pays out more", not "who's fastest"; copy and labels
 * are written accordingly). Each bar's fill width is proportional to its
 * received amount, so the gap between routes is immediately legible
 * instead of requiring the user to compare raw numbers.
 */
export default function RaceTrack({ routes, targetCurrency }: RaceTrackProps) {
  const max = Math.max(...routes.map((r) => r.received));
  const sorted = [...routes].sort((a, b) => b.received - a.received);

  return (
    <div className="space-y-3" aria-label="경로별 수령액 순위">
      {sorted.map((route, idx) => {
        const pct = max > 0 ? Math.max(6, (route.received / max) * 100) : 6;
        const isWinner = idx === 0;
        return (
          <div key={route.key} className="flex items-center gap-3">
            <div className={`w-5 shrink-0 text-center text-[11px] font-bold ${isWinner ? "text-[#ffd166]" : "text-muted"}`}>
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <span
                    aria-hidden
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint font-serif text-[9px] font-medium text-coral"
                  >
                    {ROUTE_GLYPH[route.key]}
                  </span>
                  {route.name}
                  {/* Was sitting on top of the gold gradient fill bar below,
                      where its own warm yellow/orange tone blended right
                      into the gradient and became hard to spot. Moved up
                      here next to the name, against the plain card
                      background, where it actually reads as a badge. */}
                  {isWinner && (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[13px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                    >
                      🏆
                    </motion.span>
                  )}
                </span>
                <span className={isWinner ? "font-bold text-[#ffd166]" : "text-muted"}>
                  {formatCurrency(route.received, targetCurrency)}
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-forest2">
                <motion.div
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className={`h-full rounded-full ${
                    isWinner ? "bg-gradient-to-r from-[#ffd166] to-[#f7b733] shadow-[0_0_10px_rgba(255,209,102,0.55)]" : "bg-green/70"
                  }`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
