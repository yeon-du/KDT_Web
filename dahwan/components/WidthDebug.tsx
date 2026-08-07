"use client";

import { useEffect, useState } from "react";

// TEMPORARY diagnostic — not a real feature. Renders the actual measured
// pixel rects of the mood panel and the first route card directly on the
// page as visible text, so there's no more guessing at box edges from a
// photo. Remove this component (and its one usage in app/page.tsx) once
// the width question is settled either way.
export default function WidthDebug() {
  const [text, setText] = useState("측정 중...");

  useEffect(() => {
    const measure = () => {
      const panel = document.querySelector('[aria-label="시장 동향"]') as HTMLElement | null;
      const card = document.querySelector("article") as HTMLElement | null;
      if (!panel || !card) {
        setText("박스를 못 찾음");
        return;
      }
      const p = panel.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      setText(
        `viewport=${window.innerWidth}\n` +
          `패널 L=${p.left.toFixed(0)} R=${p.right.toFixed(0)} W=${p.width.toFixed(0)}\n` +
          `카드 L=${c.left.toFixed(0)} R=${c.right.toFixed(0)} W=${c.width.toFixed(0)}`
      );
    };
    const t = setTimeout(measure, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#000",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 13,
        whiteSpace: "pre",
        padding: "8px 10px",
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}
