"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateMockRateTrend, stepMockRateTrend, RateTrendSummary } from "@/lib/rateTrend";
import { fetchRealWeeklyTrend } from "@/lib/realRateTrend";
import { MoodRange } from "@/lib/newsSentiment";
import { CurrencyCode } from "@/lib/types";

const POLL_MS = 5 * 60_000;

// Full regenerate only happens on mount and when range/currency changes —
// that's the only time the series' overall shape should legitimately
// change. Every other update (periodic poll or manual "새로고침") just
// extends the existing series by one point via stepMockRateTrend, so the
// chart doesn't visually jump around on every refresh. 7d tries a real
// historical fetch (Frankfurter/ECB) first and falls back to the mock
// generator if that fails.
export function useRateTrend(range: MoodRange, currentRate: number, targetCurrency: CurrencyCode) {
  const [summary, setSummary] = useState<RateTrendSummary | null>(null);
  const summaryRef = useRef<RateTrendSummary | null>(null);
  summaryRef.current = summary;
  const currentRateRef = useRef(currentRate);
  currentRateRef.current = currentRate;
  // Bumped on every regenerate() call so a slower, older fetch (e.g. a
  // previous currency's Frankfurter request) can't land after a newer one
  // and overwrite the chart with the wrong currency's series.
  const requestIdRef = useRef(0);

  const regenerate = useCallback(async () => {
    if (!currentRateRef.current) return;
    const requestId = ++requestIdRef.current;
    if (range === "7d") {
      const real = await fetchRealWeeklyTrend(targetCurrency);
      if (requestId !== requestIdRef.current) return; // superseded by a newer call
      if (real) {
        setSummary(real);
        return;
      }
    }
    if (requestId !== requestIdRef.current) return;
    setSummary(generateMockRateTrend(range, currentRateRef.current));
  }, [range, targetCurrency]);

  useEffect(() => {
    void regenerate();
  }, [regenerate]);

  const refresh = useCallback(async () => {
    const prev = summaryRef.current;
    if (range === "7d" || !prev || prev.source === "real") {
      await regenerate();
      return;
    }
    if (!currentRateRef.current) return;
    setSummary(stepMockRateTrend(prev, range, currentRateRef.current));
  }, [range, regenerate]);

  useEffect(() => {
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { summary, refresh };
}
