import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, timeAgo, shortAddress } from "../utils/format";

export default function TransactionTable({ txs }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceTick((value) => value + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!txs.length) {
    return <div className="empty-state">No transactions yet.</div>;
  }

  return (
    <table className="tx-table stable">
      <thead>
        <tr>
          <th className="col-type">Type</th>
          <th className="col-wallet">Wallet</th>
          <th className="col-from">From</th>
          <th className="col-to">To</th>
          <th className="col-amount">Amount</th>
          <th className="col-price">Price</th>
          <th className="col-value">Value</th>
          <th className="col-time">Time</th>
        </tr>
      </thead>
      <tbody>
        {txs.map((tx, idx) => (
          <tr key={`${tx.wallet}-${idx}`}>
            <td className="col-type">
              {String(tx.type || "").toLowerCase().includes("sell") ? (
                <span className="badge danger">SELL</span>
              ) : (
                <span className="badge success">BUY</span>
              )}
            </td>
            <td className="mono col-wallet">
              {tx.wallet && tx.wallet !== "-" ? (
                <Link to={`/wallet?wallet=${encodeURIComponent(tx.wallet)}`}>
                  {shortAddress(tx.wallet)}
                </Link>
              ) : (
                "-"
              )}
            </td>
            <td className="mono col-from">{tx.fromToken}</td>
            <td className="mono col-to">{tx.toToken}</td>
            <td className="mono col-amount">{tx.amount.toFixed(2)}</td>
            <td className="mono col-price">{formatMoney(tx.price)}</td>
            <td className="mono col-value">{formatMoney(tx.value)}</td>
            <td className="muted col-time">{timeAgo(tx.time)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
