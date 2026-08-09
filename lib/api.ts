"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

const BASE_URL = "https://api.coingecko.com/api/v3";

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  sparkline_in_7d: { price: number[] };
}

export type CategoryFilter = "all" | "memes" | "ai-big-data" | "layer-1-2" | "rwa" | "defi";

const CATEGORY_MAP: Record<CategoryFilter, string | null> = {
  all: null,
  memes: "meme-token",
  "ai-big-data": "artificial-intelligence",
  "layer-1-2": "layer-1",
  rwa: "real-world-assets-rwa",
  defi: "decentralized-finance-defi",
};

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

export function useMarkets(category: CategoryFilter, page = 1, perPage = 100) {
  const categoryParam = CATEGORY_MAP[category];
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  });
  if (categoryParam) params.set("category", categoryParam);

  const { data, error, isLoading, mutate } = useSWR<MarketCoin[]>(
    `${BASE_URL}/coins/markets?${params.toString()}`,
    fetcher,
    {
      dedupingInterval: 60_000,
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryInterval: 15_000,
    }
  );

  return { coins: data ?? [], isLoading, isRateLimited: error?.message === "RATE_LIMIT", error, mutate };
}

export interface OhlcPoint {
  time: number;
  price: number;
}

const TIMEFRAME_DAYS: Record<string, string> = {
  "1D": "1",
  "1W": "7",
  "1M": "30",
  "1Y": "365",
};

export function useCoinChart(coinId: string | null, timeframe: string) {
  const days = TIMEFRAME_DAYS[timeframe] ?? "7";
  const { data, error, isLoading } = useSWR<{ prices: [number, number][] }>(
    coinId ? `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}` : null,
    fetcher,
    { dedupingInterval: 60_000, revalidateOnFocus: false }
  );

  const points: OhlcPoint[] = (data?.prices ?? []).map(([time, price]) => ({ time, price }));
  return { points, isLoading, isRateLimited: error?.message === "RATE_LIMIT" };
}

export function useCoinDetail(coinId: string | null) {
  const { data, error, isLoading } = useSWR(
    coinId
      ? `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
      : null,
    fetcher,
    { dedupingInterval: 60_000, revalidateOnFocus: false }
  );
  return { detail: data, isLoading, isRateLimited: error?.message === "RATE_LIMIT" };
}
