import { formatAmount, formatMoney, timeAgo } from "../utils/format";

export default function TransferTable({ transfers }) {
  if (!transfers.length) {
    return <div className="empty-state">No transfers loaded.</div>;
  }

  return (
    <table className="tx-table">
      <thead>
        <tr>
          <th>Direction</th>
          <th>Token</th>
          <th>Amount</th>
          <th>Value</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {transfers.map((transfer, idx) => (
          <tr key={`${transfer.symbol}-${idx}`}>
            <td>{transfer.direction}</td>
            <td className="mono">{transfer.symbol}</td>
            <td className="mono">{formatAmount(transfer.amount)}</td>
            <td className="mono">{formatMoney(transfer.value)}</td>
            <td className="muted">{timeAgo(transfer.time)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
