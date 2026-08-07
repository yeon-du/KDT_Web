import { formatNumber, formatRate } from "@/lib/format";
import { CurrencyCode, RatesResponse, RateStatus } from "@/lib/types";

interface DataRailProps {
  rates: RatesResponse | null;
  status: RateStatus;
  fallbackUsdKrw: number;
  targetCurrency: CurrencyCode;
  displayRate: number;
}

// Small inline placeholder for the rail's per-field values while the first
// fetch is still in flight, so the rail doesn't show a mix of a real
// fallback number (USD/KRW) next to bare "—" text for the other fields.
function Skeleton() {
  return <span className="inline-block h-3 w-12 animate-pulse rounded bg-line align-middle" />;
}

export default function DataRail({ rates, status, fallbackUsdKrw, targetCurrency, displayRate }: DataRailProps) {
  const isReal = rates?.source === "real";
  const statusLabel =
    status === "live"
      ? isReal
        ? "실제 시세 연결됨"
        : "모의 시세 연결됨"
      : status === "loading"
        ? "시세 연결 중"
        : "마지막 값 사용 중";
  const sourceSuffix = isReal ? "" : " · 모의";
  const pulseClass =
    status === "live"
      ? "bg-coral shadow-[0_0_0_3px_rgba(42,245,195,0.18)] animate-livePulse"
      : status === "error"
        ? "bg-muted/60 shadow-none"
        : "bg-coral2 shadow-[0_0_0_3px_rgba(143,245,224,0.18)]";

  return (
    // Hero and RoutesTabs each carry their own page-gutter padding
    // (px-6 sm:px-10 lg:px-[clamp(...)]) directly on their outer <section>,
    // insetting their content/cards from the viewport edge. This rail (and
    // MarketMoodSection/NoticeSection below it) skipped that and only had
    // *internal* padding on the bordered box itself — so the box's actual
    // border sat flush against the screen edges on mobile, edge-to-edge,
    // instead of matching the ~24px inset every other section has. That's
    // what made it visually "bigger" than its neighbors. Splitting into an
    // outer gutter wrapper + inner bordered box (same split Hero/RoutesTabs
    // don't need only because they don't have a visible border of their own)
    // fixes it without changing the max-w centering.
    <div className="px-6 sm:px-10 lg:px-[clamp(24px,7.5vw,120px)]">
      <div
        aria-label="데이터 기준"
        className="mx-auto mb-6 mt-4 flex max-w-[1140px] flex-wrap items-center gap-x-6 gap-y-2.5 rounded-2xl border border-line bg-forest2 px-5 py-3 text-[11px] text-muted sm:mb-8 sm:px-6"
      >
        <div className="flex items-center border-r border-line pr-6">
          <span className={`mr-1.5 inline-block h-[7px] w-[7px] rounded-full ${pulseClass}`} />
          {statusLabel}
        </div>
        <div className="border-r border-line pr-6">
          USD/KRW <b className="font-semibold text-ink">{formatNumber(rates?.usdKrw ?? fallbackUsdKrw)}원</b>
          <small className="ml-1.5 text-[10px] text-muted">Frankfurter/ECB{sourceSuffix}</small>
        </div>
        {targetCurrency !== "USD" && (
          <div className="border-r border-line pr-6">
            {targetCurrency}/KRW <b className="font-semibold text-coral">{formatRate(displayRate)}원</b>
            <small className="ml-1.5 text-[10px] text-muted">Frankfurter/ECB{sourceSuffix}</small>
          </div>
        )}
        <div className="border-r border-line pr-6">
          USDT/KRW <b className="font-semibold text-ink">{rates ? `${formatNumber(rates.usdtKrw)}원` : <Skeleton />}</b>
          <small className="ml-1.5 text-[10px] text-muted">Upbit{sourceSuffix}</small>
        </div>
        <div className="border-r border-line pr-6">
          USDC/KRW <b className="font-semibold text-ink">{rates ? `${formatNumber(rates.usdcKrw)}원` : <Skeleton />}</b>
          <small className="ml-1.5 text-[10px] text-muted">Upbit{sourceSuffix}</small>
        </div>
        <div className="border-r border-line pr-6">
          김치 프리미엄{" "}
          <b className={`font-semibold ${(rates?.kimchiPremium ?? 0) < 0 ? "text-coral" : "text-[#ff8a80]"}`}>
            {rates ? `${rates.kimchiPremium >= 0 ? "+" : ""}${rates.kimchiPremium.toFixed(2)}%` : <Skeleton />}
          </b>
        </div>
        <div className="ml-auto">
          업데이트{" "}
          <b className="font-semibold text-ink">
            {rates ? (
              new Date(rates.fetchedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
            ) : (
              <Skeleton />
            )}
          </b>
        </div>
      </div>
    </div>
  );
}
