import { formatKrw } from "@/lib/format";

interface FooterProps {
  totalSavingsKrw?: number;
  visits?: number;
}

export default function Footer({ totalSavingsKrw = 0, visits = 0 }: FooterProps) {
  return (
    <footer className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-forest px-6 pb-24 pt-8 text-white sm:min-h-[125px] sm:px-[clamp(24px,7.5vw,120px)] sm:py-0">
      <a href="#top" className="inline-flex items-center gap-2.5 text-base font-bold transition-opacity hover:opacity-80">
        <span className="grid h-[27px] w-[27px] place-items-center rounded-full bg-mint text-[12px] text-coral">
          ⇄
        </span>
        <span>다환</span>
      </a>
      <p className="order-3 w-full text-[11px] text-[#91a7a0] sm:order-none sm:w-auto">내 돈이 어디서 덜 새는지</p>
      {visits > 0 && (
        <span className="order-4 rounded-full border border-coral/25 bg-white/[0.05] px-3 py-1.5 text-[10px] text-[#c9d7d2] sm:order-none">
          이 브라우저에서 시뮬레이션한 절감액 누적{" "}
          <b className="font-semibold text-coral">{formatKrw(totalSavingsKrw)}</b> · {visits}번째 방문
        </span>
      )}
      <span className="ml-0 font-mono text-[10px] text-[#6f8881] sm:ml-auto">Prototype · 2026</span>
    </footer>
  );
}
