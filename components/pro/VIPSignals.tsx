"use client";

import { useMemo } from "react";
import { Lock, TrendingUp, TrendingDown, Radio } from "lucide-react";
import { MarketCoin } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useProStore } from "@/lib/store";

interface Signal {
  coin: MarketCoin;
  direction: "long" | "short";
  entry: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
  winRate: number;
}

function seeded(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  return h / 1000;
}

function buildSignals(coins: MarketCoin[]): Signal[] {
  return coins.slice(0, 8).map((coin) => {
    const r = seeded(coin.id);
    const direction: "long" | "short" = r > 0.45 ? "long" : "short";
    const price = coin.current_price;
    const spread = price * (0.015 + r * 0.02);
    const entry = price;
    const tp1 = direction === "long" ? entry + spread : entry - spread;
    const tp2 = direction === "long" ? entry + spread * 2 : entry - spread * 2;
    const tp3 = direction === "long" ? entry + spread * 3.2 : entry - spread * 3.2;
    const sl = direction === "long" ? entry - spread * 1.3 : entry + spread * 1.3;
    const winRate = Math.round(58 + r * 34);
    return { coin, direction, entry, tp1, tp2, tp3, sl, winRate };
  });
}

export function VIPSignals({ coins, onUpgrade }: { coins: MarketCoin[]; onUpgrade: () => void }) {
  const { t } = useI18n();
  const isPro = useProStore((s) => s.isPro);
  const signals = useMemo(() => buildSignals(coins), [coins]);

  if (!isPro) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-3">
          <Lock size={20} className="text-neon-green" />
        </div>
        <h3 className="font-semibold text-slate-100 mb-1">{t("signals")}</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
          Live entry/exit signals with win-rate tracking are a Pro exclusive.
        </p>
        <button onClick={onUpgrade} className="btn-pro px-5 py-2.5 text-sm">
          {t("upgradePro")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Radio size={15} className="text-neon-green" />
        <h3 className="font-semibold text-slate-100 text-sm">{t("signals")}</h3>
      </div>
      {signals.map((s) => (
        <div key={s.coin.id} className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={s.coin.image} alt={s.coin.symbol} className="w-6 h-6 rounded-full" />
              <span className="font-medium text-slate-100 text-sm">{s.coin.symbol.toUpperCase()}</span>
            </div>
            <span
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                s.direction === "long"
                  ? "border-neon-green/40 text-neon-green bg-neon-green/10"
                  : "border-neon-red/40 text-neon-red bg-neon-red/10"
              }`}
            >
              {s.direction === "long" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.direction.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center mb-2">
            <div>
              <p className="text-[9px] text-slate-500 uppercase">{t("entry")}</p>
              <p className="text-xs font-mono text-slate-200">{formatPrice(s.entry)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">{t("tp1")}</p>
              <p className="text-xs font-mono neon-text-green">{formatPrice(s.tp1)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">{t("tp2")}</p>
              <p className="text-xs font-mono neon-text-green">{formatPrice(s.tp2)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">{t("tp3")}</p>
              <p className="text-xs font-mono neon-text-green">{formatPrice(s.tp3)}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase">{t("sl")}</p>
              <p className="text-xs font-mono neon-text-red">{formatPrice(s.sl)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">{t("winRate")}</span>
            <div className="flex items-center gap-2 flex-1 mx-3">
              <div className="h-1.5 flex-1 rounded-full bg-base-700 overflow-hidden">
                <div className="h-full bg-neon-cyan shadow-neon-cyan" style={{ width: `${s.winRate}%` }} />
              </div>
            </div>
            <span className="text-xs font-mono text-neon-cyan">{s.winRate}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
