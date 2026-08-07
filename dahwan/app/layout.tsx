import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "다환 DaHwan — 돈이 덜 새는 길을 찾는 환전 대시보드",
  description:
    "은행 환전, 해외송금, 스테이블코인 경로의 최종 수령액과 비용을 한눈에 비교하는 인터랙티브 금융 대시보드.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
