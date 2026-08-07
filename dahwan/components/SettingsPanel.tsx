"use client";

import { motion } from "framer-motion";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  min?: number;
  disabled?: boolean;
}

// Static (non-draggable) track + dot, sized to match SliderField's track
// exactly — used for the read-only spread below so all three columns in
// the grid keep the same visual rhythm instead of the read-only one
// looking shorter/unfinished next to two real sliders. Deliberately NOT an
// <input disabled>: that would visually read as "temporarily locked while
// live mode is on, drag it once you switch off" (matching how the other
// two sliders dim), which is the wrong signal here — this one is never
// draggable.
function ReadonlyMeter({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div aria-hidden className="relative h-[3px] w-full rounded-full bg-[#5e756e]">
      <div className="absolute inset-y-0 left-0 rounded-full bg-coral/50" style={{ width: `${pct}%` }} />
      <div
        className="absolute top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-coral shadow-md"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

function SliderField({ label, value, onChange, max, min = 0, disabled }: SliderFieldProps) {
  return (
    <label className="block px-[18px] py-3 pb-3.5">
      <span className="mb-2 flex justify-between text-xs text-[#c9d7d2]">
        {label}
        <b className="text-white">{value.toFixed(2)}%</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-[3px] w-full cursor-pointer appearance-none rounded-full bg-[#5e756e] accent-coral disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-coral [&::-webkit-slider-thumb]:shadow-md"
      />
    </label>
  );
}

interface SettingsPanelProps {
  bankSpread: number;
  onBankSpreadChange: (v: number) => void;
  remittanceSpread: number;
  onRemittanceSpreadChange: (v: number) => void;
  kimchiPremium: number;
  useLiveRate: boolean;
  onToggleLiveRate: (v: boolean) => void;
}

export default function SettingsPanel({
  bankSpread,
  onBankSpreadChange,
  remittanceSpread,
  onRemittanceSpreadChange,
  kimchiPremium,
  useLiveRate,
  onToggleLiveRate,
}: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="-mt-3 mb-6 overflow-hidden rounded-2xl bg-forest text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-[18px] py-3">
        <p className="text-[11px] leading-relaxed text-[#9fb2ac]">
          {useLiveRate
            ? "실시간 시세에 맞춰 비용 가정이 자동으로 갱신되고 있어요."
            : "슬라이더를 직접 조정한 상태예요. 실시간 반영으로 되돌릴 수 있어요."}
        </p>
        <button
          onClick={() => onToggleLiveRate(!useLiveRate)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            useLiveRate ? "bg-coral text-forest" : "border border-white/20 text-[#c9d7d2] hover:text-white"
          }`}
        >
          {useLiveRate ? "● 실시간 반영 중" : "실시간 반영으로 전환"}
        </button>
      </div>
      <div className="grid gap-px sm:grid-cols-3">
        <SliderField
          label="은행 환전 스프레드"
          value={bankSpread}
          onChange={onBankSpreadChange}
          max={2}
          disabled={useLiveRate}
        />
        <SliderField
          label="해외송금 스프레드"
          value={remittanceSpread}
          onChange={onRemittanceSpreadChange}
          max={2}
          disabled={useLiveRate}
        />
        {/* Read-only, unlike the two sliders above — this used to be an
            editable "김치 프리미엄" slider, but that made it look like
            something the person could tune in their favor. It's actually
            just the live market's domestic-vs-overseas USDT price gap, the
            same kind of cost the other two routes' spreads represent, so
            it's now always sourced from live data (or the fallback) and
            can't be dragged — matches its "스프레드" framing in the USDT
            card's cost breakdown below. */}
        <div className="block px-[18px] py-3 pb-3.5">
          <span className="mb-2 flex items-center justify-between text-xs text-[#c9d7d2]">
            <span className="flex items-center gap-1.5">
              국내·해외 시세 스프레드
              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-coral">
                실시간
              </span>
            </span>
            <b className="text-white">
              {kimchiPremium >= 0 ? "+" : ""}
              {kimchiPremium.toFixed(2)}%
            </b>
          </span>
          <ReadonlyMeter value={kimchiPremium} min={-3} max={8} />
          <p className="mt-2 text-[10px] leading-relaxed text-[#9fb2ac]">
            국내 USDT 시세가 해외보다 얼마나 비싼지를 나타내는 값이라, 직접 조정할 수는 없고 시세를 그대로
            따라가요.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
