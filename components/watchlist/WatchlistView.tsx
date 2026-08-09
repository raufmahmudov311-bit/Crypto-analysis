"use client";

import { Star, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { MarketCoin } from "@/lib/api";
import { formatPercent, formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useWatchlistStore } from "@/lib/store";
import { Sparkline } from "../screener/Sparkline";

export function WatchlistView({
  coins,
  onSelectCoin,
}: {
  coins: MarketCoin[];
  onSelectCoin: (coin: MarketCoin) => void;
}) {
  const { t } = useI18n();
  const { ids, toggle } = useWatchlistStore();
  const watched = coins.filter((c) => ids.includes(c.id));

  if (watched.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <Star size={28} className="mx-auto text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 max-w-xs mx-auto">{t("emptyWatchlist")}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {watched.map((coin) => {
        const change = coin.price_change_percentage_24h_in_currency ?? 0;
        const positive = change >= 0;
        return (
          <div
            key={coin.id}
            onClick={() => onSelectCoin(coin)}
            className="glass-panel p-4 cursor-pointer hover:border-neon-cyan/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Image src={coin.image} alt={coin.symbol} width={24} height={24} className="rounded-full" unoptimized />
                <div>
                  <p className="text-sm font-medium text-slate-100">{coin.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(coin.id);
                }}
              >
                <Star size={15} className="fill-neon-cyan text-neon-cyan" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-slate-100 font-semibold">{formatPrice(coin.current_price)}</p>
                <p className={`text-xs font-mono ${positive ? "neon-text-green" : "neon-text-red"}`}>
                  {formatPercent(change)}
                </p>
              </div>
              <Sparkline prices={coin.sparkline_in_7d?.price ?? []} positive={positive} />
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md bg-neon-green/10 border border-neon-green/30 text-neon-green">
              {t("buy")}
              <ArrowUpRight size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
