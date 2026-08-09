"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Lock, Loader2, Check } from "lucide-react";
import { MarketCoin } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useProStore } from "@/lib/store";

const FEE_RATE = 0.001;

export function DexSwapWidget({ coins, onUpgrade }: { coins: MarketCoin[]; onUpgrade: () => void }) {
  const { t } = useI18n();
  const isPro = useProStore((s) => s.isPro);
  const options = coins.slice(0, 30);

  const [fromId, setFromId] = useState(options[0]?.id ?? "");
  const [toId, setToId] = useState(options[1]?.id ?? "");
  const [amount, setAmount] = useState("1");
  const [swapping, setSwapping] = useState(false);
  const [done, setDone] = useState(false);

  const fromCoin = options.find((c) => c.id === fromId) ?? options[0];
  const toCoin = options.find((c) => c.id === toId) ?? options[1];

  const output = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (!fromCoin || !toCoin) return { gross: 0, fee: 0, net: 0 };
    const usdValue = amt * fromCoin.current_price;
    const fee = usdValue * FEE_RATE;
    const net = (usdValue - fee) / toCoin.current_price;
    return { gross: usdValue / toCoin.current_price, fee, net };
  }, [amount, fromCoin, toCoin]);

  if (!isPro) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={14} className="text-slate-500" />
          <h4 className="text-sm font-medium text-slate-300">{t("dexSwap")}</h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Swap tokens directly from your connected wallet with integrated pricing.
        </p>
        <button onClick={onUpgrade} className="text-xs btn-pro px-3 py-1.5">
          {t("upgradePro")}
        </button>
      </div>
    );
  }

  function handleSwap() {
    setSwapping(true);
    setDone(false);
    setTimeout(() => {
      setSwapping(false);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    }, 1200);
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowDownUp size={14} className="text-neon-cyan" />
        <h4 className="text-sm font-medium text-slate-100">{t("dexSwap")}</h4>
      </div>

      <div className="space-y-2">
        <div className="glass-panel p-3">
          <p className="text-[10px] text-slate-500 mb-1">{t("swapFrom")}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-lg font-mono text-slate-100 w-full focus:outline-none"
            />
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="bg-base-800 border border-white/10 rounded-lg text-xs px-2 py-1.5 text-slate-200"
            >
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setFromId(toId);
              setToId(fromId);
            }}
            className="p-1.5 rounded-full bg-base-800 border border-white/10 hover:border-neon-cyan/40 transition-all"
          >
            <ArrowDownUp size={13} className="text-neon-cyan" />
          </button>
        </div>

        <div className="glass-panel p-3">
          <p className="text-[10px] text-slate-500 mb-1">{t("swapTo")}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono text-slate-100 w-full">{output.net.toFixed(6)}</span>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="bg-base-800 border border-white/10 rounded-lg text-xs px-2 py-1.5 text-slate-200"
            >
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
        <span>{t("platformFee")} (0.1%)</span>
        <span className="font-mono">${output.fee.toFixed(2)}</span>
      </div>

      <button
        onClick={handleSwap}
        disabled={swapping}
        className="btn-pro w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-2"
      >
        {swapping ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Swapping...
          </>
        ) : done ? (
          <>
            <Check size={14} /> Swapped
          </>
        ) : (
          t("swapNow")
        )}
      </button>
    </div>
  );
}
