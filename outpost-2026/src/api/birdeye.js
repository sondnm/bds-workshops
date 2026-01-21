const API_KEY_STORAGE = "birdeye_api_key";

export const BIRDEYE_BASE_URL =
  import.meta.env.VITE_BIRDEYE_BASE_URL || "https://public-api.birdeye.so";
export const BIRDEYE_CHAIN = import.meta.env.VITE_BIRDEYE_CHAIN || "solana";

export const ENDPOINTS = {
  tokenList: "/defi/v3/token/list",
  tokenOverview: "/defi/token_overview",
  ohlcv: "/defi/v3/ohlcv",
  tokenTxs: "/defi/v3/token/txs",
  walletPnlSummary: "/wallet/v2/pnl/summary",
  walletPnlDetails: "/wallet/v2/pnl/details",
  walletNetWorth: "/wallet/v2/current-net-worth",
  walletTransfers: "/wallet/v2/transfer",
  walletBalanceChange: "/wallet/v2/balance-change",
};

const TOKEN_LIST_FILTER_MAP = {
  search: "keyword",
  minVolume: "min_volume",
  minLiquidity: "min_liquidity",
  minMarketCap: "min_marketcap",
  priceMin: "min_price",
  priceMax: "max_price",
  change24hMin: "min_change_24h",
  change24hMax: "max_change_24h",
  onlyVerified: "verified",
};

const TOKEN_LIST_SORT_BY = new Set([
  "liquidity",
  "market_cap",
  "fdv",
  "recent_listing_time",
  "last_trade_unix_time",
  "holder",
  "volume_1h_usd",
  "volume_2h_usd",
  "volume_4h_usd",
  "volume_8h_usd",
  "volume_24h_usd",
  "volume_7d_usd",
  "volume_30d_usd",
  "volume_1h_change_percent",
  "volume_2h_change_percent",
  "volume_4h_change_percent",
  "volume_8h_change_percent",
  "volume_24h_change_percent",
  "volume_7d_change_percent",
  "volume_30d_change_percent",
  "price_change_1h_percent",
  "price_change_2h_percent",
  "price_change_4h_percent",
  "price_change_8h_percent",
  "price_change_24h_percent",
  "price_change_7d_percent",
  "price_change_30d_percent",
  "trade_1h_count",
  "trade_2h_count",
  "trade_4h_count",
  "trade_8h_count",
  "trade_24h_count",
  "trade_7d_count",
  "trade_30d_count",
]);

export function getApiKey() {
  if (typeof window === "undefined") return import.meta.env.VITE_BIRDEYE_API_KEY || "";
  return localStorage.getItem(API_KEY_STORAGE) || import.meta.env.VITE_BIRDEYE_API_KEY || "";
}

export function setApiKey(value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE, value);
}

export function clearApiKey() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE);
}

export function hasApiKey() {
  return Boolean(getApiKey());
}

