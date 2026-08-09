"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav, TabId } from "@/components/layout/BottomNav";
import { DesktopTabs } from "@/components/layout/DesktopTabs";
import { ScreenerTable } from "@/components/screener/ScreenerTable";
import { CoinDrawer } from "@/components/drawer/CoinDrawer";
import { AIMarketAssistant } from "@/components/ai/AIMarketAssistant";
import { WhaleAlertTicker } from "@/components/whale/WhaleAlertTicker";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { VIPSignals } from "@/components/pro/VIPSignals";
import { TelegramBotWidget } from "@/components/pro/TelegramBotWidget";
import { DexSwapWidget } from "@/components/pro/DexSwapWidget";
import { WatchlistView } from "@/components/watchlist/WatchlistView";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { MarketCoin, useMarkets } from "@/lib/api";

export default function HomePage() {
  const [tab, setTab] = useState<TabId>("screener");
  const [selectedCoin, setSelectedCoin] = useState<MarketCoin | null>(null);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const { coins } = useMarkets("all");

  return (
    <div className="min-h-screen pb-20 sm:pb-8">
      <Header onUpgradeClick={() => setSubscriptionOpen(true)} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        <div className="mb-4">
          <WhaleAlertTicker coins={coins} />
        </div>

        <DesktopTabs active={tab} onChange={setTab} />

        {tab === "screener" && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ScreenerTable onSelectCoin={setSelectedCoin} />
            </div>
            <div className="space-y-4">
              <AIMarketAssistant coins={coins} />
              <TelegramBotWidget onUpgrade={() => setSubscriptionOpen(true)} />
              <DexSwapWidget coins={coins} onUpgrade={() => setSubscriptionOpen(true)} />
            </div>
          </div>
        )}

        {tab === "watchlist" && <WatchlistView coins={coins} onSelectCoin={setSelectedCoin} />}

        {tab === "portfolio" && <PortfolioView coins={coins} />}

        {tab === "signals" && (
          <div className="max-w-2xl mx-auto">
            <VIPSignals coins={coins} onUpgrade={() => setSubscriptionOpen(true)} />
          </div>
        )}

        {tab === "ai" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <AIMarketAssistant coins={coins} />
            <TelegramBotWidget onUpgrade={() => setSubscriptionOpen(true)} />
            <DexSwapWidget coins={coins} onUpgrade={() => setSubscriptionOpen(true)} />
          </div>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />

      <CoinDrawer coin={selectedCoin} onClose={() => setSelectedCoin(null)} />

      {subscriptionOpen && <SubscriptionModal onClose={() => setSubscriptionOpen(false)} />}
    </div>
  );
}
