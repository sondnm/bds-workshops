import { formatMoney, formatPct } from "../utils/format";

export default function TokenTable({ tokens, onSelect }) {
  if (!tokens.length) {
    return <div className="empty-state">No tokens match the filters.</div>;
  }

  return (
    <table className="token-table">
      <thead>
        <tr>
          <th>Token</th>
          <th>Price</th>
          <th>1H</th>
          <th>24H</th>
          <th>7D</th>
          <th>24H Volume</th>
          <th>Liquidity</th>
          <th>Market Cap</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.address} onClick={() => onSelect?.(token)}>
            <td>
              <div className="token-cell">
                {token.logo ? (
                  <img className="token-logo" src={token.logo} alt={`${token.symbol} logo`} loading="lazy" />
                ) : (
                  <div className="token-logo placeholder">{token.symbol?.slice(0, 1) || "?"}</div>
                )}
                <div>
                  <div className="mono">{token.symbol}</div>
                  <div className="muted">{token.name}</div>
                </div>
              </div>
            </td>
            <td className="mono">{formatMoney(token.price)}</td>
            <td>
              <span className={`badge ${token.change1h >= 0 ? "success" : "danger"}`}>
                {formatPct(token.change1h)}
              </span>
            </td>
            <td>
              <span className={`badge ${token.change24h >= 0 ? "success" : "danger"}`}>
                {formatPct(token.change24h)}
              </span>
            </td>
            <td>
              <span className={`badge ${token.change7d >= 0 ? "success" : "danger"}`}>
                {formatPct(token.change7d)}
              </span>
            </td>
            <td className="mono">{formatMoney(token.volume24h)}</td>
            <td className="mono">{formatMoney(token.liquidity)}</td>
            <td className="mono">{formatMoney(token.marketCap)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
