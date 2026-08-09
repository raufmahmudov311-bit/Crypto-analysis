"use client";

import { useState } from "react";
import { X, Check, CreditCard, Coins, Crown, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useProStore } from "@/lib/store";

type Step = "plans" | "checkout" | "success";
type BillingCycle = "monthly" | "yearly";
type PayMethod = "card" | "crypto";

const FREE_FEATURES = ["Live top-100 screener", "Basic charting", "Watchlist (local)", "Community sentiment"];
const PRO_FEATURES = [
  "VIP Trading Signals (Entry/TP1-3/SL)",
  "Telegram real-time alert bot",
  "DEX swap widget (0.1% fee)",
  "Full indicator suite (RSI, MACD, Volume Profile)",
  "On-chain whale analytics",
  "Priority AI market reports",
];

export function SubscriptionModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { activatePro } = useProStore();
  const [step, setStep] = useState<Step>("plans");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [processing, setProcessing] = useState(false);

  const price = cycle === "monthly" ? 12 : 9;

  function handlePay() {
    setProcessing(true);
    setTimeout(() => {
      activatePro(cycle);
      setProcessing(false);
      setStep("success");
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-glass relative">
        <button onClick={onClose} className="absolute right-5 top-5 p-1.5 rounded-lg hover:bg-white/5">
          <X size={18} className="text-slate-400" />
        </button>

        {step === "plans" && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-neon-green" />
              <h2 className="text-lg font-semibold text-slate-100">{t("unlockPro")}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">Choose the plan that fits your trading style.</p>

            <div className="flex items-center justify-center gap-1 glass-card p-1 w-fit mx-auto mb-5">
              {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    cycle === c ? "bg-neon-cyan/15 text-neon-cyan" : "text-slate-500"
                  }`}
                >
                  {t(c)}
                  {c === "yearly" && <span className="ml-1 text-neon-green">-25%</span>}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div className="glass-card p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{t("freeTier")}</p>
                <p className="text-2xl font-bold text-slate-100 mb-3">$0</p>
                <ul className="space-y-1.5">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-400">
                      <Check size={13} className="text-slate-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-4 border-neon-green/30 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-neon-green/10 rounded-full blur-2xl" />
                <p className="text-xs uppercase tracking-wide text-neon-green mb-1">{t("proTier")}</p>
                <p className="text-2xl font-bold text-slate-100 mb-3">
                  ${price}
                  <span className="text-sm text-slate-500">{t("perMonth")}</span>
                </p>
                <ul className="space-y-1.5">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <Check size={13} className="text-neon-green mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button onClick={() => setStep("checkout")} className="btn-pro w-full py-3 text-sm">
              {t("upgradePro")} — ${price}
              {t("perMonth")}
            </button>
          </>
        )}

        {step === "checkout" && (
          <>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              {t("proTier")} · ${price}
              {t("perMonth")}
            </h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPayMethod("card")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                  payMethod === "card"
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-slate-400"
                }`}
              >
                <CreditCard size={15} />
                {t("payCard")}
              </button>
              <button
                onClick={() => setPayMethod("crypto")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-all ${
                  payMethod === "crypto"
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : "border-white/10 text-slate-400"
                }`}
              >
                <Coins size={15} />
                {t("payCrypto")}
              </button>
            </div>

            {payMethod === "card" ? (
              <div className="space-y-3 mb-5">
                <input className="input-field w-full" placeholder="Card number — 4242 4242 4242 4242" />
                <div className="flex gap-3">
                  <input className="input-field w-1/2" placeholder="MM/YY" />
                  <input className="input-field w-1/2" placeholder="CVC" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {["USDT", "SOL", "ETH"].map((c) => (
                  <button key={c} className="glass-card py-3 text-xs font-medium text-slate-300 hover:border-neon-cyan/40 transition-all">
                    {c}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={processing}
              className="btn-pro w-full py-3 text-sm flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Processing...
                </>
              ) : (
                `Confirm & Pay $${price}`
              )}
            </button>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-neon-green/10 border border-neon-green/40 flex items-center justify-center mb-4 shadow-neon-green">
              <Check size={26} className="text-neon-green" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100 mb-1">{t("checkoutSuccess")}</h2>
            <button onClick={onClose} className="btn-primary mt-5 px-6 py-2.5 text-sm">
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
