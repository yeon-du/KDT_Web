"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import RouteCard from "./RouteCard";
import SettingsPanel from "./SettingsPanel";
import { CurrencyCode, RouteResult, StableAsset } from "@/lib/types";

interface ComparisonSectionProps {
  routes: RouteResult[];
  targetCurrency: CurrencyCode;
  bankSpread: number;
  onBankSpreadChange: (v: number) => void;
  remittanceSpread: number;
  onRemittanceSpreadChange: (v: number) => void;
  kimchiPremium: number;
  useLiveRate: boolean;
  onToggleLiveRate: (v: boolean) => void;
  remittanceProviderId: string;
  onRemittanceProviderChange: (id: string) => void;
  providerOptions: { id: string; label: string }[];
  coinMode: "auto" | StableAsset;
  onCoinModeChange: (mode: "auto" | StableAsset) => void;
  coinNetwork: string;
  onCoinNetworkChange: (network: string) => void;
  coinNetworkOptions: Record<StableAsset, { id: string; label: string }[]>;
}

export default function ComparisonSection({
  routes,
  targetCurrency,
  bankSpread,
  onBankSpreadChange,
  remittanceSpread,
  onRemittanceSpreadChange,
  kimchiPremium,
  useLiveRate,
  onToggleLiveRate,
  remittanceProviderId,
  onRemittanceProviderChange,
  providerOptions,
  coinMode,
  onCoinModeChange,
  coinNetwork,
  onCoinNetworkChange,
  coinNetworkOptions,
}: ComparisonSectionProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const sorted = [...routes].sort((a, b) => b.received - a.received);
  const bestKey = sorted[0].key;
  const maxCost = Math.max(...routes.map((r) => r.totalCost));
  const coinKeySuffix = coinMode === "auto" ? "auto" : `${coinMode}:${coinNetwork}`;

  return (
    <div>
      <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-bold text-coral">은행과 송금 비교</p>
          <h2 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px] lg:text-[36px]">세 가지 외화 확보 경로</h2>
          <p className="mt-2.5 text-xs text-muted">수수료와 스프레드를 모두 제외한, 실제로 받는 금액이 많은 순서로 보여드려요.</p>
        </div>
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          aria-expanded={settingsOpen}
          className="cursor-pointer whitespace-nowrap rounded-full border border-line px-4 py-2.5 text-xs text-muted transition hover:border-coral/50 hover:text-ink"
        >
          <span className="mr-1 text-coral">⌁</span> 비용 가정 {settingsOpen ? "닫기" : "조정하기"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {settingsOpen && (
          <SettingsPanel
            bankSpread={bankSpread}
            onBankSpreadChange={onBankSpreadChange}
            remittanceSpread={remittanceSpread}
            onRemittanceSpreadChange={onRemittanceSpreadChange}
            kimchiPremium={kimchiPremium}
            useLiveRate={useLiveRate}
            onToggleLiveRate={onToggleLiveRate}
          />
        )}
      </AnimatePresence>

      {/* Mobile stacks these in a single column with only the shadow + a
          1px border (close in color to the card fill itself) marking where
          one card ends and the next begins — a 12px gap wasn't enough
          visual breathing room for that boundary to read clearly at a
          glance, especially scrolling past quickly, so it looked like one
          continuous block instead of 3 separate cards. Widened on mobile
          only; sm+/lg (where the grid's own column gutters already help
          separate cards) keep their original gap. */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {routes.map((route) => (
          <RouteCard
            key={
              route.key === "remittance"
                ? `remittance-${remittanceProviderId}`
                : route.key === "usdt"
                  ? `usdt-${coinKeySuffix}`
                  : route.key
            }
            route={route}
            rank={sorted.findIndex((r) => r.key === route.key) + 1}
            isBest={route.key === bestKey}
            maxCost={maxCost}
            targetCurrency={targetCurrency}
            providerPicker={
              route.key === "remittance"
                ? { options: providerOptions, selected: remittanceProviderId, onChange: onRemittanceProviderChange, ariaLabel: "송금 업체 선택" }
                : undefined
            }
            coinPicker={
              route.key === "usdt"
                ? {
                    mode: coinMode,
                    onModeChange: onCoinModeChange,
                    network: coinNetwork,
                    onNetworkChange: onCoinNetworkChange,
                    networkOptions: coinMode !== "auto" ? coinNetworkOptions[coinMode] : [],
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
