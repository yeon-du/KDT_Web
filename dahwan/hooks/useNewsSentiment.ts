"use client";

import { useCallback, useEffect, useState } from "react";
import { generateMockNewsSentiment, MoodRange, NewsSentimentSummary } from "@/lib/newsSentiment";
import { CurrencyCode } from "@/lib/types";

const POLL_MS = 5 * 60_000;

// Prototype data source: regenerates a plausible mock summary for the
// selected range + currency on an interval. Swap `generateMockNewsSentiment()`
// for a fetch() to a real aggregation endpoint once a news pipeline exists.
export function useNewsSentiment(range: MoodRange, currency: CurrencyCode) {
  const [summary, setSummary] = useState<NewsSentimentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setSummary(generateMockNewsSentiment(range, currency));
    setLoading(false);
  }, [range, currency]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { summary, loading, refresh };
}
