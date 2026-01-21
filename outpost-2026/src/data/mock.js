export const seedTokens = [
  {
    name: "Solana",
    symbol: "SOL",
    address: "So11111111111111111111111111111111111111112",
    price: 142.21,
    change1h: 0.7,
    change24h: -1.4,
    change7d: 9.2,
    change30d: 21.4,
    volume24h: 1240000000,
    liquidity: 118000000,
    marketCap: 61200000000,
    decimals: 9,
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    price: 1.0,
    change1h: 0.0,
    change24h: 0.0,
    change7d: 0.01,
    change30d: -0.02,
    volume24h: 980000000,
    liquidity: 340000000,
    marketCap: 3520000000,
    decimals: 6,
  },
  {
    name: "Jupiter",
    symbol: "JUP",
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    price: 0.96,
    change1h: 1.9,
    change24h: 4.3,
    change7d: 18.7,
    change30d: 32.1,
    volume24h: 174000000,
    liquidity: 56000000,
    marketCap: 1100000000,
    decimals: 6,
  },
  {
    name: "Bonk",
    symbol: "BONK",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    price: 0.0000182,
    change1h: -2.1,
    change24h: 7.6,
    change7d: 41.9,
    change30d: 95.4,
    volume24h: 92000000,
    liquidity: 22000000,
    marketCap: 1090000000,
    decimals: 5,
  },
  {
    name: "Raydium",
    symbol: "RAY",
    address: "4k3Dyjzvzp8eMZWwNBnX4Da6oV4qT72B6oVqW4ciU1nG",
    price: 2.38,
    change1h: 0.8,
    change24h: 2.9,
    change7d: 12.4,
    change30d: 28.3,
    volume24h: 84000000,
    liquidity: 31200000,
    marketCap: 640000000,
    decimals: 6,
  },
];

export function generateCandles(count, basePrice = 120) {
  const candles = [];
  let price = basePrice;
  for (let i = 0; i < count; i += 1) {
    const open = price + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    price = close;
    candles.push({
      time: Date.now() - (count - i) * 3600 * 1000,
      open,
      high,
      low,
      close,
      volume: Math.random() * 1200000,
    });
  }
  return candles;
}

export function generateTransactions() {
  const now = Date.now();
  return Array.from({ length: 8 }).map((_, idx) => ({
    type: idx % 2 === 0 ? "swap" : "transfer",
    wallet: `9x7k...${idx}a2sZ`,
    amount: Math.random() * 1200,
    value: Math.random() * 45000,
    time: now - idx * 280000,
  }));
}

export function generateBalanceHistory() {
  const points = [];
  let value = 82000;
  for (let i = 0; i < 20; i += 1) {
    value += (Math.random() - 0.5) * 5000;
    points.push({ value, time: Date.now() - (20 - i) * 3600 * 1000 });
  }
  return points;
}

export function mockWallet() {
  return {
    totalPnl: 18540,
    realizedPnl: 6200,
    unrealizedPnl: 12340,
    winRate: 62,
    holdings: [
      { name: "Solana", symbol: "SOL", amount: 342.5, value: 48650 },
      { name: "Jupiter", symbol: "JUP", amount: 2100, value: 2050 },
      { name: "USD Coin", symbol: "USDC", amount: 8200, value: 8200 },
      { name: "Bonk", symbol: "BONK", amount: 3600000, value: 680 },
    ],
    transfers: [
      { direction: "incoming", symbol: "SOL", amount: 18, value: 2550, time: Date.now() - 180000 },
      { direction: "outgoing", symbol: "JUP", amount: 420, value: 360, time: Date.now() - 540000 },
      { direction: "incoming", symbol: "USDC", amount: 1200, value: 1200, time: Date.now() - 860000 },
    ],
    balanceChanges: [
      { label: "Last 1H", delta: 820 },
      { label: "Last 24H", delta: -1240 },
      { label: "Last 7D", delta: 5420 },
      { label: "Last 30D", delta: 13820 },
    ],
    balanceHistory: generateBalanceHistory(),
  };
}
