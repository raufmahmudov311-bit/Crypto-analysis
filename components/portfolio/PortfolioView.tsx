"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MarketCoin } from "@/lib/api";
import { formatPrice, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { usePortfolioStore } from "@/lib/store";

const PALETTE = ["#00E5FF", "#00FF66", "#FF3366", "#F6851B", "#AB9FF2", "#3B99FC", "#FFD166"];

export function PortfolioView({ coins }: { coins: MarketCoin[] }) {
  const { t } = useI18n();
  const { transactions, addTransaction, removeTransaction } = usePortfolioStore();
  const [coinId, setCoinId] = useState(coins[0]?.id ?? "");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const enriched = useMemo(() => {
    return transactions.map((tx) => {
      const coin = coins.find((c) => c.id === tx.coinId);
      const currentPrice = coin?.current_price ?? tx.buyPrice;
      const costBasis = tx.buyPrice * tx.quantity;
      const marketValue = currentPrice * tx.quantity;
      const pnl = marketValue - costBasis;
      const pnlPct = costBasis === 0 ? 0 : (pnl / costBasis) * 100;
      return { ...tx, coin, currentPrice, costBasis, marketValue, pnl, pnlPct };
    });
  }, [transactions, coins]);

  const totals = useMemo(() => {
    const cost = enriched.reduce((s, e) => s + e.costBasis, 0);
    const value = enriched.reduce((s, e) => s + e.marketValue, 0);
    return { cost, value, pnl: value - cost, pnlPct: cost === 0 ? 0 : ((value - cost) / cost) * 100 };
  }, [enriched]);

  const distribution = useMemo(() => {
    const bySymbol: Record<string, number> = {};
    enriched.forEach((e) => {
      const symbol = e.coin?.symbol.toUpperCase() ?? e.symbol.toUpperCase();
      bySymbol[symbol] = (bySymbol[symbol] ?? 0) + e.marketValue;
    });
    return Object.entries(bySymbol).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  function handleAdd() {
    const price = parseFloat(buyPrice);
    const qty = parseFloat(quantity);
    const coin = coins.find((c) => c.id === coinId);
    if (!coin || !price || !qty) return;
    addTransaction({ coinId: coin.id, symbol: coin.symbol, buyPrice: price, quantity: qty });
    setBuyPrice("");
    setQuantity("");
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Plus size={15} className="text-neon-cyan" />
          {t("addTransaction")}
        </h3>
        <div className="grid sm:grid-cols-4 gap-2">
          <select value={coinId} onChange={(e) => setCoinId(e.target.value)} className="input-field">
            {coins.slice(0, 100).map((c) => (
              <option key={c.id} value={c.id}>
                {c.symbol.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder={t("buyPrice")}
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder={t("quantity")}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-field"
          />
          <button onClick={handleAdd} className="btn-primary py-2 text-sm">
            {t("addTransaction")}
          </button>
        </div>
      </div>

      {enriched.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <Briefcase size={28} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 max-w-xs mx-auto">{t("emptyPortfolio")}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500">{t("netPnl")}</p>
                <p className={`text-2xl font-bold font-mono ${totals.pnl >= 0 ? "neon-text-green" : "neon-text-red"}`}>
                  {formatPrice(totals.pnl)}{" "}
                  <span className="text-sm">({formatPercent(totals.pnlPct)})</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {enriched.map((e) => (
                <div key={e.id} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {e.coin && (
                      <img src={e.coin.image} alt={e.coin.symbol} className="w-7 h-7 rounded-full" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {e.coin?.symbol.toUpperCase() ?? e.symbol.toUpperCase()}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {e.quantity} @ {formatPrice(e.buyPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-mono ${e.pnl >= 0 ? "neon-text-green" : "neon-text-red"}`}>
                      {formatPrice(e.pnl)}
                    </p>
                    <p className={`text-[10px] font-mono ${e.pnl >= 0 ? "neon-text-green" : "neon-text-red"}`}>
                      {formatPercent(e.pnlPct)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeTransaction(e.id)}
                    className="ml-3 p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-neon-red transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <p className="text-xs text-slate-500 mb-2">{t("distribution")}</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f1621", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => formatPrice(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {distribution.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
