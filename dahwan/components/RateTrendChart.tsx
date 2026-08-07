"use client";

import { formatRate } from "@/lib/format";
import { RateTrendPoint } from "@/lib/rateTrend";

interface RateTrendChartProps {
  points: RateTrendPoint[];
  label: string;
}

const WIDTH = 320;
const HEIGHT = 120;
const PAD_Y = 12;
const PAD_X_LEFT = 46;
const CHART_WIDTH = WIDTH - PAD_X_LEFT;

export default function RateTrendChart({ points, label }: RateTrendChartProps) {
  if (points.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center rounded-xl bg-forest2 text-[11px] text-muted">
        표시할 데이터가 부족해요
      </div>
    );
  }

  const rates = points.map((p) => p.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const span = max - min || 1;

  const yFor = (rate: number) => HEIGHT - PAD_Y - ((rate - min) / span) * (HEIGHT - PAD_Y * 2);

  const coords = points.map((p, i) => ({
    x: PAD_X_LEFT + (i / (points.length - 1)) * CHART_WIDTH,
    y: yFor(p.rate),
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${WIDTH} ${HEIGHT} L ${PAD_X_LEFT} ${HEIGHT} Z`;
  const lastPoint = coords[coords.length - 1];

  const gridValues = [max, (max + min) / 2, min];

  return (
    <div aria-label={`${label} 환율 추이 그래프`}>
      {/* The last point's circle (cx = WIDTH, r = 4) draws 4 SVG units past
          the viewBox's own right edge — with overflow-visible that bled
          out of the SVG's box uncapped. Nothing on the page clips
          horizontal overflow at a higher level (see globals.css), so even
          that few px was enough to make the whole page horizontally
          scrollable. Dropping overflow-visible clips it to the viewBox
          like a normal SVG. */}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        <defs>
          <linearGradient id="rateTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2af5c3" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2af5c3" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((v, i) => {
          const y = yFor(v);
          return (
            <g key={i}>
              <line
                x1={PAD_X_LEFT}
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="#1e2c42"
                strokeWidth="1"
                strokeDasharray={i === 1 ? "3 3" : undefined}
              />
              <text x={PAD_X_LEFT - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="7" fill="#8291a6">
                {formatRate(v)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#rateTrendFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="#2af5c3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#2af5c3" stroke="#0a1220" strokeWidth="2" />
      </svg>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted" style={{ paddingLeft: `${(PAD_X_LEFT / WIDTH) * 100}%` }}>
        <span>{points[0].label}</span>
        <span>{points[points.length - 1].label}</span>
      </div>
    </div>
  );
}
