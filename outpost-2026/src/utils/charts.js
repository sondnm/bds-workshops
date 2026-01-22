export function drawCandles(canvas, candles) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (!candles.length) return;

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const span = max - min || 1;
  const padding = 24;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const candleWidth = Math.max(6, chartWidth / candles.length);

  ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  candles.forEach((candle, i) => {
    const x = padding + i * candleWidth + candleWidth / 2;
    const openY = padding + ((max - candle.open) / span) * chartHeight;
    const closeY = padding + ((max - candle.close) / span) * chartHeight;
    const highY = padding + ((max - candle.high) / span) * chartHeight;
    const lowY = padding + ((max - candle.low) / span) * chartHeight;
    const bullish = candle.close >= candle.open;
    ctx.strokeStyle = bullish ? "#26A69A" : "#EF5350";
    ctx.fillStyle = bullish ? "#26A69A" : "#EF5350";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();
    const rectY = Math.min(openY, closeY);
    const rectH = Math.max(2, Math.abs(openY - closeY));
    ctx.fillRect(x - candleWidth / 3, rectY, candleWidth / 1.5, rectH);
  });
}

export function drawLineChart(canvas, points) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (!points.length) return;

  const styles = window.getComputedStyle(document.documentElement);
  const muted = styles.getPropertyValue("--muted")?.trim() || "#64748b";
  const grid = styles.getPropertyValue("--grid")?.trim() || "rgba(148, 163, 184, 0.3)";

  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const span = max - min || 1;
  const padding = { top: 16, right: 12, bottom: 26, left: 48 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.stroke();

  const yTicks = 4;
  ctx.fillStyle = muted;
  ctx.font = "11px \"Fira Sans\", system-ui, sans-serif";
  for (let i = 0; i <= yTicks; i += 1) {
    const value = max - (span / yTicks) * i;
    const y = padding.top + (chartHeight / yTicks) * i;
    ctx.fillText(formatAxisValue(value), 6, y + 3);
    ctx.strokeStyle = grid;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#3B82F6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, idx) => {
    const x = padding.left + (chartWidth / (points.length - 1)) * idx;
    const y = padding.top + ((max - point.value) / span) * chartHeight;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const xTicks = Math.min(4, Math.max(1, points.length - 1));
  for (let i = 0; i <= xTicks; i += 1) {
    const idx = Math.round((points.length - 1) * (i / xTicks));
    const point = points[idx];
    if (!point) continue;
    const x = padding.left + (chartWidth / (points.length - 1)) * idx;
    const label = formatTimeLabel(point.time);
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = muted;
    ctx.fillText(label, Math.min(width - padding.right - textWidth, Math.max(padding.left, x - textWidth / 2)), height - 8);
  }
}

function formatAxisValue(value) {
  if (!Number.isFinite(value)) return "-";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${trimDecimal(value / 1e9)}B`;
  if (abs >= 1e6) return `${trimDecimal(value / 1e6)}M`;
  if (abs >= 1e3) return `${trimDecimal(value / 1e3)}K`;
  if (abs >= 10) return value.toFixed(0);
  if (abs >= 1) return value.toFixed(2);
  return value.toFixed(4);
}

function trimDecimal(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded.toFixed(0)) : String(rounded);
}

function formatTimeLabel(value) {
  if (!value) return "-";
  const time = value > 1e12 ? new Date(value) : new Date(value * 1000);
  if (Number.isNaN(time.getTime())) return "-";
  const diff = Date.now() - time.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff > oneDay * 2) {
    return time.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
