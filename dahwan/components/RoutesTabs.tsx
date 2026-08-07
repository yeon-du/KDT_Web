"use client";

import ComparisonSection from "./ComparisonSection";
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

// Used to be a tab switcher between this comparison and a separate
// "코인 네트워크 비교" drill-down (CryptoSection/CoinCard). Once the USDT
// card here grew its own inline coin+network picker — mirroring the
// 해외송금 card's provider picker — that separate tab became a second,
// differently-shaped way to do the exact same thing, so it was retired in
// favor of a single unified view. This component is just the section
// wrapper around ComparisonSection at this point.
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
    // px-6 sm:px-10 lg:px-[clamp(...)] matches the gutter Hero and
    // DataRail/MarketMoodSection/NoticeSection all use — this was missing
    // the sm:px-10 step, so at tablet-ish widths this section's cards sat
    // 16px closer to the screen edge (wider) than every other section on
    // the page instead of matching their gutter.
    <section id="compare" className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10 sm:py-14 lg:px-[clamp(24px,7.5vw,120px)] lg:py-16">
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
  );
}
