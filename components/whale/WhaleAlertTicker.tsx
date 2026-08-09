"use client";

import { useEffect, useState } from "react";
import { Fish } from "lucide-react";
import { MarketCoin } from "@/lib/api";
import { formatCompact } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

interface WhaleEvent {
  id: string;
  symbol: string;
  amountUsd: number;
  direction: "in" | "out";
  exchange: string;
}

const EXCHANGES = ["Binance", "Coinbase", "OKX", "Bybit", "Kraken", "Unknown Wallet"];

function generateEvent(coins: MarketCoin[]): WhaleEvent | null {
  if (coins.length === 0) return null;
  const coin = coins[Math.floor(Math.random() * Math.min(coins.length, 40))];
  return {
    id: `${Date.now()}-${Math.random()}`,
    symbol: coin.symbol.toUpperCase(),
    amountUsd: 1_000_000 + Math.random() * 15_000_000,
    direction: Math.random() > 0.5 ? "in" : "out",
    exchange: EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)],
  };
}

export function WhaleAlertTicker({ coins }: { coins: MarketCoin[] }) {
  const { t } = useI18n();
  const [events, setEvents] = useState<WhaleEvent[]>([]);

  useEffect(() => {
    if (coins.length === 0) return;
    const seed = Array.from({ length: 8 })
      .map(() => generateEvent(coins))
      .filter((e): e is WhaleEvent => !!e);
    setEvents(seed);

    const interval = setInterval(() => {
      const next = generateEvent(coins);
      if (next) setEvents((prev) => [next, ...prev].slice(0, 20));
    }, 4500);
    return () => clearInterval(interval);
  }, [coins.length]);

  if (events.length === 0) return null;

  const loopEvents = [...events, ...events];

  return (
    <div className="glass-panel px-4 py-2.5 overflow-hidden">
      <div className="flex items-center gap-2 mb-1.5">
        <Fish size={13} className="text-neon-cyan" />
        <span className="text-[11px] uppercase tracking-wide text-slate-500">{t("whaleAlerts")}</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex gap-6 animate-ticker whitespace-nowrap w-max">
          {loopEvents.map((e, i) => (
            <span key={`${e.id}-${i}`} className="flex items-center gap-1.5 text-xs font-mono">
              <span className={e.direction === "in" ? "neon-text-green" : "neon-text-red"}>
                {e.direction === "in" ? "▲" : "▼"} ${formatCompact(e.amountUsd)}
              </span>
              <span className="text-slate-300">{e.symbol}</span>
              <span className="text-slate-600">
                {e.direction === "in" ? "→" : "←"} {e.exchange}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
