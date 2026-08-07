import { PROVIDER_BADGES } from "@/lib/constants";
import { RouteKey, StableAsset } from "@/lib/types";

interface RouteIconProps {
  type: RouteKey;
  providerId?: string;
  asset?: StableAsset;
}

// Per-coin badge styling — not official brand marks, just recognizable
// color conventions (USDT green, USDC blue) so the icon hints at which
// stablecoin is currently selected.
const COIN_BADGES: Record<StableAsset, { label: string; bg: string; fg: string }> = {
  USDT: { label: "₮", bg: "#26a17b", fg: "#ffffff" },
  USDC: { label: "$", bg: "#2775ca", fg: "#ffffff" },
};

export default function RouteIcon({ type, providerId, asset }: RouteIconProps) {
  if (type === "exchange") {
    return (
      <span aria-hidden className="flex h-[42px] w-[42px] shrink-0 items-center justify-center gap-0.5 rounded-full bg-mint font-serif text-[13px] text-coral">
        <span>₩</span>
        <i className="text-[10px] not-italic">↔</i>
        <span>$</span>
      </span>
    );
  }

  if (type === "remittance") {
    const badge = providerId && providerId !== "generic" ? PROVIDER_BADGES[providerId] : undefined;
    if (badge) {
      return (
        <span
          aria-hidden
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-serif text-[17px] font-bold"
          style={{ background: badge.bg, color: badge.fg }}
        >
          {badge.initial}
        </span>
      );
    }
    return (
      <span aria-hidden className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-mint text-[21px] font-medium text-coral">
        ↗
      </span>
    );
  }

  const coin = COIN_BADGES[asset ?? "USDT"];
  return (
    <span
      aria-hidden
      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full font-serif text-[21px] font-medium"
      style={{ background: coin.bg, color: coin.fg }}
    >
      {coin.label}
    </span>
  );
}
