"use client";

import { useState } from "react";
import { Wallet, ChevronDown, LogOut, Check } from "lucide-react";
import { useWalletStore, WalletProvider, NetworkId } from "@/lib/store";
import { formatCompact, truncateAddress } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

const PROVIDERS: { id: WalletProvider; label: string; color: string }[] = [
  { id: "metamask", label: "MetaMask", color: "#F6851B" },
  { id: "phantom", label: "Phantom", color: "#AB9FF2" },
  { id: "walletconnect", label: "WalletConnect", color: "#3B99FC" },
];

const NETWORKS: { id: NetworkId; label: string }[] = [
  { id: "ethereum", label: "Ethereum" },
  { id: "solana", label: "Solana" },
  { id: "bnb", label: "BNB Chain" },
];

export function WalletConnect() {
  const { t } = useI18n();
  const { connected, provider, address, network, balanceUsd, connect, disconnect, setNetwork } =
    useWalletStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState<WalletProvider>(null);

  function handleSelect(p: WalletProvider) {
    setConnecting(p);
    setTimeout(() => {
      connect(p);
      setConnecting(null);
      setPickerOpen(false);
    }, 900);
  }

  if (!connected) {
    return (
      <>
        <button
          onClick={() => setPickerOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Wallet size={16} />
          <span className="hidden sm:inline">{t("connectWallet")}</span>
        </button>

        {pickerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4"
            onClick={() => !connecting && setPickerOpen(false)}
          >
            <div
              className="glass-panel w-full max-w-sm p-6 shadow-glass"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-4">{t("selectWallet")}</h3>
              <div className="space-y-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    disabled={!!connecting}
                    className="w-full flex items-center justify-between glass-card px-4 py-3 hover:border-neon-cyan/40 transition-all disabled:opacity-60"
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${p.color}22`, color: p.color }}
                      >
                        {p.label[0]}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{p.label}</span>
                    </span>
                    {connecting === p.id && (
                      <span className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="btn-pro flex items-center gap-2 px-3 py-2 text-sm"
      >
        <span className="w-2 h-2 rounded-full bg-neon-green shadow-neon-green" />
        <span className="font-mono">{truncateAddress(address)}</span>
        <ChevronDown size={14} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel p-4 z-40 animate-fade-in shadow-glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {t("walletConnected")}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30 capitalize">
              {provider}
            </span>
          </div>
          <div className="glass-card p-3 mb-3">
            <p className="text-[11px] text-slate-500 mb-1">{t("portfolioBalance")}</p>
            <p className="text-xl font-bold text-slate-100 font-mono">
              ${formatCompact(balanceUsd)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{t("network")}</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                onClick={() => setNetwork(n.id)}
                className={`text-xs py-1.5 rounded-lg border transition-all flex items-center justify-center gap-1 ${
                  network === n.id
                    ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10"
                    : "border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                {network === n.id && <Check size={11} />}
                {n.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              disconnect();
              setMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg border border-neon-red/30 text-neon-red hover:bg-neon-red/10 transition-all"
          >
            <LogOut size={13} />
            {t("disconnect")}
          </button>
        </div>
      )}
    </div>
  );
}
