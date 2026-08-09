"use client";

import { useI18n } from "@/lib/i18n";
import { CategoryFilter } from "@/lib/api";

const CATEGORIES: { id: CategoryFilter; labelKey: string }[] = [
  { id: "all", labelKey: "all" },
  { id: "memes", labelKey: "memes" },
  { id: "ai-big-data", labelKey: "aiBigData" },
  { id: "layer-1-2", labelKey: "layer12" },
  { id: "rwa", labelKey: "rwa" },
  { id: "defi", labelKey: "defi" },
];

export function CategoryFilters({
  active,
  onChange,
}: {
  active: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {CATEGORIES.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`whitespace-nowrap text-xs px-3.5 py-1.5 rounded-full border transition-all ${
              isActive
                ? "bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan"
                : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
            }`}
          >
            {t(c.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
