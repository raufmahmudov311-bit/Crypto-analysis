"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletProvider = "metamask" | "phantom" | "walletconnect" | null;
export type NetworkId = "ethereum" | "solana" | "bnb";

export interface Transaction {
  id: string;
  coinId: string;
  symbol: string;
  buyPrice: number;
  quantity: number;
  date: string;
}

interface WalletState {
  connected: boolean;
  provider: WalletProvider;
  address: string | null;
  network: NetworkId;
  balanceUsd: number;
  connect: (provider: WalletProvider) => void;
  disconnect: () => void;
  setNetwork: (n: NetworkId) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      connected: false,
      provider: null,
      address: null,
      network: "ethereum",
      balanceUsd: 0,
      connect: (provider) => {
        const rand = Math.random().toString(16).slice(2, 10);
        const prefix = provider === "phantom" ? "" : "0x";
        const address = provider === "phantom"
          ? `${rand}${Math.random().toString(16).slice(2, 8)}`.slice(0, 32)
          : `${prefix}${rand}${Math.random().toString(16).slice(2, 10)}`.slice(0, 42);
        const balance = 1200 + Math.random() * 48000;
        set({
          connected: true,
          provider,
          address,
          balanceUsd: Math.round(balance * 100) / 100,
        });
      },
      disconnect: () => set({ connected: false, provider: null, address: null, balanceUsd: 0 }),
      setNetwork: (n) => set({ network: n }),
    }),
    { name: "nexus_wallet" }
  )
);

interface ProState {
  isPro: boolean;
  plan: "monthly" | "yearly" | null;
  activatePro: (plan: "monthly" | "yearly") => void;
  deactivatePro: () => void;
}

export const useProStore = create<ProState>()(
  persist(
    (set) => ({
      isPro: false,
      plan: null,
      activatePro: (plan) => set({ isPro: true, plan }),
      deactivatePro: () => set({ isPro: false, plan: null }),
    }),
    { name: "nexus_pro" }
  )
);

interface WatchlistState {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
      has: (id) => get().ids.includes(id),
    }),
    { name: "nexus_watchlist" }
  )
);

interface PortfolioState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "date">) => void;
  removeTransaction: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((s) => ({
          transactions: [
            ...s.transactions,
            { ...tx, id: crypto.randomUUID(), date: new Date().toISOString() },
          ],
        })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
    }),
    { name: "nexus_portfolio" }
  )
);

interface TelegramState {
  chatId: string | null;
  linked: boolean;
  link: (chatId: string) => void;
  unlink: () => void;
}

export const useTelegramStore = create<TelegramState>()(
  persist(
    (set) => ({
      chatId: null,
      linked: false,
      link: (chatId) => set({ chatId, linked: true }),
      unlink: () => set({ chatId: null, linked: false }),
    }),
    { name: "nexus_telegram" }
  )
);

export interface PaperTrade {
  id: string;
  coinId: string;
  symbol: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  rsiAtTrade: number;
  timestamp: string;
}

export interface PaperPosition {
  coinId: string;
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
}

interface PaperTradingState {
  started: boolean;
  startingBalance: number;
  cashBalance: number;
  positions: PaperPosition[];
  trades: PaperTrade[];
  start: (amount: number) => void;
  reset: () => void;
  recordBuy: (coinId: string, symbol: string, price: number, usdAmount: number, rsi: number) => void;
  recordSell: (coinId: string, symbol: string, price: number, rsi: number) => void;
}

export const usePaperTradingStore = create<PaperTradingState>()(
  persist(
    (set, get) => ({
      started: false,
      startingBalance: 0,
      cashBalance: 0,
      positions: [],
      trades: [],
      start: (amount) =>
        set({ started: true, startingBalance: amount, cashBalance: amount, positions: [], trades: [] }),
      reset: () => set({ started: false, startingBalance: 0, cashBalance: 0, positions: [], trades: [] }),
      recordBuy: (coinId, symbol, price, usdAmount, rsi) => {
        const state = get();
        if (usdAmount > state.cashBalance || usdAmount <= 0) return;
        const quantity = usdAmount / price;
        const existing = state.positions.find((p) => p.coinId === coinId);
        const positions = existing
          ? state.positions.map((p) =>
              p.coinId === coinId
                ? {
                    ...p,
                    quantity: p.quantity + quantity,
                    avgBuyPrice:
                      (p.avgBuyPrice * p.quantity + price * quantity) / (p.quantity + quantity),
                  }
                : p
            )
          : [...state.positions, { coinId, symbol, quantity, avgBuyPrice: price }];
        set({
          cashBalance: state.cashBalance - usdAmount,
          positions,
          trades: [
            {
              id: crypto.randomUUID(),
              coinId,
              symbol,
              type: "buy",
              price,
              quantity,
              rsiAtTrade: rsi,
              timestamp: new Date().toISOString(),
            },
            ...state.trades,
          ],
        });
      },
      recordSell: (coinId, symbol, price, rsi) => {
        const state = get();
        const position = state.positions.find((p) => p.coinId === coinId);
        if (!position || position.quantity <= 0) return;
        const proceeds = position.quantity * price;
        set({
          cashBalance: state.cashBalance + proceeds,
          positions: state.positions.filter((p) => p.coinId !== coinId),
          trades: [
            {
              id: crypto.randomUUID(),
              coinId,
              symbol,
              type: "sell",
              price,
              quantity: position.quantity,
              rsiAtTrade: rsi,
              timestamp: new Date().toISOString(),
            },
            ...state.trades,
          ],
        });
      },
    }),
    { name: "nexus_paper_trading" }
  )
);
