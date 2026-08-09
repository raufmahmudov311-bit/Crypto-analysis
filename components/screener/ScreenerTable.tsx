"use client";

import { useMemo, useState } from "react";
import { Search, Star, ArrowUpRight, AlertTriangle } from "lucide-react";
import { CategoryFilter, MarketCoin, useDebouncedValue, useMarkets } from "@/lib/api";
import { formatCompact, formatPercent, formatPrice } from "@/lib/format";
import { Sparkline } from "./Sparkline";
import { CategoryFilters } from "./CategoryFilters";
import { useI18n } from "@/lib/i18n";
import { useWatchlistStore } from "@/lib/store";
import Image from "next/image";

function PercentCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) return <span className="text-slate-600">—</span>;
  const positive = value >= 0;
  return (
    <span className={positive ? "neon-text-green" : "neon-text-red"}>{formatPercent(value)}</span>
  );
}

export function ScreenerTable({ onSelectCoin }: { onSelectCoin: (coin: MarketCoin) => void }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const { coins, isLoading, isRateLimited } = useMarkets(category);
  const { has, toggle } = useWatchlistStore();

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return coins;
    const q = debouncedQuery.toLowerCase();
    return coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [coins, debouncedQuery]);

  return (
    <div className="glass-panel p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="input-field w-full pl-9"
          />
        </div>
      </div>

      <div className="mb-4">
        <CategoryFilters active={category} onChange={setCategory} />
      </div>

      {isRateLimited && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2 mb-3">
          <AlertTriangle size={14} />
          Rate limited by CoinGecko — showing cached data, retrying automatically.
        </div>
      )}

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-white/5">
              <th className="py-2.5 px-3 font-medium">{t("rank")}</th>
              <th className="py-2.5 px-3 font-medium">{t("name")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("price")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("h1")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("h24")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("d7")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("marketCap")}</th>
              <th className="py-2.5 px-3 font-medium text-right">{t("volume")}</th>
              <th className="py-2.5 px-3 font-medium">{t("chart7d")}</th>
              <th className="py-2.5 px-3 font-medium text-center">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={10} className="py-3.5 px-3">
                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {!isLoading &&
              filtered.map((coin) => {
                const change24h = coin.price_change_percentage_24h_in_currency;
                const positive = (change24h ?? 0) >= 0;
                const watched = has(coin.id);
                return (
                  <tr
                    key={coin.id}
                    onClick={() => onSelectCoin(coin)}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">
                      {coin.market_cap_rank}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Image
                          src={coin.image}
                          alt={coin.symbol}
                          width={26}
                          height={26}
                          className="rounded-full"
                          unoptimized
                        />
                        <div>
                          <p className="font-medium text-slate-100 leading-tight">{coin.name}</p>
                          <p className="text-[11px] text-slate-500 uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-100">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs">
                      <PercentCell value={coin.price_change_percentage_1h_in_currency} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs">
                      <PercentCell value={coin.price_change_percentage_24h_in_currency} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs">
                      <PercentCell value={coin.price_change_percentage_7d_in_currency} />
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-300">
                      ${formatCompact(coin.market_cap)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-300">
                      ${formatCompact(coin.total_volume)}
                    </td>
                    <td className="py-3 px-3">
                      <Sparkline prices={coin.sparkline_in_7d?.price ?? []} positive={positive} />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(coin.id);
                          }}
                          title={watched ? t("unstar") : t("star")}
                          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
                        >
                          <Star
                            size={15}
                            className={watched ? "fill-neon-cyan text-neon-cyan" : "text-slate-500"}
                          />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-neon-green/10 border border-neon-green/30 text-neon-green hover:shadow-neon-green transition-all"
                        >
                          {t("buy")}
                          <ArrowUpRight size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
