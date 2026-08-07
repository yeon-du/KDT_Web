"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateMockNewsSentiment, MoodRange, NewsSentimentSummary } from "@/lib/newsSentiment";
import { fetchRealNewsSentiment } from "@/lib/realNewsSentiment";
import { CurrencyCode } from "@/lib/types";

const POLL_MS = 5 * 60_000;

// Tries a real fetch (Google News RSS via rss2json — see
// lib/realNewsSentiment.ts) first and falls back to the deterministic mock
// generator if that fails, same shape as useRateTrend's real/mock split.
export function useNewsSentiment(range: MoodRange, currency: CurrencyCode) {
  const [summary, setSummary] = useState<NewsSentimentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    const requestId = ++requestIdRef.current;
    const real = await fetchRealNewsSentiment(range, currency);
    if (requestId !== requestIdRef.current) return;
    if (real) {
      setSummary(real);
      setLoading(false);
      return;
    }
    setSummary(generateMockNewsSentiment(range, currency));
    setLoading(false);
  }, [range, currency]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { summary, loading, refresh };
}
