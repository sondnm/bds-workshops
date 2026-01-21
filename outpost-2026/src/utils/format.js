export function formatMoney(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  if (abs >= 10) return `$${value.toFixed(2)}`;
  if (abs >= 1) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}

export function formatPct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString("en-US");
}

export function formatAmount(value, digits = null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const abs = Math.abs(value);
  const resolvedDigits =
    digits !== null && digits !== undefined
      ? digits
      : abs < 1
        ? 6
        : abs < 10
          ? 4
          : 2;
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: resolvedDigits,
    maximumFractionDigits: resolvedDigits,
  });
}

export function timeAgo(timestamp) {
  if (!Number.isFinite(timestamp)) return "-";
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s`;
  }
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function shortAddress(value) {
  if (!value) return "-";
  if (value.length <= 10) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
