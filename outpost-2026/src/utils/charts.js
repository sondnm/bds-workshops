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

  const max = Math.max(...points.map((p) => p.value));
  const min = Math.min(...points.map((p) => p.value));
  const span = max - min || 1;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  ctx.strokeStyle = "#3B82F6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, idx) => {
    const x = padding + (chartWidth / (points.length - 1)) * idx;
    const y = padding + ((max - point.value) / span) * chartHeight;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}
