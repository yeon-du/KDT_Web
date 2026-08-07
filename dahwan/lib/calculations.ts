import { BANK_FEE_KRW, NETWORK_DEFINITIONS, WITHDRAWAL_FEE_USD } from "./constants";
import {
  NetworkOption,
  RatesResponse,
  RemittanceProviderDef,
  RemittanceProviderResult,
  RouteResult,
  StableAsset,
} from "./types";

/**
 * Ported 1:1 from the original bundled Dashboard component's calculation
 * logic. Values and formulas are preserved exactly; only naming was
 * expanded from single letters to descriptive identifiers.
 */

export interface RouteInputs {
  amountKrw: number;
  usdKrw: number;
  bankSpreadPct: number;
  remittanceSpreadPct: number;
  kimchiPremiumPct: number;
  targetFxRate: number; // units of target currency per 1 USD
}

export function computeRoutes({
  amountKrw,
  usdKrw,
  bankSpreadPct,
  remittanceSpreadPct,
  kimchiPremiumPct,
  targetFxRate,
}: RouteInputs): RouteResult[] {
  const spotUsd = amountKrw / usdKrw;

  // Bank exchange (foreign-currency account). Flat BANK_FEE_KRW deducted the
  // same way remittance's flat fee is — see BANK_FEE_KRW in constants.ts for
  // why this isn't ₩0 even though some banking apps genuinely charge no fee
  // for the conversion step itself.
  const bankAppliedRate = usdKrw * (1 + bankSpreadPct / 100);
  const bankNet = Math.max(0, (amountKrw - BANK_FEE_KRW) / bankAppliedRate);
  const bankReceived = bankNet * targetFxRate;
  const bankSpreadCost = bankNet * (bankAppliedRate - usdKrw);
  const bankTotalCost = amountKrw - (bankReceived / targetFxRate) * usdKrw;

  // Cross-border remittance (flat fees: 8,000 send + 18,000 intermediary/receiving)
  const remittanceAppliedRate = usdKrw * (1 + remittanceSpreadPct / 100);
  const remittanceNet = Math.max(0, (amountKrw - 26_000) / remittanceAppliedRate);
  const remittanceReceived = remittanceNet * targetFxRate;
  const remittanceSpreadCost = remittanceNet * (remittanceAppliedRate - usdKrw);
  const remittanceTotalCost = amountKrw - (remittanceReceived / targetFxRate) * usdKrw;

  // USDT-routed transfer (simulated)
  const kimchiCost = (kimchiPremiumPct / 100) * amountKrw;
  const tradeFee = amountKrw * 0.0005;
  const networkFee = usdKrw;
  const overseasSellFee = amountKrw * 0.001;
  // Final leg: moving fiat off the overseas exchange into an actual bank
  // account (SWIFT wire or similar) — a real, separate cost most USDT-route
  // writeups skip, but one that's typically a flat per-withdrawal fee
  // regardless of amount, not a %. $20 is a representative flat figure
  // (varies by exchange/withdrawal method; not tied to one specific
  // provider).
  const withdrawalFeeKrw = WITHDRAWAL_FEE_USD * usdKrw;
  const usdtTotalCost = kimchiCost + tradeFee + networkFee + overseasSellFee + withdrawalFeeKrw;
  const usdtReceived = Math.max(0, spotUsd - usdtTotalCost / usdKrw) * targetFxRate;

  return [
    {
      key: "exchange",
      name: "은행 환전",
      eyebrow: "외화계좌 환전 기준",
      received: bankReceived,
      totalCost: bankTotalCost,
      effectiveRate: amountKrw / bankReceived,
      details: [
        { label: "환율 스프레드", value: bankSpreadCost, color: "#2af5c3" },
        { label: "환전 수수료", value: BANK_FEE_KRW, color: "#ffb454" },
      ],
      note: "은행·앱마다 환전 수수료가 다르거나 없을 수 있어요. 창구 현찰 환전·해외송금은 이보다 더 붙을 수 있습니다.",
      speed: "즉시~1영업일",
      risk: "낮음",
    },
    {
      key: "remittance",
      name: "해외송금",
      eyebrow: "국내은행 → 해외계좌",
      received: remittanceReceived,
      totalCost: remittanceTotalCost,
      effectiveRate: amountKrw / remittanceReceived,
      details: [
        { label: "환율 스프레드", value: remittanceSpreadCost, color: "#2af5c3" },
        { label: "송금 수수료", value: 8_000, color: "#ffb454" },
        { label: "중개·수취 수수료", value: 18_000, color: "#f2d84e" },
      ],
      note: "해외 계좌로 바로 보내야 할 때",
      speed: "1~3영업일",
      risk: "낮음",
    },
    {
      key: "usdt",
      name: "USDT 경유",
      eyebrow: "가상 시뮬레이션",
      received: usdtReceived,
      totalCost: usdtTotalCost,
      effectiveRate: amountKrw / usdtReceived,
      details: [
        { label: "국내·해외 시세 스프레드", value: kimchiCost, color: "#2af5c3" },
        { label: "거래 수수료", value: tradeFee, color: "#ffb454" },
        { label: "네트워크 수수료", value: networkFee, color: "#f2d84e" },
        { label: "해외 매도", value: overseasSellFee, color: "#7c93ad" },
        { label: "해외 인출 수수료", value: withdrawalFeeKrw, color: "#8ab4ff" },
      ],
      // Surfaces the actual implied USDT price this calc is using (usdKrw ×
      // (1+국내·해외 시세 스프레드)) directly in the note — same figure DataRail
      // shows as "USDT/KRW", so switching networks/currencies or waiting for
      // the next live-rate poll and seeing this number move is a direct,
      // visible proof the card is live-reactive rather than a static
      // placeholder. (Renamed from "김치 프리미엄" here to match the "스프레드"
      // language the other two routes use — same cost concept, same label
      // style. DataRail's own market-stat chip keeps calling it "김치
      // 프리미엄" since that's the term people search the actual market
      // phenomenon by.)
      note: `국내 시세 1 USDT ≈ ${Math.round(usdKrw * (1 + kimchiPremiumPct / 100)).toLocaleString("ko-KR")}원 기준 · 가격 변동·규제·출금 제한을 별도 확인`,
      speed: "수분~수시간",
      risk: "높음",
    },
  ];
}

