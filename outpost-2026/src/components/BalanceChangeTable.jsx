import { formatAmount, timeAgo } from "../utils/format";

export default function BalanceChangeTable({ changes }) {
  if (!changes.length) {
    return <div className="empty-state">No balance changes loaded.</div>;
  }

  return (
    <table className="tx-table">
      <thead>
        <tr>
          <th>Token</th>
          <th>Change</th>
          <th>Pre balance</th>
          <th>Post balance</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {changes.map((change, idx) => {
          return (
            <tr key={`${change.symbol}-${change.time || idx}`}>
              <td className="mono">{change.symbol}</td>
              <td className="mono">{formatAmount(change.amount)}</td>
              <td className="mono">{formatAmount(change.preBalance)}</td>
              <td className="mono">{formatAmount(change.postBalance)}</td>
              <td className="muted">{timeAgo(change.time)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
