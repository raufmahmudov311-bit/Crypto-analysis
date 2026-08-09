export function simpleMovingAverage(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    const slice = prices.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export function exponentialMovingAverage(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  prices.forEach((price, i) => {
    if (i === 0) {
      ema.push(price);
    } else {
      ema.push(price * k + ema[i - 1] * (1 - k));
    }
  });
  return ema;
}

export function relativeStrengthIndex(prices: number[], period = 14): (number | null)[] {
  const rsi: (number | null)[] = new Array(prices.length).fill(null);
  if (prices.length <= period) return rsi;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const delta = prices[i] - prices[i - 1];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < prices.length; i++) {
    const delta = prices[i] - prices[i - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return rsi;
}

export function macd(prices: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const emaFast = exponentialMovingAverage(prices, fast);
  const emaSlow = exponentialMovingAverage(prices, slow);
  const macdLine = prices.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = exponentialMovingAverage(macdLine, signalPeriod);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

export function volumeProfileBuckets(prices: number[], volumesProxy: number[], bucketCount = 12) {
  if (prices.length === 0) return [];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const bucketSize = range / bucketCount;
  const buckets = new Array(bucketCount).fill(0);

  prices.forEach((p, i) => {
    const idx = Math.min(bucketCount - 1, Math.floor((p - min) / bucketSize));
    buckets[idx] += volumesProxy[i] ?? 1;
  });

  return buckets.map((vol, i) => ({
    priceLevel: min + bucketSize * i,
    volume: vol,
  }));
}
