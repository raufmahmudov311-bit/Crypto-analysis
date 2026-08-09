"use client";

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function seededSplit(coinId: string): number {
  let hash = 0;
  for (let i = 0; i < coinId.length; i++) hash = (hash * 31 + coinId.charCodeAt(i)) % 1000;
  return 35 + (hash % 40); // bullish % between 35-75
}

export function SentimentGauge({ coinId }: { coinId: string }) {
  const { t } = useI18n();
  const base = useMemo(() => seededSplit(coinId), [coinId]);
  const [voted, setVoted] = useState<"bull" | "bear" | null>(null);
  const [bullPct, setBullPct] = useState(base);

  function vote(direction: "bull" | "bear") {
    if (voted) return;
    setVoted(direction);
    setBullPct((prev) => Math.min(97, Math.max(3, prev + (direction === "bull" ? 2 : -2))));
  }

  const bearPct = 100 - bullPct;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">{t("sentiment")}</span>
        <span className="text-xs font-mono text-slate-400">
          <span className="neon-text-green">{bullPct}%</span> / <span className="neon-text-red">{bearPct}%</span>
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full overflow-hidden bg-base-700 flex">
        <div className="h-full bg-neon-green shadow-neon-green" style={{ width: `${bullPct}%` }} />
        <div className="h-full bg-neon-red shadow-neon-red" style={{ width: `${bearPct}%` }} />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => vote("bull")}
          disabled={!!voted}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all disabled:opacity-70 ${
            voted === "bull"
              ? "border-neon-green/60 bg-neon-green/10 text-neon-green"
              : "border-white/10 text-slate-400 hover:border-neon-green/40"
          }`}
        >
          <TrendingUp size={14} />
          {t("bullish")}
        </button>
        <button
          onClick={() => vote("bear")}
          disabled={!!voted}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-all disabled:opacity-70 ${
            voted === "bear"
              ? "border-neon-red/60 bg-neon-red/10 text-neon-red"
              : "border-white/10 text-slate-400 hover:border-neon-red/40"
          }`}
        >
          <TrendingDown size={14} />
          {t("bearish")}
        </button>
      </div>
    </div>
  );
}
