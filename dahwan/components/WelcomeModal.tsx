"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { readLocal, writeLocal } from "@/lib/persist";

const SEEN_KEY = "dahwan:welcome-seen:v1";

interface UseCase {
  icon: string;
  title: string;
  body: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: "🎓",
    title: "유학비·생활비 정기 송금",
    body: "매달 같은 금액을 보내도 방법마다 수수료가 달라요. 정기적으로 보낸다면 그 차이가 쌓여요.",
  },
  {
    icon: "🏠",
    title: "해외 부동산·투자 자금",
    body: "목돈을 한 번에 보낼 땐 스프레드 몇 %도 꽤 큰 금액이 돼요. 미리 비교하고 보내세요.",
  },
  {
    icon: "💼",
    title: "해외 거래대금·사업 자금",
    body: "해외 파트너·거래처에 대금을 보내거나 받을 때, 은행 환전보다 나은 경로가 있을 수 있어요.",
  },
  {
    icon: "✈️",
    title: "해외 이주·이민 자금",
    body: "이주 자금처럼 큰 금액을 옮길 땐 환율 스프레드 차이가 특히 크게 느껴져요.",
  },
];

// One-time first-visit modal explaining what the site is actually useful
// for. The three-way comparison itself was always the point, but nothing
// on the page ever spelled out *when* someone should reach for it — this
// fills that gap without becoming a recurring nag (dismissed once, stays
// dismissed via localStorage, same pattern as the rest of the app's
// persisted state).
export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = readLocal<{ seen: boolean }>(SEEN_KEY, { seen: false }).seen;
    if (!seen) {
      // Small delay so it doesn't compete with the page's own mount
      // animations firing at the same instant.
      const id = window.setTimeout(() => setOpen(true), 400);
      return () => window.clearTimeout(id);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    writeLocal(SEEN_KEY, { seen: true });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="닫기"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
          />
          {/* Centering via flexbox on a full-screen fixed wrapper, not
              left-1/2+top-1/2+-translate classes — Framer Motion writes its
              own inline `transform` for the y/scale animation below, which
              silently overrides any Tailwind translate-based centering
              classes on the same element (inline style always wins over a
              stylesheet class, regardless of specificity). That was making
              the dialog render anchored at the viewport's center point by
              its top-left corner instead of actually centered, so it looked
              like it was floating in the wrong spot. */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="다환 소개"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full max-w-[480px] rounded-3xl border border-line bg-paper p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-7"
            >
              <p className="text-[11px] font-bold text-coral">다환은 이럴 때 써보세요</p>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink sm:text-[22px]">
                같은 돈을 보내도, 방법에 따라 받는 돈이 달라요
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                은행 환전 · 해외송금 · 스테이블코인 경로를 한 번에 비교해서, 수수료와 스프레드를 조금이라도 아낄 수
                있는 경로를 찾아드려요. 특히 아래 같은 경우에 차이가 크게 느껴져요.
              </p>

              <div className="mt-4 space-y-2.5">
                {USE_CASES.map((u) => (
                  <div key={u.title} className="flex gap-3 rounded-xl bg-forest2 p-3.5">
                    <span aria-hidden className="shrink-0 text-lg leading-none">
                      {u.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink">{u.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{u.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={dismiss}
                className="mt-5 w-full rounded-full bg-coral py-3 text-[13px] font-bold text-forest transition hover:brightness-110"
              >
                시작하기
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
