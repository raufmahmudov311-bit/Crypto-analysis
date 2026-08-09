"use client";

import { LineChart, Star, Briefcase, Radio, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TabId } from "./BottomNav";

const TABS: { id: TabId; icon: any; labelKey: string }[] = [
  { id: "screener", icon: LineChart, labelKey: "screener" },
  { id: "watchlist", icon: Star, labelKey: "watchlist" },
  { id: "portfolio", icon: Briefcase, labelKey: "portfolio" },
  { id: "signals", icon: Radio, labelKey: "signals" },
  { id: "ai", icon: Sparkles, labelKey: "aiAssistant" },
];

export function DesktopTabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const { t } = useI18n();

  return (
    <div className="hidden sm:flex items-center gap-1 glass-panel p-1.5 mb-5 w-fit">
      {TABS.map(({ id, icon: Icon, labelKey }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Icon size={16} />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
