"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DataRail from "@/components/DataRail";
import RoutesTabs from "@/components/RoutesTabs";
import MarketMoodSection from "@/components/MarketMoodSection";
import RateAlerts from "@/components/RateAlerts";
import NoticeSection from "@/components/NoticeSection";
import Footer from "@/components/Footer";
import WelcomeModal from "@/components/WelcomeModal";
import { useRates } from "@/hooks/useRates";
import { useNewsSentiment } from "@/hooks/useNewsSentiment";
import { useRateTrend } from "@/hooks/useRateTrend";
import { coinOptionToRouteResult, computeCoinOptions, computeRemittanceProviders, computeRoutes, providerToRouteResult } from "@/lib/calculations";
import { DEFAULTS, FX_FALLBACK, NETWORK_DEFINITIONS, REMITTANCE_PROVIDERS } from "@/lib/constants";
import { sendAlertEmail } from "@/lib/emailAlert";
import { MoodRange } from "@/lib/newsSentiment";
import { readLocal, writeLocal } from "@/lib/persist";
import { CurrencyCode, FrequencyKey, RateAlert, RatesResponse, StableAsset } from "@/lib/types";

const INPUTS_KEY = "dahwan:inputs:v1";
const STATS_KEY = "dahwan:stats:v1";
const ALERTS_KEY = "dahwan:alerts:v1";

interface PersistedInputs {
  amount: number;
  targetCurrency: CurrencyCode;
  frequency: FrequencyKey;
  usdKrw: number;
  bankSpread: number;
  remittanceSpread: number;
  useLiveRate: boolean;
  remittanceProviderId: string;
  coinPickerId: string;
}

interface Stats {
  totalSavingsKrw: number;
  visits: number;
}

