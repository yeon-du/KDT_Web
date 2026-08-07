"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateMockRates } from "@/lib/mockRates";
import { fetchRealRates } from "@/lib/realRates";
import { RatesResponse, RateStatus } from "@/lib/types";

const POLL_MS = 60_000;

export function useRates(onLiveUpdate: (rates: RatesResponse) => void, live: boolean) {
  const [rates, setRates] = useState<RatesResponse | null>(null);
  const [status, setStatus] = useState<RateStatus>("loading");
  const liveRef = useRef(live);
  liveRef.current = live;
  const onLiveUpdateRef = useRef(onLiveUpdate);
  onLiveUpdateRef.current = onLiveUpdate;
  // Bumped on every refresh() call so a slower, older request can't
  // overwrite state with stale data after a faster, newer one already
  // landed (e.g. spamming the "지금 새로고침" button).
  const requestIdRef = useRef(0);

  // Tries real data first (Frankfurter + Upbit public APIs — see
  // lib/realRates.ts), falling back to the simulated generator if those
  // calls fail (offline, blocked, rate limited). Static export builds have
  // no server runtime, so all of this happens client-side in the browser.
  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setStatus("loading");
    try {
      const real = await fetchRealRates();
      if (requestId !== requestIdRef.current) return; // superseded by a newer refresh
      const data = real ?? generateMockRates();
      setRates(data);
      setStatus("live");
      if (liveRef.current) onLiveUpdateRef.current(data);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  return { rates, status, refresh };
}