export async function fetchBirdeye(path, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing Birdeye API key");
  const url = new URL(BIRDEYE_BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-KEY": apiKey,
      "x-chain": BIRDEYE_CHAIN,
      accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Birdeye API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchBirdeyePost(path, body = {}, params = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing Birdeye API key");
  const url = new URL(BIRDEYE_BASE_URL + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "x-chain": BIRDEYE_CHAIN,
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Birdeye API error: ${res.status}`);
  }

  return res.json();
}

function pickNumber(...values) {
  for (const value of values) {
    if (value === 0 || value) return Number(value);
  }
  return 0;
}

export function normalizeToken(raw) {
  if (!raw) return null;
  return {
    name: raw.name || raw.tokenName || raw.symbol || "Unknown",
    symbol: raw.symbol || raw.tokenSymbol || "",
    address: raw.address || raw.mintAddress || raw.tokenAddress || "",
    price: pickNumber(raw.price, raw.value, raw.priceUsd, raw.priceUSD),
    change1h: pickNumber(
      raw.change1h,
      raw.priceChange1h,
      raw.priceChange1hPercent,
      raw.price_change_1h_percent,
    ),
    change4h: pickNumber(
      raw.change4h,
      raw.priceChange4h,
      raw.priceChange4hPercent,
      raw.price_change_4h_percent,
    ),
    change24h: pickNumber(
      raw.change24h,
      raw.priceChange24h,
      raw.priceChange24hPercent,
      raw.price_change_24h_percent,
    ),
    change7d: pickNumber(
      raw.change7d,
      raw.priceChange7d,
      raw.priceChange7dPercent,
      raw.price_change_7d_percent,
    ),
    change30d: pickNumber(
      raw.change30d,
      raw.priceChange30d,
      raw.priceChange30dPercent,
      raw.price_change_30d_percent,
    ),
    volume24h: pickNumber(raw.volume24h, raw.volume24hUsd, raw.v24hUsd, raw.volume_24h_usd),
    liquidity: pickNumber(raw.liquidity, raw.liquidityUsd, raw.liquidityUSD),
    marketCap: pickNumber(raw.marketCap, raw.mc, raw.market_cap),
    decimals: raw.decimals || raw.tokenDecimals || 0,
    verified: Boolean(raw.isVerified || raw.verified),
    logo: raw.logo_uri || raw.logoURI || raw.logo || raw.icon || "",
    fdv: pickNumber(raw.fdv),
    holders: pickNumber(raw.holder),
    lastTradeUnixTime: pickNumber(raw.last_trade_unix_time),
    recentListingTime: pickNumber(raw.recent_listing_time),
  };
}

export function normalizeCandle(raw) {
  const rawTime = raw.unix_time || raw.unixTime || raw.time || raw.t || 0;
  const time = rawTime > 1e12 ? rawTime : rawTime * 1000;
  return {
    time,
    open: pickNumber(raw.open, raw.o),
    high: pickNumber(raw.high, raw.h),
    low: pickNumber(raw.low, raw.l),
    close: pickNumber(raw.close, raw.c),
    volume: pickNumber(raw.volume, raw.v),
  };
}

export function normalizeTokenTx(raw) {
  const timeValue = raw.blockUnixTime || raw.blockTime || raw.time || Date.now() / 1000;
  const amount = pickNumber(raw.amount, raw.tokenAmount, raw.from?.uiAmount, raw.to?.uiAmount);
  const value = pickNumber(raw.value, raw.usdValue, raw.volumeUSD);
  const directPrice = pickNumber(
    raw.price,
    raw.priceUsd,
    raw.priceUSD,
    raw.swapPrice,
    raw.tokenPrice,
    raw.usdPrice,
  );
  const derivedPrice = amount ? value / amount : 0;
  const fromToken =
    raw.from?.symbol ||
    raw.from?.token?.symbol ||
    raw.fromToken?.symbol ||
    raw.from_token?.symbol ||
    raw.token_from?.symbol ||
    raw.in_token?.symbol ||
    raw.token_in?.symbol ||
    raw.baseToken?.symbol ||
    raw.baseSymbol ||
    raw.from_symbol ||
    raw.inSymbol ||
    raw.symbol ||
    "UNKNOWN";
  const toToken =
    raw.to?.symbol ||
    raw.to?.token?.symbol ||
    raw.toToken?.symbol ||
    raw.to_token?.symbol ||
    raw.token_to?.symbol ||
    raw.out_token?.symbol ||
    raw.token_out?.symbol ||
    raw.quoteToken?.symbol ||
    raw.quoteSymbol ||
    raw.to_symbol ||
    raw.outSymbol ||
    raw.symbol ||
    "UNKNOWN";
  return {
    type: raw.side || raw.type || raw.swapType || "swap",
    wallet: raw.owner || raw.wallet || raw.signer || raw.from?.owner || raw.from?.address || "-",
    amount,
    value,
    price: directPrice || derivedPrice || 0,
    fromToken,
    toToken,
    time: (timeValue > 1e12 ? timeValue / 1000 : timeValue) * 1000,
  };
}

export async function getTokenList({
  limit = 20,
  offset = 0,
  sortBy = "volume_24h_usd",
  sortType = "desc",
  filters = {},
} = {}) {
  const params = {
    sort_by: TOKEN_LIST_SORT_BY.has(sortBy) ? sortBy : "volume_24h_usd",
    sort_type: sortType,
    limit,
    offset,
  };

  Object.entries(TOKEN_LIST_FILTER_MAP).forEach(([key, param]) => {
    const value = filters[key];
    if (value === undefined || value === null || value === "") return;
    params[param] = value === true ? true : value;
  });

  const data = await fetchBirdeye(ENDPOINTS.tokenList, params);
  const list = data?.data?.tokens || data?.data?.items || data?.data || [];
  const rawTotal =
    data?.data?.total ??
    data?.data?.totalCount ??
    data?.data?.count ??
    data?.data?.total_count;
  const total = Number.isFinite(Number(rawTotal)) ? Number(rawTotal) : null;
  const apiHasNext = data?.data?.hasNext;
  const hasNext =
    typeof apiHasNext === "boolean"
      ? apiHasNext
      : total !== null
        ? offset * limit + list.length < total
        : list.length === limit;
  return { tokens: list.map(normalizeToken).filter(Boolean), total, hasNext };
}

export async function getTokenOverview(address) {
  const data = await fetchBirdeye(ENDPOINTS.tokenOverview, { address });
  const raw = data?.data || data || {};
  return normalizeToken(raw);
}

export async function getOhlcv({
  address,
  interval = "1H",
  countLimit = 1000,
  timeTo = Math.floor(Date.now() / 1000),
  timeFrom,
} = {}) {
  const params = {
    address,
    type: interval,
    mode: "count",
    count_limit: countLimit,
  };

  if (timeFrom !== undefined && timeFrom !== null) {
    params.mode = "time";
    params.time_from = timeFrom;
    params.time_to = timeTo;
  } else {
    params.time_to = timeTo;
  }

  const data = await fetchBirdeye(ENDPOINTS.ohlcv, params);
  const items = data?.data?.items || data?.data || [];
  return items.map(normalizeCandle);
}

export async function getTokenTxs({ address, limit = 10 }) {
  const data = await fetchBirdeye(ENDPOINTS.tokenTxs, { address, limit });
  const items = data?.data?.items || data?.data || [];
  return items.map(normalizeTokenTx);
}

export async function getWalletPnlSummary(wallet) {
  const data = await fetchBirdeye(ENDPOINTS.walletPnlSummary, { wallet });
  return data?.data || data || {};
}

export async function getWalletPnlDetails(wallet, { limit = 20, offset = 0 } = {}) {
  const data = await fetchBirdeyePost(ENDPOINTS.walletPnlDetails, {
    wallet,
    limit,
    offset,
  });
  return data?.data || data || {};
}

export async function getWalletNetWorth(wallet) {
  const data = await fetchBirdeye(ENDPOINTS.walletNetWorth, { wallet });
  return data?.data || data || {};
}

export async function getWalletTransfers(wallet, limit = 8) {
  const data = await fetchBirdeyePost(ENDPOINTS.walletTransfers, {
    wallet,
    limit,
    offset: 0,
  });
  return data?.data || data || {};
}

export async function getWalletBalanceChange(wallet) {
  const data = await fetchBirdeye(ENDPOINTS.walletBalanceChange, { address: wallet });
  return data?.data || data || {};
}
