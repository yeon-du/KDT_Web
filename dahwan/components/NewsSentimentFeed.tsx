"use client";

import { useState } from "react";
import { NewsSentimentItem, stanceMeta } from "@/lib/newsSentiment";
import { CurrencyCode } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(iso: string): string {
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (diffMin < 1) return "방금";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 60 * 24) return `${Math.round(diffMin / 60)}시간 전`;
  return `${Math.round(diffMin / (60 * 24))}일 전`;
}

interface NewsSentimentFeedProps {
  items: NewsSentimentItem[];
  currency: CurrencyCode;
}

export default function NewsSentimentFeed({ items, currency }: NewsSentimentFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-line/70" aria-label="최근 환율 뉴스 헤드라인">
      {items.map((item) => {
        const meta = stanceMeta(item.stance, currency);
        const expanded = expandedId === item.id;
        return (
          <li key={item.id} className="py-3">
            <button
              onClick={() => setExpandedId(expanded ? null : item.id)}
              aria-expanded={expanded}
              className="-mx-2 flex w-[calc(100%+16px)] items-start gap-3 rounded-lg px-2 py-0.5 text-left transition-colors hover:bg-forest2/60"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: meta.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-snug text-ink">{item.headline}</span>
                <span className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                  <span>{item.source}</span>
                  <span aria-hidden>·</span>
                  <span>{timeAgo(item.publishedAt)}</span>
                  <span
                    className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-forest"
                    style={{ background: meta.color }}
                  >
                    {meta.label}
                  </span>
                </span>
              </span>
              <span className="mt-1 shrink-0 text-muted">{expanded ? "▲" : "▼"}</span>
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-5 mt-2 overflow-hidden text-[11px] leading-relaxed text-muted"
                >
                  {item.reason}
                  {item.link && (
                    <>
                      {" "}
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-semibold text-coral underline underline-offset-2"
                      >
                        원문 보기 ↗
                      </a>
                    </>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