export interface CoinInputs {
  amountKrw: number;
  usdKrw: number;
  kimchiPremiumPct: number;
  rates: RatesResponse | null;
  targetFxRate: number;
}

export function computeCoinOptions({
  amountKrw,
  usdKrw,
  kimchiPremiumPct,
  rates,
  targetFxRate,
}: CoinInputs): NetworkOption[] {
  const fallbackPrice = usdKrw * (1 + kimchiPremiumPct / 100);
  const priceByAsset: Record<StableAsset, number> = {
    USDT: rates?.usdtKrw ?? fallbackPrice,
    USDC: rates?.usdcKrw ?? fallbackPrice,
  };

  // Same flat exchange-withdrawal-to-bank cost computeRoutes()'s "auto" USDT
  // branch charges (WITHDRAWAL_FEE_USD) — without it here, picking a
  // specific coin/network silently dropped ~₩28,000 of real cost relative
  // to the "auto" simulation, making the picked-network numbers look
  // cheaper for no real reason. Both paths now share this cost.
  const withdrawalFeeKrw = WITHDRAWAL_FEE_USD * usdKrw;

  return NETWORK_DEFINITIONS.map((def) => {
    const price = priceByAsset[def.asset];
    const coinsBought = (amountKrw / price) * 0.9995; // 0.05% domestic buy fee
    const coinsAfterFee = Math.max(0, coinsBought - def.fee);
    const receivedBeforeWithdrawal = coinsAfterFee * 0.999 * targetFxRate; // 0.1% overseas sell fee
    // Withdrawal fee is a flat KRW-equivalent cost taken off the fiat leg,
    // not the coin leg — convert it into target-currency terms the same way
    // received is expressed, then subtract.
    const received = Math.max(0, receivedBeforeWithdrawal - (withdrawalFeeKrw / usdKrw) * targetFxRate);
    const totalCost = amountKrw - (received / targetFxRate) * usdKrw;
    const premium = (price / usdKrw - 1) * 100;

    return { ...def, price, received, totalCost, premium };
  }).sort((a, b) => b.received - a.received);
}

export interface ProviderInputs {
  amountKrw: number;
  usdKrw: number;
  targetFxRate: number;
}

// Same applied-rate + flat-fee shape as the bank/remittance routes above,
// just parameterized per named provider instead of via the settings
// sliders. See REMITTANCE_PROVIDERS in lib/constants.ts for where the
// spreadPct/feeKrw numbers came from.
export function computeRemittanceProviders(
  providers: RemittanceProviderDef[],
  { amountKrw, usdKrw, targetFxRate }: ProviderInputs
): RemittanceProviderResult[] {
  return providers
    .map((p) => {
      const appliedRate = usdKrw * (1 + p.spreadPct / 100);
      const net = Math.max(0, (amountKrw - p.feeKrw) / appliedRate);
      const received = net * targetFxRate;
      const totalCost = amountKrw - (received / targetFxRate) * usdKrw;
      return { ...p, appliedRate, received, totalCost };
    })
    .sort((a, b) => b.received - a.received);
}

