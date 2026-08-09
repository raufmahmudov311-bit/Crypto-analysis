"use client";

import { useState } from "react";
import { Send, Lock, Check, Unlink } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useProStore, useTelegramStore } from "@/lib/store";

export function TelegramBotWidget({ onUpgrade }: { onUpgrade: () => void }) {
  const { t } = useI18n();
  const isPro = useProStore((s) => s.isPro);
  const { chatId, linked, link, unlink } = useTelegramStore();
  const [input, setInput] = useState("");

  if (!isPro) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={14} className="text-slate-500" />
          <h4 className="text-sm font-medium text-slate-300">{t("telegramBot")}</h4>
        </div>
        <p className="text-xs text-slate-500 mb-3">{t("telegramDesc")}</p>
        <button onClick={onUpgrade} className="text-xs btn-pro px-3 py-1.5">
          {t("upgradePro")}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Send size={14} className="text-neon-cyan" />
        <h4 className="text-sm font-medium text-slate-100">{t("telegramBot")}</h4>
      </div>
      <p className="text-xs text-slate-500 mb-3">{t("telegramDesc")}</p>

      {linked ? (
        <div className="flex items-center justify-between glass-panel px-3 py-2">
          <span className="flex items-center gap-2 text-xs text-neon-green">
            <Check size={13} />
            Chat ID {chatId}
          </span>
          <button onClick={unlink} className="text-slate-500 hover:text-neon-red transition-colors">
            <Unlink size={14} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 123456789"
            className="input-field flex-1 text-xs"
          />
          <button
            onClick={() => input.trim() && link(input.trim())}
            className="btn-primary px-3 text-xs shrink-0"
          >
            {t("linkTelegram")}
          </button>
        </div>
      )}
    </div>
  );
}
