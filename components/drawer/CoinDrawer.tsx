"use client";

import { X, Star, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { MarketCoin } from "@/lib/api";
import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import { PriceChart } from "./PriceChart";
import { SentimentGauge } from "./SentimentGauge";
import { OnChainSummary } from "./OnChainSummary";
import { useI18n } from "@/lib/i18n";
import { useWatchlistStore } from "@/lib/store";

export function CoinDrawer({ coin, onClose }: { coin: MarketCoin | null; onClose: () => void }) {
  const { t } = useI18n();
  const { has, toggle } = useWatchlistStore();

  if (!coin) return null;
  const change24h = coin.price_change_percentage_24h_in_currency ?? 0;
  const positive = change24h >= 0;
  const watched = has(coin.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:w-[460px] h-full bg-base-900 border-l border-white/10 overflow-y-auto animate-slide-in shadow-glass">
        <div className="sticky top-0 z-10 bg-base-900/95 backdrop-blur-lg border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src={coin.image} alt={coin.symbol} width={30} height={30} className="rounded-full" unoptimized />
            <div>
              <p className="font-semibold text-slate-100 leading-tight">{coin.name}</p>
              <p className="text-[11px] text-slate-500 uppercase">{coin.symbol}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-end gap-3 mb-1">
              <p className="text-3xl font-bold font-mono text-slate-100">{formatPrice(coin.current_price)}</p>
              <span className={`text-sm font-mono pb-1 ${positive ? "neon-text-green" : "neon-text-red"}`}>
                {formatPercent(change24h)}
              </span>
            </div>
            <div className="flex gap-4 text-[11px] text-slate-500">
              <span>
                {t("marketCap")}: <span className="text-slate-300">${formatCompact(coin.market_cap)}</span>
              </span>
              <span>
                {t("volume")}: <span className="text-slate-300">${formatCompact(coin.total_volume)}</span>
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-sm py-2.5 rounded-lg bg-neon-green/10 border border-neon-green/40 text-neon-green hover:shadow-neon-green transition-all font-medium">
              {t("buy")}
              <ArrowUpRight size={15} />
            </button>
            <button
              onClick={() => toggle(coin.id)}
              className={`px-4 rounded-lg border transition-all flex items-center justify-center ${
                watched
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                  : "border-white/10 text-slate-400 hover:border-white/25"
              }`}
            >
              <Star size={16} className={watched ? "fill-neon-cyan" : ""} />
            </button>
          </div>

          <div className="glass-card p-4">
            <PriceChart coinId={coin.id} />
          </div>

          <div className="glass-card p-4">
            <SentimentGauge coinId={coin.id} />
          </div>

          <div className="glass-card p-4">
            <OnChainSummary coinId={coin.id} volume={coin.total_volume} />
          </div>
        </div>
      </div>
    </div>
  );
}
