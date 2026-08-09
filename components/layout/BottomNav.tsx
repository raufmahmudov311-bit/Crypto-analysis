"use client";

import { LineChart, Star, Briefcase, Radio, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type TabId = "screener" | "watchlist" | "portfolio" | "signals" | "ai";

const TABS: { id: TabId; icon: any; labelKey: string }[] = [
  { id: "screener", icon: LineChart, labelKey: "screener" },
  { id: "watchlist", icon: Star, labelKey: "watchlist" },
  { id: "portfolio", icon: Briefcase, labelKey: "portfolio" },
  { id: "signals", icon: Radio, labelKey: "signals" },
  { id: "ai", icon: Sparkles, labelKey: "aiAssistant" },
];

export function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 sm:hidden glass-panel !rounded-none border-x-0 border-b-0 px-2 py-1.5">
      <div className="flex items-center justify-between">
        {TABS.map(({ id, icon: Icon, labelKey }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all"
            >
              <Icon
                size={19}
                className={isActive ? "text-neon-cyan" : "text-slate-500"}
                style={isActive ? { filter: "drop-shadow(0 0 6px rgba(0,229,255,0.6))" } : undefined}
              />
              <span
                className={`text-[9.5px] font-medium truncate max-w-[56px] ${
                  isActive ? "text-neon-cyan" : "text-slate-500"
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
