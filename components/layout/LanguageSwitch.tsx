"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/translations";

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan transition-all"
      >
        <Globe size={14} />
        <span className="font-medium">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-24 glass-panel py-1 z-40 animate-fade-in">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 transition-colors ${
                locale === l.code ? "text-neon-cyan" : "text-slate-300"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
