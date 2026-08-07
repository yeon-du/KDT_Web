import { generateMockRates } from "./mockRates";
import { RatesResponse } from "./types";
import { FX_FALLBACK } from "./constants";

// Real market data, sourced from two free, keyless, CORS-enabled public
// APIs that (unlike the remittance providers' internal calculator APIs)
// are explicitly built for direct client-side/browser use:
//  - Frankfurter (ECB reference rates) for USD/KRW and the other FX
//    crosses — updated once per European business day, not intraday.
//  - Upbit's public ticker for USDT/USDC KRW trade prices — genuinely
//    live, since it's a real order-book market.
// bankSpread/remittanceSpread have no such public feed (no institution
// publishes "today's implied FX spread"), so those two stay simulated
// even when everything else here is real — see lib/mockRates.ts.
const FRANKFURTER = "https://api.frankfurter.dev/v1";
const UPBIT_TICKER = "https://api.upbit.com/v1/ticker";

interface UpbitTicker {
  market: string;
  trade_price: number;
}

export async function fetchRealRates(): Promise<RatesResponse | null> {
  try {
    const [fxRes, upbitRes] = await Promise.all([
      fetch(`${FRANKFURTER}/latest?base=USD&symbols=KRW,JPY,EUR,GBP,SGD,CAD,AUD`, { cache: "no-store" }),
      fetch(`${UPBIT_TICKER}?markets=KRW-USDT,KRW-USDC`, { cache: "no-store" }),
    ]);
    if (!fxRes.ok || !upbitRes.ok) return null;

    const fxData = (await fxRes.json()) as { rates: Record<string, number> };
    const upbitData = (await upbitRes.json()) as UpbitTicker[];

    const usdKrw = fxData.rates?.KRW;
    if (!usdKrw) return null;

    const usdt = upbitData.find((t) => t.market === "KRW-USDT");
    const usdc = upbitData.find((t) => t.market === "KRW-USDC");
    if (!usdt || !usdc) return null;

    const usdtKrw = usdt.trade_price;
    const usdcKrw = usdc.trade_price;
    const kimchiPremium = Math.round((usdtKrw / usdKrw - 1) * 100 * 100) / 100;

    // No public feed for these two — reuse the same simulated jitter the
    // rest of the app already uses for cost assumptions.
    const mock = generateMockRates();

    return {
      usdKrw,
      usdtKrw,
      usdcKrw,
      kimchiPremium,
      bankSpread: mock.bankSpread,
      remittanceSpread: mock.remittanceSpread,
      fxRates: {
        USD: 1,
        JPY: fxData.rates?.JPY ?? FX_FALLBACK.JPY,
        EUR: fxData.rates?.EUR ?? FX_FALLBACK.EUR,
        GBP: fxData.rates?.GBP ?? FX_FALLBACK.GBP,
        SGD: fxData.rates?.SGD ?? FX_FALLBACK.SGD,
        CAD: fxData.rates?.CAD ?? FX_FALLBACK.CAD,
        AUD: fxData.rates?.AUD ?? FX_FALLBACK.AUD,
      },
      fetchedAt: new Date().toISOString(),
      source: "real",
    };
  } catch {
    return null;
  }
}
