"use client";

import AnimatedNumber from "./AnimatedNumber";
import RouteIcon from "./RouteIcon";
import { formatCurrency, formatKrw } from "@/lib/format";
import { CurrencyCode, RouteResult, StableAsset } from "@/lib/types";
import { motion } from "framer-motion";

// Flat pill-button selector — used for picking a real remittance provider
// (해외송금 card).
interface RoutePicker {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

// Two-tier selector for the USDT card: pick a coin (or "기본 시뮬레이션")
// first, then — only once a coin is picked — pick that coin's network.
// Was a single flat list of every asset+network combo (8 pills in one
// scrollable row); split into two steps so the option count per row stays
// small instead of needing a long horizontal scroll.
interface CoinPicker {
  mode: "auto" | StableAsset;
  onModeChange: (mode: "auto" | StableAsset) => void;
  network: string;
  onNetworkChange: (network: string) => void;
  networkOptions: { id: string; label: string }[]; // options for the currently-selected mode only
}

interface RouteCardProps {
  route: RouteResult;
  rank: number;
  isBest: boolean;
  maxCost: number;
  targetCurrency: CurrencyCode;
  providerPicker?: RoutePicker;
  coinPicker?: CoinPicker;
}

export default function RouteCard({ route, rank, isBest, maxCost, targetCurrency, providerPicker, coinPicker }: RouteCardProps) {
  const barWidth = Math.max(3, (route.totalCost / maxCost) * 100);
  const providerId = providerPicker ? providerPicker.selected : undefined;
  // "auto" is the coin picker's sentinel for "no specific network picked"
  // (mirrors providerPicker's "generic") — leave asset undefined so
  // RouteIcon falls back to its default USDT badge instead of trying to
  // look up a badge for "auto".
  const asset = coinPicker && coinPicker.mode !== "auto" ? coinPicker.mode : undefined;

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative rounded-[20px] border bg-paper shadow-soft ${
        isBest ? "border-t-4 border-t-coral border-x-line border-b-line" : "border-line"
      }`}
    >
      {isBest && (
        <span className="absolute -top-3 right-4 z-10 rounded-sm bg-coral px-2.5 py-1 text-[11px] font-bold text-forest shadow-[0_0_16px_rgba(42,245,195,0.45)]">
          최종 수령액 1위
        </span>
      )}

      <div
        className={`flex h-full flex-col overflow-hidden rounded-b-[20px] rounded-t-[18px] p-6 sm:p-[27px] ${
          // isBest's border-t is 4px vs 1px elsewhere — trim 3px off the top
          // padding to compensate so the header stays visually aligned
          // across best/non-best cards instead of sitting 3px lower.
          isBest ? "pt-[21px] sm:pt-6" : ""
        }`}
      >
        <div className="flex items-center gap-3.5">
          <RouteIcon type={route.key} providerId={providerId} asset={asset} />
          <div>
            <h3 className="text-[18px] font-semibold tracking-tight text-ink">{route.name}</h3>
            <p className="mt-1 text-[11px] text-muted">{route.eyebrow}</p>
          </div>
          <strong className="ml-auto font-mono text-[15px] font-bold text-muted">#{rank}</strong>
        </div>

        {providerPicker && (
          <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label={providerPicker.ariaLabel ?? "옵션 선택"}>
            {providerPicker.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => providerPicker.onChange(opt.id)}
                aria-pressed={providerPicker.selected === opt.id}
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  providerPicker.selected === opt.id
                    ? "bg-coral text-forest"
                    : "border border-line text-muted hover:border-coral/50 hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {coinPicker && (
          <div className="mt-4 space-y-1.5">
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="코인 선택">
              {(["auto", "USDT", "USDC"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => coinPicker.onModeChange(m)}
                  aria-pressed={coinPicker.mode === m}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    coinPicker.mode === m
                      ? "bg-coral text-forest"
                      : "border border-line text-muted hover:border-coral/50 hover:text-ink"
                  }`}
                >
                  {m === "auto" ? "기본 시뮬레이션" : m}
                </button>
              ))}
            </div>
            {coinPicker.mode !== "auto" && (
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="네트워크 선택">
                {coinPicker.networkOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => coinPicker.onNetworkChange(opt.id)}
                    aria-pressed={coinPicker.network === opt.id}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                      coinPicker.network === opt.id
                        ? "border border-coral/60 bg-coral/15 text-coral"
                        : "border border-line text-muted hover:border-coral/50 hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-b border-line py-6">
          <span className="block text-[11px] text-muted">예상 수령액</span>
          <strong className="my-1.5 block text-[28px] tracking-tight text-ink sm:text-[34px]">
            <AnimatedNumber value={route.received} format={(v) => formatCurrency(v, targetCurrency)} />
          </strong>
          <small className="block text-[11px] text-muted">
            실질 환율 1 {targetCurrency} = {formatKrw(route.effectiveRate).replace("원", "")}원
          </small>
        </div>

        <div className="-mx-6 grid grid-cols-2 gap-px bg-line sm:-mx-[27px]">
          <span className="flex justify-between bg-forest2 px-3.5 py-2.5 text-[11px] text-muted">
            예상 시간 <b className="font-semibold text-ink">{route.speed}</b>
          </span>
          <span className="flex justify-between bg-forest2 px-3.5 py-2.5 text-[11px] text-muted">
            경로 위험{" "}
            <b className={`font-semibold ${route.risk === "높음" ? "text-[#ff8a80]" : "text-ink"}`}>{route.risk}</b>
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between text-[12px] text-muted">
          <span>총 예상 비용</span>
          <strong className="text-sm text-ink">
            <AnimatedNumber value={route.totalCost} format={formatKrw} />
          </strong>
        </div>
        <div className="my-2.5 h-[5px] overflow-hidden rounded-full bg-forest2">
          <motion.span
            initial={false}
            animate={{ width: `${barWidth}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="block h-full bg-coral"
          />
        </div>

        {/* min-h sized for the longest card's content (USDT's 5 detail
            rows), not just enough for the shortest (bank's 2 rows). On
            desktop the 3-column grid already stretches every card to match
            its tallest row-mate via CSS grid's default align-items, but on
            mobile the cards stack in a single column where nothing forces
            them to match — without this, scrolling from the short bank
            card straight into the much taller USDT card felt like the
            "boxes" were randomly different sizes rather than just holding
            different amounts of real cost detail. */}
        <div className="min-h-[190px] flex-1">
          {route.details.map((d) => (
            <div key={d.label} className="my-2.5 flex items-center justify-between text-[11px] text-muted">
              <span className="flex items-center">
                <i className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full" style={{ background: d.color }} />
                {d.label}
              </span>
              <b className="font-medium text-ink">{formatKrw(d.value)}</b>
            </div>
          ))}
        </div>

        <p className="-mx-6 -mb-6 mt-4 flex min-h-[42px] items-center gap-2 rounded-b-[20px] bg-forest2 px-[18px] py-3 text-[11px] leading-relaxed text-muted sm:-mx-[27px] sm:-mb-[27px]">
          <span className="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border border-line font-serif text-[10px] text-muted">
            i
          </span>
          {route.note}
        </p>
      </div>
    </motion.article>
  );
}
