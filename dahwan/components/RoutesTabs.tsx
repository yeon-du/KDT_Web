"use client";

import ComparisonSection from "./ComparisonSection";
import PageGutter from "./PageGutter";
import { CurrencyCode, RouteResult, StableAsset } from "@/lib/types";

interface RoutesTabsProps {
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

export default function RoutesTabs({
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
}: RoutesTabsProps) {
  return (
    <PageGutter className="py-10 sm:py-14 lg:py-16">
      <section id="compare">
        <ComparisonSection
          routes={routes}
          targetCurrency={targetCurrency}
          bankSpread={bankSpread}
          onBankSpreadChange={onBankSpreadChange}
          remittanceSpread={remittanceSpread}
          onRemittanceSpreadChange={onRemittanceSpreadChange}
          kimchiPremium={kimchiPremium}
          useLiveRate={useLiveRate}
          onToggleLiveRate={onToggleLiveRate}
          remittanceProviderId={remittanceProviderId}
          onRemittanceProviderChange={onRemittanceProviderChange}
          providerOptions={providerOptions}
          coinMode={coinMode}
          onCoinModeChange={onCoinModeChange}
          coinNetwork={coinNetwork}
          onCoinNetworkChange={onCoinNetworkChange}
          coinNetworkOptions={coinNetworkOptions}
        />
      </section>
    </PageGutter>
  );
}
