import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getWalletBalanceChange,
  getWalletNetWorth,
  getWalletNetWorthChart,
  getWalletPnlDetails,
  getWalletPnlSummary,
  getWalletTransfers,
} from "../api/birdeye";
import BalanceChangeTable from "../components/BalanceChangeTable";
import LineChart from "../components/charts/LineChart";
import TransferTable from "../components/TransferTable";
import { useApiKey } from "../hooks/useApiKey";
import { formatMoney } from "../utils/format";

function pickFirstNumber(...values) {
  for (const value of values) {
    if (value === 0 || value) return Number(value);
  }
  return null;
}

function normalizeTimestamp(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "number") return value > 1e12 ? value : value * 1000;
    if (typeof value === "string") {
      const asNumber = Number(value);
      if (Number.isFinite(asNumber)) return asNumber > 1e12 ? asNumber : asNumber * 1000;
      const parsed = Date.parse(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

const EMPTY_WALLET = {
  totalPnl: 0,
  realizedPnl: 0,
  unrealizedPnl: 0,
  winRate: 0,
  holdings: [],
  transfers: [],
  balanceChanges: [],
  netWorthHistory: [],
  pnlDetails: {},
};

function normalizeWallet(summary, details, netWorth, netWorthChart, transfers, balanceChange) {
  const summaryData = summary?.summary || summary?.data?.summary || summary?.data || summary || {};
  const detailSummary = details?.summary || details?.data?.summary || {};
  const netWorthData = netWorth?.data || netWorth || {};
  const holdingsSource = netWorthData.items || netWorthData.tokens || netWorthData.assets || [];
  const holdings = holdingsSource.slice(0, 5).map((item) => ({
    name: item.name || item.symbol || "Token",
    symbol: item.symbol || item.tokenSymbol || "UNK",
    amount: Number(item.amount || item.quantity || item.uiAmount || 0),
    value: Number(item.value || item.valueUsd || item.usdValue || 0),
  }));

  const transferItems = (transfers.items || transfers.data?.items || transfers.data || transfers || []).map(
    (item) => {
      const time =
        normalizeTimestamp(
          item.time,
          item.blockTime,
          item.block_time,
          item.blockTimeUnix,
          item.blockUnixTime,
          item.block_time_unix,
          item.block_unix_time,
          item.timestamp,
          item.ts,
          item.tx_time,
          item.created_at,
        ) ?? Date.now();
      return {
        direction: item.direction || item.side || "transfer",
        symbol: item.token_info?.symbol || item.symbol || item.tokenSymbol || "UNKNOWN",
        amount: pickFirstNumber(
          item.ui_amount,
          item.uiAmount,
          item.uiAmountString,
          item.amount,
          item.rawAmount,
        ),
        value: Number(item.value || item.valueUsd || item.usdValue || 0),
        time,
      };
    },
  );

  const balanceChangeSource =
    balanceChange.items ||
    balanceChange.changes ||
    balanceChange.data?.items ||
    balanceChange.data?.changes ||
    balanceChange.data ||
    [];
  const balanceChangeItems = Array.isArray(balanceChangeSource) ? balanceChangeSource : [];
  const balanceChanges = balanceChangeItems.map((item) => {
    const decimals = pickFirstNumber(
      item.token_info?.decimals,
      item.decimals,
      item.token_decimals,
      item.tokenDecimals,
    );
    const uiAmount = pickFirstNumber(item.ui_amount, item.uiAmount, item.uiAmountString);
    const rawAmount = pickFirstNumber(
      item.change,
      item.delta,
      item.amount,
      item.balance_change,
      item.balanceChange,
      item.net_change,
      item.diff,
    );
    const amount =
      uiAmount ?? (Number.isFinite(decimals) && rawAmount !== null ? rawAmount / 10 ** decimals : rawAmount);
    const preBalanceRaw = pickFirstNumber(
      item.pre_balance,
      item.preBalance,
      item.balance_before,
      item.balanceBefore,
      item.previous_balance,
      item.prev_balance,
      item.balance_prior,
    );
    const postBalanceRaw = pickFirstNumber(
      item.post_balance,
      item.postBalance,
      item.balance_after,
      item.balanceAfter,
      item.current_balance,
      item.balance,
      item.balance_after_change,
    );
    const preBalance =
      Number.isFinite(decimals) && preBalanceRaw !== null ? preBalanceRaw / 10 ** decimals : preBalanceRaw;
    const postBalance =
      Number.isFinite(decimals) && postBalanceRaw !== null ? postBalanceRaw / 10 ** decimals : postBalanceRaw;
    const time = normalizeTimestamp(
      item.time,
      item.timestamp,
      item.unixTime,
      item.unix_time,
      item.block_time,
      item.blockTime,
      item.created_at,
      item.createdAt,
      item.date,
      item.timepoint,
      item.start_time,
      item.end_time,
    );
    const direction =
      item.direction ||
      item.side ||
      item.change_type ||
      (Number.isFinite(amount) ? (amount >= 0 ? "in" : "out") : "change");
    const symbol =
      item.token_info?.symbol ||
      item.symbol ||
      item.token_symbol ||
      item.tokenSymbol ||
      item.token?.symbol ||
      "UNKNOWN";
    return {
      direction,
      symbol,
      amount,
      preBalance,
      postBalance,
      time,
    };
  });

  const netWorthSource = netWorthChart?.history || netWorthChart?.data?.history || [];
  const netWorthCandidates = Array.isArray(netWorthSource) ? netWorthSource : [];
  const netWorthHistory = netWorthCandidates
    .map((item) => {
      const time = normalizeTimestamp(
        item.timestamp,
        item.time,
        item.unixTime,
        item.unix_time,
        item.date,
        item.timepoint,
      );
      const value = pickFirstNumber(item.net_worth, item.netWorth, item.value, item.balance);
      if (!time || value === null || value === undefined) return null;
      return { time, value: Number(value) };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  const pnlStats = summaryData.pnl || {};
  const countStats = summaryData.counts || {};
  const totalPnl = pickFirstNumber(
    pnlStats.total_usd,
    summaryData.totalPnl,
    summaryData.total_pnl,
    summaryData.total,
    summaryData.pnl_total,
    detailSummary.total_pnl,
    detailSummary.total,
  );
  const realizedPnl = pickFirstNumber(
    pnlStats.realized_profit_usd,
    summaryData.realizedPnl,
    summaryData.realized_pnl,
    summaryData.realized,
    detailSummary.realized_pnl,
    detailSummary.realized,
  );
  const unrealizedPnl = pickFirstNumber(
    pnlStats.unrealized_usd,
    summaryData.unrealizedPnl,
    summaryData.unrealized_pnl,
    summaryData.unrealized,
    detailSummary.unrealized_pnl,
    detailSummary.unrealized,
  );
  const rawWinRate = pickFirstNumber(
    countStats.win_rate,
    summaryData.winRate,
    summaryData.win_rate,
    summaryData.win_rate_percent,
    detailSummary.win_rate,
  );
  const winRateValue =
    rawWinRate === null || rawWinRate === undefined
      ? null
      : rawWinRate > 1
        ? rawWinRate
        : rawWinRate * 100;
  const winRate = winRateValue === null ? 0 : Number(winRateValue.toFixed(2));

  return {
    totalPnl: totalPnl ?? 0,
    realizedPnl: realizedPnl ?? 0,
    unrealizedPnl: unrealizedPnl ?? 0,
    winRate: Number.isFinite(winRate) ? winRate : 0,
    holdings,
    transfers: transferItems,
    balanceChanges,
    netWorthHistory,
    pnlDetails: details?.data || details || {},
  };
}

export default function WalletPage() {
  const { apiKey } = useApiKey();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryWallet = searchParams.get("wallet");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletData, setWalletData] = useState(EMPTY_WALLET);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const loadWallet = useCallback(async (address) => {
    const trimmed = address?.trim();
    if (!trimmed) {
      setWalletData(EMPTY_WALLET);
      setStatus("idle");
      return;
    }
    if (!apiKey) {
      setWalletData(EMPTY_WALLET);
      setStatus("idle");
      return;
    }

    setLoading(true);
    try {
      const [summary, details, netWorth, netWorthChart, transfers, balanceChange] = await Promise.all([
        getWalletPnlSummary(trimmed),
        getWalletPnlDetails(trimmed, { limit: 25 }),
        getWalletNetWorth(trimmed),
        getWalletNetWorthChart(trimmed, { count: 30, type: "1d", direction: "back", sortType: "asc" }),
        getWalletTransfers(trimmed, 8),
        getWalletBalanceChange(trimmed),
      ]);
      setWalletData(normalizeWallet(summary, details, netWorth, netWorthChart, transfers, balanceChange));
      setStatus("live");
    } catch (err) {
      setWalletData(EMPTY_WALLET);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    if (queryWallet) {
      setWalletAddress(queryWallet);
      loadWallet(queryWallet);
    }
  }, [queryWallet, loadWallet]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = walletAddress.trim();
    if (trimmed) {
      if (trimmed !== queryWallet) {
        setSearchParams({ wallet: trimmed });
      } else {
        loadWallet(trimmed);
      }
      return;
    }
    setSearchParams({});
    loadWallet("");
  };

  const handleReset = () => {
    setWalletAddress("");
    setSearchParams({});
    setWalletData(EMPTY_WALLET);
    setStatus("idle");
  };

  return (
    <section className="section">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Wallet intelligence</div>
            <div className="muted">PnL, transfers, and balance shifts</div>
          </div>
          <div className="toolbar">
            <span className="pill">
              {loading
                ? "Loading..."
                : status === "live"
                  ? "Live wallet"
                  : status === "error"
                    ? "Failed to load"
                    : apiKey
                      ? "Awaiting wallet"
                      : "API key required"}
            </span>
          </div>
        </div>
        <form className="wallet-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder="Enter wallet address"
            aria-label="Wallet address"
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Fetch wallet"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleReset}>
            Reset
          </button>
        </form>
      </div>

      <div className="grid grid-3 section">
        <div className="card">
          <div className="card-header">
            <div className="card-title">PnL summary</div>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <h4>Total PnL</h4>
              <strong className="mono">{formatMoney(walletData.totalPnl)}</strong>
            </div>
            <div className="metric-card">
              <h4>Realized PnL</h4>
              <strong className="mono">{formatMoney(walletData.realizedPnl)}</strong>
            </div>
            <div className="metric-card">
              <h4>Unrealized PnL</h4>
              <strong className="mono">{formatMoney(walletData.unrealizedPnl)}</strong>
            </div>
            <div className="metric-card">
              <h4>Win Rate</h4>
              <strong>{walletData.winRate}%</strong>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Net worth chart</div>
          </div>
          <div className="chart-wrapper">
            <LineChart points={walletData.netWorthHistory} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top holdings</div>
          </div>
          <div className="list">
            {walletData.holdings.map((holding) => (
              <div className="list-item" key={holding.symbol}>
                <div>
                  <div className="mono">{holding.symbol}</div>
                  <span>{holding.name}</span>
                </div>
                <div className="right">
                  <div className="mono">{formatMoney(holding.value)}</div>
                  <span>{holding.amount.toFixed(4)} tokens</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2 section">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Transfer activity</div>
              <div className="muted">Incoming and outgoing flows</div>
            </div>
          </div>
          <TransferTable transfers={walletData.transfers} />
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Balance change activity</div>
              <div className="muted">All balance change events</div>
            </div>
          </div>
          <BalanceChangeTable changes={walletData.balanceChanges} />
        </div>
      </div>
    </section>
  );
}
