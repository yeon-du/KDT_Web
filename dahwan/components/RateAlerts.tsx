"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CURRENCIES } from "@/lib/constants";
import { emailAlertsConfigured } from "@/lib/emailAlert";
import { formatRate } from "@/lib/format";
import { readLocal, writeLocal } from "@/lib/persist";
import { CurrencyCode, RateAlert } from "@/lib/types";

const EMAIL_KEY = "dahwan:alert-email:v1";

interface RateAlertsProps {
  alerts: RateAlert[];
  onAdd: (currency: CurrencyCode, direction: "above" | "below", targetRate: number, email?: string) => void;
  onRemove: (id: string) => void;
  onDismissTriggered: (id: string) => void;
  getCurrentRate: (currency: CurrencyCode) => number;
  defaultCurrency: CurrencyCode;
}

// Floating bell (fixed, bottom-left — mirrors the "시장 동향" panel on the
// opposite corner). Alerts are checked client-side against the app's
// existing live/manual rate on every update; there's no push server behind
// this static export, so it only fires a browser Notification while this
// tab stays open. That limitation is stated up front rather than implied.
export default function RateAlerts({ alerts, onAdd, onRemove, onDismissTriggered, getCurrentRate, defaultCurrency }: RateAlertsProps) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [direction, setDirection] = useState<"above" | "below">("below");
  const [targetRate, setTargetRate] = useState("");
  // Remembered across visits (same object-wrapped pattern as WelcomeModal's
  // seen-flag) so a person doesn't have to retype their email for every new
  // alert. Read lazily in useState's initializer rather than an effect —
  // there's nothing to "restore over" here since it starts empty either way.
  const [email, setEmail] = useState(() => readLocal<{ email: string }>(EMAIL_KEY, { email: "" }).email);

  // Keep the "새 알림 추가" currency in sync with whichever currency is
  // selected up in the main comparison — it was only reading defaultCurrency
  // once at mount, so switching 받는 통화 later left this stuck on whatever
  // currency was selected when the page first loaded.
  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const untriggeredCount = alerts.filter((a) => !a.triggeredAt).length;
  const triggeredCount = alerts.filter((a) => a.triggeredAt).length;

  const trimmedEmail = email.trim();
  // Very loose check — just enough to catch "forgot the @" typos before
  // wiring it into EmailJS, not full RFC validation.
  const emailLooksValid = trimmedEmail === "" || /\S+@\S+\.\S+/.test(trimmedEmail);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    writeLocal(EMAIL_KEY, { email: v.trim() });
  };

  const handleAdd = () => {
    const rate = Number(targetRate.replace(/[^0-9.]/g, ""));
    if (!rate || rate <= 0) return;
    if (!emailLooksValid) return;

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    onAdd(currency, direction, rate, trimmedEmail || undefined);
    setTargetRate("");
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="환율 알림 패널 열기"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-line bg-paper/90 px-4 py-3 text-[12px] font-semibold text-ink shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:border-coral/50 sm:bottom-7 sm:left-7"
      >
        <span className="relative">
          🔔
          {triggeredCount > 0 && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff8a80]" aria-hidden />
          )}
        </span>
        환율 알림{untriggeredCount > 0 ? ` (${untriggeredCount})` : ""}
        <span className="text-muted">{open ? "▾" : "▴"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              aria-label="패널 닫기"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            />
            <motion.aside
              role="dialog"
              aria-label="환율 알림"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed bottom-24 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-[420px] rounded-3xl border border-line bg-paper p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:left-7 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-coral">Prototype · 실험 기능</p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">환율 알림</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="rounded-full border border-line px-2.5 py-1.5 text-[11px] text-muted transition hover:border-coral/50 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <p className="mb-4 rounded-xl bg-forest2 px-3.5 py-3 text-[10px] leading-relaxed text-muted">
                이 브라우저 탭이 열려 있는 동안에만 감지돼요. 서버가 없는 정적 사이트라 앱을 꺼도 오는 푸시·문자
                알림은 아직 지원하지 않아요.
              </p>

              <div className="rounded-2xl border border-line bg-forest2 p-3.5">
                <span className="mb-2 block text-[11px] font-semibold text-muted">새 알림 추가</span>
                <div className="flex items-center gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    aria-label="알림 통화"
                    className="rounded-lg border border-line bg-paper px-2.5 py-2 text-[12px] font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-forest text-white">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="flex rounded-lg border border-line bg-paper p-0.5" role="group" aria-label="조건">
                    <button
                      type="button"
                      onClick={() => setDirection("below")}
                      aria-pressed={direction === "below"}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                        direction === "below" ? "bg-coral text-forest" : "text-muted hover:text-ink"
                      }`}
                    >
                      이하일 때
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("above")}
                      aria-pressed={direction === "above"}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                        direction === "above" ? "bg-coral text-forest" : "text-muted hover:text-ink"
                      }`}
                    >
                      이상일 때
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder={`예: ${formatRate(getCurrentRate(currency))}`}
                    aria-label="목표 환율"
                    className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-[13px] font-semibold text-ink outline-none placeholder:text-muted placeholder:font-normal focus-visible:ring-2 focus-visible:ring-coral/60"
                  />
                  <span className="shrink-0 text-[11px] text-muted">원</span>
                  <button
                    onClick={handleAdd}
                    disabled={!emailLooksValid}
                    className="shrink-0 rounded-lg bg-coral px-3.5 py-2 text-[12px] font-bold text-forest transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    추가
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-muted">
                  현재 1 {currency} = {formatRate(getCurrentRate(currency))}원
                </p>

                {/* Optional — leaving this blank keeps the old browser-only
                    Notification behavior. Filling it in adds an email sent
                    through EmailJS (client-side, no backend) whenever a new
                    alert's condition is met. Remembered per-browser so it
                    doesn't need retyping for every alert. */}
                <label className="mt-3 block border-t border-line pt-3">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                    ✉ 알림 받을 이메일 <span className="font-normal text-muted/70">(선택)</span>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="비워두면 브라우저 알림만 와요"
                    aria-label="알림 받을 이메일"
                    className={`w-full rounded-lg border bg-paper px-3 py-2 text-[12px] text-ink outline-none placeholder:text-muted placeholder:font-normal focus-visible:ring-2 ${
                      emailLooksValid ? "border-line focus-visible:ring-coral/60" : "border-[#ff8a80] focus-visible:ring-[#ff8a80]/60"
                    }`}
                  />
                  {!emailLooksValid && <p className="mt-1 text-[10px] text-[#ff8a80]">이메일 형식을 확인해주세요.</p>}
                  {emailLooksValid && trimmedEmail !== "" && !emailAlertsConfigured && (
                    <p className="mt-1 text-[10px] text-muted">
                      이메일 발송 기능이 아직 설정되지 않았어요 (lib/constants.ts의 EmailJS 값 필요) — 지금은
                      브라우저 알림만 와요.
                    </p>
                  )}
                </label>
              </div>

              <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {alerts.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-muted">등록된 알림이 없어요.</p>
                )}
                {alerts.map((a) => {
                  const current = getCurrentRate(a.currency);
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 ${
                        a.triggeredAt ? "border-coral/60 bg-coral/[0.08]" : "border-line bg-forest2"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                          1 {a.currency} {a.direction === "above" ? "≥" : "≤"} {formatRate(a.targetRate)}원
                          {a.email && (
                            <span aria-label="이메일 알림 포함" title={a.email} className="text-[10px] text-coral">
                              ✉
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {a.triggeredAt ? "조건 달성됨 · " : "현재 "}
                          {formatRate(current)}원
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {a.triggeredAt && (
                          <button
                            onClick={() => onDismissTriggered(a.id)}
                            className="rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold text-forest transition hover:brightness-110"
                          >
                            확인
                          </button>
                        )}
                        <button
                          onClick={() => onRemove(a.id)}
                          aria-label="알림 삭제"
                          className="rounded-full border border-line px-2 py-1 text-[10px] text-muted transition hover:border-coral/50 hover:text-ink"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
