"use client";

import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Fish } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCompact } from "@/lib/format";

function seededRandom(seed: string, salt: number) {
  let hash = 0;
  const str = seed + salt;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 100000;
  return hash / 100000;
}

export function OnChainSummary({ coinId, volume }: { coinId: string; volume: number }) {
  const { t } = useI18n();

  const data = useMemo(() => {
    const inflow = volume * (0.02 + seededRandom(coinId, 1) * 0.05);
    const outflow = volume * (0.015 + seededRandom(coinId, 2) * 0.05);
    const whaleMoves = Array.from({ length: 3 }).map((_, i) => ({
      amount: 1_000_000 + seededRandom(coinId, 10 + i) * 9_000_000,
      direction: seededRandom(coinId, 20 + i) > 0.5 ? "in" : "out",
    }));
    return { inflow, outflow, whaleMoves };
  }, [coinId, volume]);

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{t("onchain")}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-neon-green mb-1">
            <ArrowDownToLine size={13} />
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t("inflow")}</span>
          </div>
          <p className="text-sm font-mono font-semibold text-slate-100">${formatCompact(data.inflow)}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 text-neon-red mb-1">
            <ArrowUpFromLine size={13} />
            <span className="text-[10px] uppercase tracking-wide text-slate-500">{t("outflow")}</span>
          </div>
          <p className="text-sm font-mono font-semibold text-slate-100">${formatCompact(data.outflow)}</p>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mb-1.5">{t("whaleMoves")}</p>
      <div className="space-y-1.5">
        {data.whaleMoves.map((m, i) => (
          <div key={i} className="glass-card flex items-center justify-between px-3 py-2">
            <span className="flex items-center gap-2 text-xs text-slate-300">
              <Fish size={13} className="text-neon-cyan" />
              Whale #{i + 1}
            </span>
            <span
              className={`text-xs font-mono ${m.direction === "in" ? "neon-text-green" : "neon-text-red"}`}
            >
              {m.direction === "in" ? "+" : "-"}${formatCompact(m.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