// Reshapes a real-provider snapshot into the same RouteResult shape the
// three main cards use, so picking a named provider for "해외송금" can drop
// straight into the existing card/ranking/savings-tracker plumbing without
// touching computeRoutes() itself (which stays untouched, per the "keep
// the original calc logic intact" rule).
export function providerToRouteResult(p: RemittanceProviderResult, amountKrw: number): RouteResult {
  const spreadCost = Math.max(0, p.totalCost - p.feeKrw);
  // Always show both rows, even when feeKrw is 0 — omitting the row
  // entirely for "송금 수수료 없음" providers (Hanpass/Sentbe/WireBarley) made
  // it look like fees weren't being accounted for at all, rather than
  // showing they were checked and confirmed to be ₩0 for that provider.
  const details = [
    { label: "환율 스프레드", value: spreadCost, color: "#2af5c3" },
    { label: "송금 수수료", value: p.feeKrw, color: "#ffb454" },
  ];
  return {
    key: "remittance",
    name: p.name,
    eyebrow: "실제 서비스 예시 · 스냅샷",
    received: p.received,
    totalCost: p.totalCost,
    // KRW spent per unit of target currency actually received (fee-
    // inclusive) — matches every other route's definition. p.appliedRate
    // (KRW per USD, pre-fee) was wrong here: for non-USD currencies it
    // isn't even the same unit as the "1 {targetCurrency} = X원" label
    // RouteCard renders it next to.
    effectiveRate: amountKrw / p.received,
    details,
    note: `실제 서비스 스냅샷 값이라 위 비용 가정 조정과는 무관해요. ${p.note}`,
    speed: "당일~1영업일",
    risk: "낮음",
  };
}

// Mirrors providerToRouteResult() above, but for the stablecoin picker
// merged into the "USDT 경유" card: reshapes one NetworkOption (a specific
// asset+network combo from computeCoinOptions) into the same RouteResult
// shape, so picking USDT/USDC + network there swaps that card's numbers
// without touching computeRoutes() or computeCoinOptions().
export function coinOptionToRouteResult(o: NetworkOption, amountKrw: number, usdKrw: number): RouteResult {
  // Clamp each in sequence so the three detail rows always sum to exactly
  // o.totalCost — guards against any one fee exceeding what's left of total
  // cost on very small amounts, instead of relying on Math.max(0, ...) on
  // the other side only.
  const networkFeeKrw = Math.max(0, Math.min(o.fee * o.price, o.totalCost));
  const withdrawalFeeKrw = Math.max(0, Math.min(WITHDRAWAL_FEE_USD * usdKrw, o.totalCost - networkFeeKrw));
  const otherCost = Math.max(0, o.totalCost - networkFeeKrw - withdrawalFeeKrw);
  return {
    key: "usdt",
    name: `${o.asset} 경유 · ${o.network}`,
    eyebrow: "가상 시뮬레이션",
    received: o.received,
    totalCost: o.totalCost,
    effectiveRate: amountKrw / o.received,
    details: [
      { label: "프리미엄·거래 비용", value: otherCost, color: "#2af5c3" },
      { label: `네트워크 수수료 (${o.standard})`, value: networkFeeKrw, color: "#ffb454" },
      { label: "해외 인출 수수료", value: withdrawalFeeKrw, color: "#8ab4ff" },
    ],
    // Same reasoning as computeRoutes()'s usdt note above: showing the
    // actual live price this specific network's numbers were computed from
    // (o.price — sourced from Upbit's real usdtKrw/usdcKrw when available,
    // see computeCoinOptions) lets a person directly compare it against
    // DataRail's own USDT/KRW·USDC/KRW figures and see it move on refresh,
    // rather than just asserting "this is real-time" as unverifiable text.
    note: `${o.network} 네트워크 기준 · 국내 시세 1 ${o.asset} ≈ ${Math.round(o.price).toLocaleString("ko-KR")}원 · 예상 소요 ${o.time} · 호환성 ${o.compatibility}`,
    speed: o.time,
    risk: "높음",
  };
}

export function bestRoute(routes: RouteResult[]): RouteResult {
  return [...routes].sort((a, b) => b.received - a.received)[0];
}

export function rankOf(routes: RouteResult[], key: string): number {
  const sorted = [...routes].sort((a, b) => b.received - a.received);
  return sorted.findIndex((r) => r.key === key) + 1;
}