export default function Page() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [usdKrw, setUsdKrw] = useState(DEFAULTS.usdKrw);
  const [bankSpread, setBankSpread] = useState(DEFAULTS.bankSpread);
  const [remittanceSpread, setRemittanceSpread] = useState(DEFAULTS.remittanceSpread);
  const [useLiveRate, setUseLiveRate] = useState(true);
  const [targetCurrency, setTargetCurrency] = useState<CurrencyCode>("USD");
  const [frequency, setFrequency] = useState<FrequencyKey>("once");
  const [stats, setStats] = useState<Stats>({ totalSavingsKrw: 0, visits: 0 });
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [remittanceProviderId, setRemittanceProviderId] = useState("generic");
  // "auto" = show computeRoutes()'s own USDT simulation; otherwise
  // "<asset>:<network>" for a specific combo picked in the USDT card.
  const [coinPickerId, setCoinPickerId] = useState("auto");
  // Flips true once restore-from-localStorage has applied (or determined
  // there was nothing to restore) — gates the one-time savings/visit stat
  // tracking below so it reads the actually-restored amount/currency
  // instead of whatever the very first render's defaults were.
  const [readyForStats, setReadyForStats] = useState(false);

  const hydrated = useRef(false);
  const tracked = useRef(false);
  const alertsHydrated = useRef(false);

  // Restore whatever the person last configured, so a refresh doesn't
  // reset amount/currency/frequency/cost assumptions back to defaults.
  useEffect(() => {
    const saved = readLocal<Partial<PersistedInputs>>(INPUTS_KEY, {});
    if (typeof saved.amount === "number") setAmount(saved.amount);
    if (saved.targetCurrency) setTargetCurrency(saved.targetCurrency);
    if (saved.frequency) setFrequency(saved.frequency);
    if (typeof saved.useLiveRate === "boolean") setUseLiveRate(saved.useLiveRate);
    if (saved.useLiveRate === false) {
      if (typeof saved.usdKrw === "number") setUsdKrw(saved.usdKrw);
      if (typeof saved.bankSpread === "number") setBankSpread(saved.bankSpread);
      if (typeof saved.remittanceSpread === "number") setRemittanceSpread(saved.remittanceSpread);
    }
    // Only restore a provider id that's still a real option — a provider
    // removed from REMITTANCE_PROVIDERS after being saved would otherwise
    // silently show the generic simulation while no picker pill highlights.
    if (
      saved.remittanceProviderId &&
      (saved.remittanceProviderId === "generic" || REMITTANCE_PROVIDERS.some((p) => p.id === saved.remittanceProviderId))
    ) {
      setRemittanceProviderId(saved.remittanceProviderId);
    }
    if (
      saved.coinPickerId &&
      (saved.coinPickerId === "auto" || NETWORK_DEFINITIONS.some((d) => `${d.asset}:${d.network}` === saved.coinPickerId))
    ) {
      setCoinPickerId(saved.coinPickerId);
    }
    hydrated.current = true;
    setReadyForStats(true);
  }, []);

  // Alerts are an array, not a partial-object shape, so this restores them
  // separately from readLocal's object-merge helper (which would mangle an
  // array into `{0: ..., 1: ...}`).
  useEffect(() => {
    if (typeof window === "undefined") {
      alertsHydrated.current = true;
      return;
    }
    try {
      const raw = window.localStorage.getItem(ALERTS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) setAlerts(parsed);
    } catch {
      // ignore malformed/unavailable storage
    }
    alertsHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!alertsHydrated.current) return;
    writeLocal(ALERTS_KEY, alerts);
  }, [alerts]);

  useEffect(() => {
    if (!hydrated.current) return;
    writeLocal<PersistedInputs>(INPUTS_KEY, {
      amount,
      targetCurrency,
      frequency,
      usdKrw,
      bankSpread,
      remittanceSpread,
      useLiveRate,
      remittanceProviderId,
      coinPickerId,
    });
  }, [
    amount,
    targetCurrency,
    frequency,
    usdKrw,
    bankSpread,
    remittanceSpread,
    useLiveRate,
    remittanceProviderId,
    coinPickerId,
  ]);

  const handleLiveUpdate = useCallback((data: RatesResponse) => {
    setUsdKrw(data.usdKrw);
    setBankSpread(data.bankSpread);
    setRemittanceSpread(data.remittanceSpread);
  }, []);

  const { rates, status, refresh } = useRates(handleLiveUpdate, useLiveRate);
  const [moodRange, setMoodRange] = useState<MoodRange>("live");
  const { summary: moodSummary, loading: moodLoading, refresh: refreshMood } = useNewsSentiment(moodRange, targetCurrency);

  const handleToggleLiveRate = (next: boolean) => {
    setUseLiveRate(next);
    if (next && rates) {
      setUsdKrw(rates.usdKrw);
      setBankSpread(rates.bankSpread);
      setRemittanceSpread(rates.remittanceSpread);
    }
  };

  // Any manual tweak to a cost assumption switches the whole panel out of
  // "실시간 반영" mode — once the person overrides one number by hand, we
  // stop silently overwriting their other inputs with live data too. (The
  // 국내·해외 시세 스프레드 used to have its own slider + handler here, but
  // it's read-only now — always derived straight from `rates` below,
  // independent of this toggle, since it's not something a person should
  // be able to override in their own favor.)
  const handleBankSpreadChange = (v: number) => {
    setUseLiveRate(false);
    setBankSpread(v);
  };

  const handleRemittanceSpreadChange = (v: number) => {
    setUseLiveRate(false);
    setRemittanceSpread(v);
  };

  const targetFxRate = rates?.fxRates?.[targetCurrency] ?? FX_FALLBACK[targetCurrency];
  const displayRate = usdKrw / targetFxRate;

  // Read-only, always sourced straight from the latest fetched `rates`
  // (which updates on every poll regardless of useLiveRate — only the
  // *other* inputs' auto-apply is gated on that toggle) rather than a piece
  // of editable state. This used to be a "김치 프리미엄" slider a person
  // could drag; it's really just the live domestic-vs-overseas USDT price
  // gap, not something to tune in your favor, so it can't drift out of
  // sync with the market the way a manually-set slider could.
  const kimchiPremiumPct = rates?.kimchiPremium ?? DEFAULTS.kimchiPremium;

  const getCurrentRate = useCallback(
    (currency: CurrencyCode) => {
      const fx = rates?.fxRates?.[currency] ?? FX_FALLBACK[currency];
      return usdKrw / fx;
    },
    [rates, usdKrw]
  );

  const { summary: rateTrend, refresh: refreshRateTrend } = useRateTrend(moodRange, displayRate, targetCurrency);

  const handleAddAlert = (currency: CurrencyCode, direction: "above" | "below", targetRate: number, email?: string) => {
    setAlerts((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, currency, direction, targetRate, createdAt: new Date().toISOString(), email },
    ]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Checks every alert against the app's current live/manual rate whenever
  // that rate updates. Fires a browser Notification once per alert the
  // first time its condition is met (no repeat spam), and flags it as
  // triggered in the list so the person can see it even without granting
  // notification permission. If the alert has an email attached, also fires
  // an email via EmailJS — same "only while this tab is open" limitation as
  // the browser Notification, since there's no server to check this when
  // the tab is closed.
  useEffect(() => {
    if (alerts.length === 0 || !alertsHydrated.current) return;
    let changed = false;
    const next = alerts.map((a) => {
      if (a.triggeredAt) return a;
      const current = getCurrentRate(a.currency);
      const met = a.direction === "above" ? current >= a.targetRate : current <= a.targetRate;
      if (!met) return a;
      changed = true;
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("다환 환율 알림", {
          body: `1 ${a.currency}이(가) ${a.direction === "above" ? "이상" : "이하"}으로 설정한 ${a.targetRate.toLocaleString()}원에 도달했어요.`,
        });
      }
      if (a.email) {
        void sendAlertEmail({
          toEmail: a.email,
          currency: a.currency,
          direction: a.direction,
          targetRate: a.targetRate,
          currentRate: current,
        });
      }
      return { ...a, triggeredAt: new Date().toISOString() };
    });
    if (changed) setAlerts(next);
    // getCurrentRate is intentionally excluded — it's a useCallback keyed on
    // [rates, usdKrw], which are already deps here, so including it too
    // would just be a redundant re-trigger. `alerts` IS included so a
    // freshly-added alert whose condition is already met gets checked
    // immediately instead of waiting for the next rate update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdKrw, rates, alerts]);

  const routes = useMemo(
    () =>
      computeRoutes({
        amountKrw: amount,
        usdKrw,
        bankSpreadPct: bankSpread,
        remittanceSpreadPct: remittanceSpread,
        kimchiPremiumPct,
        targetFxRate,
      }),
    [amount, usdKrw, bankSpread, remittanceSpread, kimchiPremiumPct, targetFxRate]
  );

  // Real named providers (Hanpass, Sentbe, etc.) are computed independently
  // of computeRoutes() — picking one just swaps what's displayed for the
  // "해외송금" card instead of changing the underlying simulated calc.
  const providerResults = useMemo(
    () => computeRemittanceProviders(REMITTANCE_PROVIDERS, { amountKrw: amount, usdKrw, targetFxRate }),
    [amount, usdKrw, targetFxRate]
  );

  const providerOptions = useMemo(
    () => [{ id: "generic", label: "은행 시뮬레이션" }, ...REMITTANCE_PROVIDERS.map((p) => ({ id: p.id, label: p.name }))],
    []
  );

  const coinOptions = useMemo(
    () =>
      computeCoinOptions({
        amountKrw: amount,
        usdKrw,
        kimchiPremiumPct,
        rates,
        targetFxRate,
      }),
    [amount, usdKrw, kimchiPremiumPct, rates, targetFxRate]
  );

  // Networks grouped per coin, for the USDT card's two-step picker (pick a
  // coin, then pick that coin's network) — replaces the old flat list of
  // every asset+network combo in one scrollable row.
  const coinNetworkOptions = useMemo(() => {
    const map: Record<StableAsset, { id: string; label: string }[]> = { USDT: [], USDC: [] };
    NETWORK_DEFINITIONS.forEach((d) => {
      map[d.asset].push({ id: d.network, label: `${d.network} · ${d.standard}` });
    });
    return map;
  }, []);

  // coinPickerId is the persisted source of truth ("auto" | "<asset>:<network>"),
  // same sentinel pattern as remittanceProviderId's "generic": "auto" means
  // "show computeRoutes()'s own USDT simulation" (reacts to the live
  // 국내·해외 시세 스프레드 and includes the flat overseas-withdrawal fee) rather than always
  // forcing a specific network's numbers onto the card. coinMode/coinNetwork
  // below are just that same string split into the two pieces the two-step
  // picker UI needs.
  const coinMode: "auto" | StableAsset = coinPickerId === "auto" ? "auto" : (coinPickerId.split(":")[0] as StableAsset);
  const coinNetwork = coinPickerId === "auto" ? "" : coinPickerId.split(":")[1];

  const handleCoinModeChange = (mode: "auto" | StableAsset) => {
    if (mode === "auto") {
      setCoinPickerId("auto");
      return;
    }
    // Default to that coin's first network when switching into it — the
    // network row only appears once a coin is picked, so it always needs
    // *something* selected as soon as it shows up.
    const firstNetwork = NETWORK_DEFINITIONS.find((d) => d.asset === mode)?.network;
    if (firstNetwork) setCoinPickerId(`${mode}:${firstNetwork}`);
  };

  const handleCoinNetworkChange = (network: string) => {
    if (coinMode === "auto") return;
    setCoinPickerId(`${coinMode}:${network}`);
  };

  const displayRoutes = useMemo(() => {
    let next = routes;
    if (remittanceProviderId !== "generic") {
      const picked = providerResults.find((p) => p.id === remittanceProviderId);
      if (picked) next = next.map((r) => (r.key === "remittance" ? providerToRouteResult(picked, amount) : r));
    }
    if (coinPickerId !== "auto") {
      const [asset, network] = coinPickerId.split(":");
      const pickedCoin = coinOptions.find((o) => o.asset === asset && o.network === network);
      if (pickedCoin) next = next.map((r) => (r.key === "usdt" ? coinOptionToRouteResult(pickedCoin, amount, usdKrw) : r));
    }
    return next;
  }, [routes, providerResults, remittanceProviderId, coinOptions, coinPickerId, amount, usdKrw]);

  const best = useMemo(() => [...displayRoutes].sort((a, b) => b.received - a.received)[0], [displayRoutes]);
  const remittanceRoute = displayRoutes.find((r) => r.key === "remittance") ?? displayRoutes[0];

  // Counts this page load once toward a running "total simulated savings"
  // stat — a lightweight way to show repeat visitors how much they've
  // collectively found across sessions, without needing real accounts.
  // Gated on readyForStats so this reads the person's restored amount/
  // currency/etc. instead of the pre-hydration DEFAULTS that are on screen
  // for the very first render.
  useEffect(() => {
    if (!readyForStats || tracked.current) return;
    tracked.current = true;
    const savingsKrw = Math.max(0, ((best.received - remittanceRoute.received) / targetFxRate) * usdKrw);
    const prev = readLocal<Stats>(STATS_KEY, { totalSavingsKrw: 0, visits: 0 });
    const next: Stats = { totalSavingsKrw: prev.totalSavingsKrw + savingsKrw, visits: prev.visits + 1 };
    writeLocal(STATS_KEY, next);
    setStats(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyForStats]);

  return (
    // Note: no overflow-hidden here — it would establish this element as
    // the nearest "scroll container" for Navbar's `sticky top-0`, which
    // isn't itself the thing that scrolls (the viewport is), silently
    // breaking the sticky nav. Hero already clips its own giant "$"
    // decoration with its own overflow-hidden, so nothing here depends on
    // main having one.
    <main className="min-h-screen bg-cream">
      <WelcomeModal />
      <Navbar />
      <Hero
        amount={amount}
        onAmountChange={setAmount}
        targetCurrency={targetCurrency}
        onTargetCurrencyChange={setTargetCurrency}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        usdKrw={usdKrw}
        onUsdKrwChange={setUsdKrw}
        useLiveRate={useLiveRate}
        onToggleLiveRate={handleToggleLiveRate}
        rateStatus={status}
        onRefresh={refresh}
        displayRate={displayRate}
        routes={displayRoutes}
        best={best}
        remittance={remittanceRoute}
        sentimentScore={moodSummary?.aggregateScore}
        sentimentLabel={moodSummary?.label}
      />
      <DataRail rates={rates} status={status} fallbackUsdKrw={usdKrw} targetCurrency={targetCurrency} displayRate={displayRate} />
      <MarketMoodSection
        summary={moodSummary}
        loading={moodLoading}
        onRefresh={refreshMood}
        range={moodRange}
        onRangeChange={setMoodRange}
        trend={rateTrend}
        onTrendRefresh={refreshRateTrend}
        targetCurrency={targetCurrency}
      />
      <RateAlerts
        alerts={alerts}
        onAdd={handleAddAlert}
        onRemove={handleRemoveAlert}
        onDismissTriggered={handleDismissAlert}
        getCurrentRate={getCurrentRate}
        defaultCurrency={targetCurrency}
      />
      <RoutesTabs
        routes={displayRoutes}
        targetCurrency={targetCurrency}
        bankSpread={bankSpread}
        onBankSpreadChange={handleBankSpreadChange}
        remittanceSpread={remittanceSpread}
        onRemittanceSpreadChange={handleRemittanceSpreadChange}
        kimchiPremium={kimchiPremiumPct}
        useLiveRate={useLiveRate}
        onToggleLiveRate={handleToggleLiveRate}
        remittanceProviderId={remittanceProviderId}
        onRemittanceProviderChange={setRemittanceProviderId}
        providerOptions={providerOptions}
        coinMode={coinMode}
        onCoinModeChange={handleCoinModeChange}
        coinNetwork={coinNetwork}
        onCoinNetworkChange={handleCoinNetworkChange}
        coinNetworkOptions={coinNetworkOptions}
      />
      <NoticeSection />
      <Footer totalSavingsKrw={stats.totalSavingsKrw} visits={stats.visits} />
    </main>
  );
}
