"use client";

import { TerminalSquare, Crown } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { LanguageSwitch } from "./LanguageSwitch";
import { useI18n } from "@/lib/i18n";
import { useProStore } from "@/lib/store";

export function Header({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const { t } = useI18n();
  const isPro = useProStore((s) => s.isPro);

  return (
    <header className="sticky top-0 z-30 glass-panel !rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-3">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shadow-neon-cyan">
            <TerminalSquare size={18} className="text-neon-cyan" />
          </div>
          <span className="font-mono font-bold tracking-widest text-sm sm:text-base text-slate-100">
            {t("appName")}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isPro ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green">
              <Crown size={13} />
              {t("proActive")}
            </span>
          ) : (
            <button
              onClick={onUpgradeClick}
              className="btn-pro hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs"
            >
              <Crown size={13} />
              {t("upgradePro")}
            </button>
          )}
          <LanguageSwitch />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
