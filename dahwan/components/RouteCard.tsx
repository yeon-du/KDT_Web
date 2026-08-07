"use client";

import AnimatedNumber from "./AnimatedNumber";
import RouteIcon from "./RouteIcon";
import { formatCurrency, formatKrw } from "@/lib/format";
import { CurrencyCode, RouteResult, StableAsset } from "@/lib/types";
import { motion } from "framer-motion";

interface RoutePicker {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

interface CoinPicker {
  mode: "auto" | StableAsset;
  onModeChange: (mode: "auto" | StableAsset) => void;
  network: string;
  onNetworkChange: (network: string) => void;
  networkOptions: { id: string; label: string }[];
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
        className={`flex h-full flex-col overflow-hidden rounded-b-[20px] rounded-t-[18px] p-4 sm:p-[27px] ${
          isBest ? "pt-[13px] sm:pt-6" : ""
        }`}
      >
        <div className="flex items-center gap-3.5">
          <RouteIcon type={route.key} providerId={providerId} asset={asset} />
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink sm:text-[18px]">{route.name}</h3>
            <p className="mt-1 text-[11px] text-muted">{route.eyebrow}</p>
          </div>
          <strong className="ml-auto font-mono text-[15px] font-bold text-muted">#{rank}</strong>
        </div>

        <div className="mt-4 min-h-[34px] sm:min-h-[38px]">
          {providerPicker && (
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label={providerPicker.ariaLabel ?? "옵션 선택"}>
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
            <div className="space-y-1.5">
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
        </div>

        <div className="border-b border-line py-4 sm:py-6">
          <span className="block text-[11px] text-muted">예상 수령액</span>
          <strong className="my-1.5 block text-2xl tracking-tight text-ink sm:text-[34px]">
            <AnimatedNumber value={route.received} format={(v) => formatCurrency(v, targetCurrency)} />
          </strong>
          <small className="block text-[11px] text-muted">
            실질 환율 1 {targetCurrency} = {formatKrw(route.effectiveRate).replace("원", "")}원
          </small>
        </div>

        <div className="-mx-4 grid grid-cols-2 gap-px bg-line sm:-mx-[27px]">
          <span className="flex justify-between bg-forest2 px-3 py-2 text-[11px] text-muted sm:px-3.5 sm:py-2.5">
            예상 시간 <b className="font-semibold text-ink">{route.speed}</b>
          </span>
          <span className="flex justify-between bg-forest2 px-3 py-2 text-[11px] text-muted sm:px-3.5 sm:py-2.5">
            경로 위험{" "}
            <b className={`font-semibold ${route.risk === "높음" ? "text-[#ff8a80]" : "text-ink"}`}>{route.risk}</b>
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-[12px] text-muted sm:mt-5">
          <span>{route.totalCost < 0 ? "총 예상 이득" : "총 예상 비용"}</span>
          <strong className={`text-sm ${route.totalCost < 0 ? "text-coral" : "text-ink"}`}>
            <AnimatedNumber value={Math.abs(route.totalCost)} format={formatKrw} />
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

        <div className="min-h-[150px] flex-1 sm:min-h-[190px]">
          {route.details.map((d) => (
            <div key={d.label} className="my-2 flex items-center justify-between text-[11px] text-muted sm:my-2.5">
              <span className="flex items-center">
                <i className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full" style={{ background: d.color }} />
                {d.label}
              </span>
              <b className="font-medium text-ink">{formatKrw(d.value)}</b>
            </div>
          ))}
        </div>

        <p className="-mx-4 -mb-4 mt-3 flex min-h-[56px] items-start gap-2 rounded-b-[20px] bg-forest2 px-4 py-2.5 text-[11px] leading-relaxed text-muted sm:-mx-[27px] sm:-mb-[27px] sm:mt-4 sm:min-h-[60px] sm:px-[18px] sm:py-3">
          <span className="mt-0.5 grid h-[15px] w-[15px] shrink-0 place-items-center rounded-full border border-line font-serif text-[10px] text-muted">
            i
          </span>
          <span className="line-clamp-2">{route.note}</span>
        </p>
      </div>
    </motion.article>
  );
}
