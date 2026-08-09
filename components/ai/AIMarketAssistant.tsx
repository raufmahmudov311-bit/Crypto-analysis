"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MarketCoin } from "@/lib/api";

function buildSummary(coins: MarketCoin[], locale: string): string {
  if (coins.length === 0) return "";
  const sorted = [...coins].sort(
    (a, b) =>
      (b.price_change_percentage_24h_in_currency ?? 0) - (a.price_change_percentage_24h_in_currency ?? 0)
  );
  const topGainer = sorted[0];
  const topLoser = sorted[sorted.length - 1];
  const avgChange =
    coins.reduce((sum, c) => sum + (c.price_change_percentage_24h_in_currency ?? 0), 0) / coins.length;
  const marketTone = avgChange >= 0 ? { en: "risk-on", az: "risk-iştahalı", ru: "risk-on" } : { en: "risk-off", az: "risk-off", ru: "risk-off" };

  const templates: Record<string, string> = {
    en: `Market breadth is ${marketTone.en} today, with the average top-100 asset moving ${avgChange.toFixed(2)}% over 24h. ${topGainer.name} (${topGainer.symbol.toUpperCase()}) leads gainers at ${(topGainer.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}%, while ${topLoser.name} lags at ${(topLoser.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}%. Momentum indicators suggest traders are rotating into higher-beta names; watch volume confirmation before adding exposure.`,
    az: `Bazar bu gün ${marketTone.az} rejimindədir, top-100 aktivlərin orta dəyişimi 24 saatda ${avgChange.toFixed(2)}% təşkil edir. ${topGainer.name} (${topGainer.symbol.toUpperCase()}) ${(topGainer.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}% ilə liderdir, ${topLoser.name} isə ${(topLoser.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}% ilə geridə qalır. Momentum indikatorları treyderlərin yüksək-beta aktivlərə keçdiyini göstərir; əlavə mövqe açmazdan əvvəl həcm təsdiqini gözləyin.`,
    ru: `Сегодня рынок в режиме ${marketTone.ru}, средний актив топ-100 изменился на ${avgChange.toFixed(2)}% за 24ч. ${topGainer.name} (${topGainer.symbol.toUpperCase()}) лидирует с ростом ${(topGainer.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}%, а ${topLoser.name} отстаёт с ${(topLoser.price_change_percentage_24h_in_currency ?? 0).toFixed(1)}%. Индикаторы momentum указывают на ротацию в активы с высокой бетой; дождитесь подтверждения объёмом перед увеличением позиций.`,
  };

  return templates[locale] ?? templates.en;
}

export function AIMarketAssistant({ coins }: { coins: MarketCoin[] }) {
  const { t, locale } = useI18n();
  const [generating, setGenerating] = useState(true);
  const [tick, setTick] = useState(0);

  const summary = useMemo(() => buildSummary(coins, locale), [coins, locale, tick]);

  useEffect(() => {
    setGenerating(true);
    const timer = setTimeout(() => setGenerating(false), 900);
    return () => clearTimeout(timer);
  }, [coins.length, locale, tick]);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
            <Sparkles size={15} className="text-neon-cyan" />
          </div>
          <h3 className="font-semibold text-slate-100 text-sm">{t("dailySummary")}</h3>
        </div>
        <button
          onClick={() => setTick((n) => n + 1)}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={13} className={`text-slate-400 ${generating ? "animate-spin" : ""}`} />
        </button>
      </div>

      {generating || coins.length === 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            {t("generating")}
          </p>
          <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
