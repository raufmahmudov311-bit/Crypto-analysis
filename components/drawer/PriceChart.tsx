"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCoinChart } from "@/lib/api";
import { macd, relativeStrengthIndex, simpleMovingAverage, volumeProfileBuckets } from "@/lib/indicators";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const TIMEFRAMES = ["1D", "1W", "1M", "1Y"];
type IndicatorId = "rsi" | "macd" | "volProfile" | "ma";

export function PriceChart({ coinId }: { coinId: string }) {
  const { t } = useI18n();
  const [timeframe, setTimeframe] = useState("1W");
  const [activeIndicators, setActiveIndicators] = useState<Set<IndicatorId>>(new Set());
  const { points, isLoading } = useCoinChart(coinId, timeframe);

  const prices = useMemo(() => points.map((p) => p.price), [points]);
  const chartData = useMemo(() => {
    const ma20 = simpleMovingAverage(prices, 20);
    return points.map((p, i) => ({
      time: new Date(p.time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...(timeframe === "1D" ? { hour: "2-digit" } : {}),
      }),
      price: p.price,
      ma20: ma20[i],
    }));
  }, [points, prices, timeframe]);

  const rsiData = useMemo(() => {
    const rsi = relativeStrengthIndex(prices, 14);
    return chartData.map((d, i) => ({ time: d.time, rsi: rsi[i] }));
  }, [prices, chartData]);

  const macdData = useMemo(() => {
    const { macdLine, signalLine, histogram } = macd(prices);
    return chartData.map((d, i) => ({
      time: d.time,
      macd: macdLine[i],
      signal: signalLine[i],
      hist: histogram[i],
    }));
  }, [prices, chartData]);

  const volProfile = useMemo(() => {
    const proxyVolume = prices.map(() => 1 + Math.random());
    return volumeProfileBuckets(prices, proxyVolume, 10);
  }, [prices]);

  function toggleIndicator(id: IndicatorId) {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const indicatorButtons: { id: IndicatorId; label: string }[] = [
    { id: "ma", label: t("ma") },
    { id: "rsi", label: t("rsi") },
    { id: "macd", label: t("macd") },
    { id: "volProfile", label: t("volProfile") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                timeframe === tf
                  ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10"
                  : "border-white/10 text-slate-400 hover:border-white/25"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <span className="text-[11px] text-slate-500 mr-1">{t("indicators")}:</span>
        {indicatorButtons.map((ind) => (
          <button
            key={ind.id}
            onClick={() => toggleIndicator(ind.id)}
            className={`text-[11px] px-2 py-1 rounded-md border transition-all ${
              activeIndicators.has(ind.id)
                ? "border-neon-green/50 text-neon-green bg-neon-green/10"
                : "border-white/10 text-slate-500 hover:border-white/25"
            }`}
          >
            {ind.label}
          </button>
        ))}
      </div>

      <div className="h-56 w-full">
        {isLoading ? (
          <div className="h-full w-full bg-white/5 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} minTickGap={40} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(v) => formatPrice(v)}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  background: "#0f1621",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => formatPrice(value)}
              />
              <Area type="monotone" dataKey="price" stroke="#00E5FF" strokeWidth={2} fill="url(#priceFill)" />
              {activeIndicators.has("ma") && (
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#00FF66"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 3"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {activeIndicators.has("rsi") && (
        <div className="mt-3">
          <p className="text-[11px] text-slate-500 mb-1">{t("rsi")} (14)</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rsiData}>
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ background: "#0f1621", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="rsi" stroke="#00E5FF" fill="#00E5FF22" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeIndicators.has("macd") && (
        <div className="mt-3">
          <p className="text-[11px] text-slate-500 mb-1">{t("macd")}</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={macdData}>
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#0f1621", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="hist">
                  {macdData.map((d, i) => (
                    <Cell key={i} fill={(d.hist ?? 0) >= 0 ? "#00FF66" : "#FF3366"} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="macd" stroke="#00E5FF" dot={false} strokeWidth={1.2} />
                <Line type="monotone" dataKey="signal" stroke="#FF3366" dot={false} strokeWidth={1.2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeIndicators.has("volProfile") && (
        <div className="mt-3">
          <p className="text-[11px] text-slate-500 mb-1">{t("volProfile")}</p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%" >
              <BarChart data={volProfile} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="priceLevel"
                  tick={{ fontSize: 9, fill: "#64748b" }}
                  tickFormatter={(v) => formatPrice(v)}
                  width={64}
                />
                <Bar dataKey="volume" fill="#00E5FF66" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
