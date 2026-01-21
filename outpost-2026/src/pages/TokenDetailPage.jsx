import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getOhlcv,
  getTokenOverview,
  getTokenTxs,
  normalizeTokenTx,
} from "../api/birdeye";
import CandleChart from "../components/charts/CandleChart";
import TransactionTable from "../components/TransactionTable";
import { generateCandles, generateTransactions, seedTokens } from "../data/mock";
import { useApiKey } from "../hooks/useApiKey";
import { useRealtimeToken } from "../hooks/useRealtimeToken";
import { formatMoney, formatPct } from "../utils/format";

const INTERVALS = [
  { label: "1H", key: "change1h", volumeFactor: 0.02 },
  { label: "4H", key: "change4h", volumeFactor: 0.08 },
  { label: "24H", key: "change24h", volumeFactor: 1 },
];

const CHART_INTERVALS = ["1m", "15m", "30m", "1H", "4H", "1D"];
const MAX_CANDLES = 200;
const INTERVAL_SECONDS = {
  "1m": 60,
  "15m": 900,
  "30m": 1800,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};

export default function TokenDetailPage() {
  const [candleInterval, setCandleInterval] = useState("1H");
  const { address } = useParams();
  const { apiKey } = useApiKey();
  const fallbackToken = useMemo(() => {
    return seedTokens.find((token) => token.address === address) || seedTokens[0];
  }, [address]);
  const activeAddress = address || fallbackToken.address;

  const [token, setToken] = useState(fallbackToken);
  const [candles, setCandles] = useState(generateCandles(36, fallbackToken.price));
  const [txs, setTxs] = useState(generateTransactions());
  const [status, setStatus] = useState("mock");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!apiKey || !activeAddress) {
        setToken(fallbackToken);
        setCandles(generateCandles(36, fallbackToken.price));
        setTxs(generateTransactions());
        setStatus("mock");
        return;
      }

      try {
        const [tokenData, candleData, txData] = await Promise.all([
          getTokenOverview(activeAddress),
          getOhlcv({
            address: activeAddress,
            interval: candleInterval,
            countLimit: MAX_CANDLES,
          }),
          getTokenTxs({ address: activeAddress, limit: 12 }),
        ]);
        if (!active) return;
        setToken({ ...fallbackToken, ...(tokenData || {}) });
        const trimmedCandles = candleData.length ? candleData.slice(-MAX_CANDLES) : [];
        setCandles(trimmedCandles.length ? trimmedCandles : generateCandles(36, tokenData?.price || 120));
        setTxs(txData.length ? txData : generateTransactions());
        setStatus("live");
      } catch (err) {
        if (!active) return;
        setToken(fallbackToken);
        setCandles(generateCandles(36, fallbackToken.price));
        setTxs(generateTransactions());
        setStatus("mock");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [activeAddress, apiKey, fallbackToken, candleInterval]);

  const mockStream = useCallback(() => {
    const interval = setInterval(() => {
      setToken((prev) => {
        const drift = (Math.random() - 0.5) * 0.4;
        const change = prev.change24h + drift * 0.4;
        return {
          ...prev,
          price: Math.max(0, prev.price + drift),
          change24h: change,
        };
      });
      setTxs((prev) => {
        const next = [
          {
            type: Math.random() > 0.5 ? "swap" : "transfer",
            wallet: "7m9K...Q12z",
            amount: Math.random() * 800,
            value: Math.random() * 18000,
            time: Date.now(),
          },
          ...prev,
        ];
        return next.slice(0, 20);
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleCandle = useCallback((data) => {
    const unixTime = data.unixTime || data.unix_time || data.time;
    if (!unixTime) return;
    const time = unixTime > 1e12 ? unixTime : unixTime * 1000;
    const candle = {
      time,
      open: Number(data.o || data.open || data.price || 0),
      high: Number(data.h || data.high || data.price || 0),
      low: Number(data.l || data.low || data.price || 0),
      close: Number(data.c || data.close || data.price || 0),
      volume: Number(data.v || data.volume || 0),
    };
    setCandles((prev) => {
      if (!prev.length) return [candle];
      const next = [...prev];
      const last = next[next.length - 1];
      if (last.time === candle.time) {
        next[next.length - 1] = candle;
      } else if (last.time < candle.time) {
        next.push(candle);
        if (next.length > MAX_CANDLES) next.shift();
      }
      return next;
    });
    setToken((prev) => ({ ...prev, price: candle.close }));
    setStatus("live");
  }, []);

  const handleStats = useCallback((stats) => {
    const tradeStats = stats.trade_data || {};
    const priceChange = tradeStats.price_change || {};
    const volumeStats = tradeStats.volume || {};
    const pickStat = (...values) => {
      for (const value of values) {
        if (value === 0 || value) return Number(value);
      }
      return null;
    };
    setToken((prev) => ({
      ...prev,
      price: stats.price ?? prev.price,
      change1h:
        pickStat(
          stats.price_change_1h_percent,
          priceChange["1h"],
          priceChange["1H"],
          priceChange["60m"],
        ) ?? prev.change1h,
      change4h:
        pickStat(
          stats.price_change_4h_percent,
          priceChange["4h"],
          priceChange["4H"],
        ) ?? prev.change4h,
      change24h:
        pickStat(
          stats.price_change_24h_percent,
          priceChange["24h"],
          priceChange["24H"],
        ) ?? prev.change24h,
      marketCap: stats.marketcap ?? prev.marketCap,
      liquidity: stats.liquidity ?? prev.liquidity,
      volume24h:
        pickStat(stats.volume_24h_usd, volumeStats["24h"], volumeStats["24H"]) ??
        prev.volume24h,
    }));
    setStatus("live");
  }, []);

  const handleTx = useCallback((data) => {
    setTxs((prev) => [normalizeTokenTx(data), ...prev].slice(0, 20));
    setStatus("live");
  }, []);

  const handleStatus = useCallback((nextStatus) => {
    if (nextStatus === "error" || nextStatus === "close") {
      setStatus("mock");
    }
  }, []);

  useRealtimeToken({
    address: activeAddress,
    chartType: candleInterval,
    currency: "usd",
    onCandle: handleCandle,
    onStats: handleStats,
    onTx: handleTx,
    onStatus: handleStatus,
    fallback: mockStream,
  });

  const loadHistory = useCallback(async ({ direction, timeFrom, timeTo } = {}) => {
    if (isHistoryLoading) return;
    const oldest = candles[0]?.time;
    const latest = candles[candles.length - 1]?.time;
    if (!apiKey) return;
    setIsHistoryLoading(true);
    try {
      const step = INTERVAL_SECONDS[candleInterval] || 3600;
      const now = Math.floor(Date.now() / 1000);
      let resolvedFrom = Number.isFinite(timeFrom) ? timeFrom : null;
      let resolvedTo = Number.isFinite(timeTo) ? timeTo : null;

      if (resolvedFrom === null || resolvedTo === null) {
        if (!oldest) return;
        if (direction === "right" && latest) {
          resolvedFrom = Math.floor(latest / 1000) + 1;
          resolvedTo = Math.min(resolvedFrom + step * MAX_CANDLES, now);
        } else {
          resolvedTo = Math.floor(oldest / 1000) - 1;
          resolvedFrom = Math.max(0, resolvedTo - step * MAX_CANDLES);
        }
      }

      if (resolvedFrom === null || resolvedTo === null || resolvedFrom >= resolvedTo) return;

      const boundedFrom = Math.max(0, Math.floor(resolvedFrom));
      const boundedTo = Math.min(Math.floor(resolvedTo), now);
      if (boundedFrom >= boundedTo) return;

      const history = await getOhlcv({
        address: activeAddress,
        interval: candleInterval,
        countLimit: MAX_CANDLES,
        timeFrom: boundedFrom,
        timeTo: boundedTo,
      });
      if (!history.length) return;
      const trimmed =
        history.length > MAX_CANDLES
          ? direction === "left"
            ? history.slice(0, MAX_CANDLES)
            : history.slice(-MAX_CANDLES)
          : history;
      setCandles(trimmed);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [activeAddress, apiKey, candleInterval, candles, isHistoryLoading]);

  return (
    <section className="section">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Token metadata</div>
            <div className="muted">Address, network, and live price</div>
          </div>
        </div>
        <div className="token-hero">
          <div className="token-heading">
            {token.logo ? (
              <img className="token-logo-lg" src={token.logo} alt={`${token.symbol} logo`} />
            ) : (
              <div className="token-logo-lg placeholder">{token.symbol?.slice(0, 1) || "?"}</div>
            )}
            <div>
              <h2>
                {token.name} ({token.symbol})
              </h2>
              <div className="muted mono">{token.address} · Decimals {token.decimals}</div>
            </div>
          </div>
          <div className="price-display" aria-live="polite">
            <div className="price mono">{formatMoney(token.price)}</div>
            <div className={`badge ${token.change24h >= 0 ? "success" : "danger"}`}>
              {formatPct(token.change24h)}
            </div>
            <span className="live-label">
              <span className="pulse"></span>
              {status === "live" ? "Streaming trades" : "Mock stream"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Interval momentum</div>
              <div className="muted">Price and volume deltas</div>
            </div>
          </div>
          <div className="metric-grid">
            {INTERVALS.map((interval) => (
              <div className="metric-card" key={interval.label}>
                <h4>{interval.label} change</h4>
                <strong className="mono">{formatPct(token[interval.key])}</strong>
                <div className="muted">Volume {formatMoney(token.volume24h * interval.volumeFactor)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Token fundamentals</div>
              <div className="muted">Supply, liquidity, and metadata</div>
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <h4>Liquidity</h4>
              <strong>{formatMoney(token.liquidity)}</strong>
            </div>
            <div className="metric-card">
              <h4>Market Cap</h4>
              <strong>{formatMoney(token.marketCap)}</strong>
            </div>
            <div className="metric-card">
              <h4>24H Volume</h4>
              <strong>{formatMoney(token.volume24h)}</strong>
            </div>
            <div className="metric-card">
              <h4>Decimals</h4>
              <strong>{token.decimals}</strong>
            </div>
            <div className="metric-card">
              <h4>Symbol</h4>
              <strong>{token.symbol}</strong>
            </div>
            <div className="metric-card">
              <h4>Network</h4>
              <strong>Solana</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">OHLCV candlestick</div>
              <div className="muted">Realtime candles · {candleInterval}</div>
            </div>
            <div className="toolbar">
              <span className="pill">Solana</span>
              <select
                value={candleInterval}
                onChange={(event) => setCandleInterval(event.target.value)}
                aria-label="Select chart interval"
              >
                {CHART_INTERVALS.map((interval) => (
                  <option key={interval} value={interval}>
                    {interval}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="chart-wrapper chart-tall">
            <CandleChart
              candles={candles}
              decimals={token.decimals}
              onRequestHistory={loadHistory}
              isHistoryLoading={isHistoryLoading}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Latest transactions</div>
              <div className="muted">Streaming swaps and transfers</div>
            </div>
            <span className="pill">{txs.length} updates</span>
          </div>
          <TransactionTable txs={txs} />
        </div>
      </div>
    </section>
  );
}
