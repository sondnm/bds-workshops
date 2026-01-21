import { useEffect, useMemo, useRef, useState } from "react";
import { ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { useTheme } from "../../hooks/useTheme";

function clampPrecision(value) {
  if (!Number.isFinite(value)) return 6;
  return Math.min(8, Math.max(2, value));
}

export default function CandleChart({ candles, decimals, onRequestHistory, isHistoryLoading }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const { theme } = useTheme();
  const [hoverData, setHoverData] = useState(null);
  const requestHistoryRef = useRef(onRequestHistory);
  const isLoadingRef = useRef(isHistoryLoading);
  const lastHistoryRef = useRef(0);
  const rangeRef = useRef({ min: null, max: null });

  const precision = useMemo(() => clampPrecision(decimals || 6), [decimals]);

  useEffect(() => {
    requestHistoryRef.current = onRequestHistory;
  }, [onRequestHistory]);

  useEffect(() => {
    isLoadingRef.current = isHistoryLoading;
  }, [isHistoryLoading]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme === "dark" ? "#0b1220" : "#f8fafc",
        },
        textColor: theme === "dark" ? "#e2e8f0" : "#1e293b",
      },
      grid: {
        vertLines: { color: theme === "dark" ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.25)" },
        horzLines: { color: theme === "dark" ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.25)" },
      },
      rightPriceScale: {
        borderColor: theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
      },
      timeScale: {
        borderColor: theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: CrosshairMode.Normal },
      handleScroll: {
        pressedMouseMove: true,
        horzTouchDrag: true,
        mouseWheel: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        pinch: true,
        mouseWheel: true,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#26A69A",
      downColor: "#EF5350",
      borderUpColor: "#26A69A",
      borderDownColor: "#EF5350",
      wickUpColor: "#26A69A",
      wickDownColor: "#EF5350",
      priceFormat: {
        type: "price",
        precision,
        minMove: Math.pow(10, -precision),
      },
    });

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "",
      color: "#26A69A",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleCrosshairMove = (param) => {
      if (!param || !param.time) {
        setHoverData(null);
        return;
      }
      const candle = param.seriesData.get(candleSeries);
      if (!candle) return;
      setHoverData({
        time: param.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
    };

    const handleRangeChange = (range) => {
      if (!range || isLoadingRef.current) return;
      const { min, max } = rangeRef.current;
      if (min === null || max === null) return;
      const now = Date.now();
      if (now - lastHistoryRef.current < 1200) return;
      if (range.from < min && range.to > max) {
        lastHistoryRef.current = now;
        requestHistoryRef.current?.({
          direction: "range",
          timeFrom: Math.floor(range.from),
          timeTo: Math.floor(range.to),
        });
      } else if (range.from < min) {
        lastHistoryRef.current = now;
        requestHistoryRef.current?.({
          direction: "left",
          timeFrom: Math.floor(range.from),
          timeTo: Math.floor(min) - 1,
        });
      } else if (range.to > max) {
        lastHistoryRef.current = now;
        requestHistoryRef.current?.({
          direction: "right",
          timeFrom: Math.floor(max) + 1,
          timeTo: Math.floor(range.to),
        });
      }
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);
    chart.timeScale().subscribeVisibleTimeRangeChange(handleRangeChange);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.timeScale().unsubscribeVisibleTimeRangeChange(handleRangeChange);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      layout: {
        background: {
          type: ColorType.Solid,
          color: theme === "dark" ? "#0b1220" : "#f8fafc",
        },
        textColor: theme === "dark" ? "#e2e8f0" : "#1e293b",
      },
      grid: {
        vertLines: { color: theme === "dark" ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.25)" },
        horzLines: { color: theme === "dark" ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.25)" },
      },
      rightPriceScale: {
        borderColor: theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
      },
      timeScale: {
        borderColor: theme === "dark" ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
        timeVisible: true,
        secondsVisible: false,
      },
    });
  }, [theme]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;
    candleSeriesRef.current.applyOptions({
      priceFormat: {
        type: "price",
        precision,
        minMove: Math.pow(10, -precision),
      },
    });
  }, [precision]);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    const candleData = candles
      .map((item) => ({
        time: Math.floor(item.time / 1000),
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: Number(item.volume || 0),
      }))
      .filter(
        (item) =>
          Number.isFinite(item.time) &&
          Number.isFinite(item.open) &&
          Number.isFinite(item.high) &&
          Number.isFinite(item.low) &&
          Number.isFinite(item.close),
      )
      .sort((a, b) => a.time - b.time)
      .reduce((acc, item) => {
        const last = acc[acc.length - 1];
        if (last && last.time === item.time) {
          acc[acc.length - 1] = item;
        } else {
          acc.push(item);
        }
        return acc;
      }, []);

    const volumeData = candleData.map((item) => ({
      time: item.time,
      value: item.volume || 0,
      color: item.close >= item.open ? "#26A69A" : "#EF5350",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    if (candleData.length) {
      rangeRef.current = {
        min: candleData[0].time,
        max: candleData[candleData.length - 1].time,
      };
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  const latest = candles[candles.length - 1];
  const formatValue = (value) => (Number.isFinite(value) ? value.toFixed(precision) : "-");
  const display = hoverData || (latest ? {
    time: Math.floor(latest.time / 1000),
    open: latest.open,
    high: latest.high,
    low: latest.low,
    close: latest.close,
  } : null);

  return (
    <div className="chart-surface">
      <div ref={containerRef} className="chart-canvas" />
      {display ? (
        <div className="chart-overlay">
          <span>O {formatValue(display.open)}</span>
          <span>H {formatValue(display.high)}</span>
          <span>L {formatValue(display.low)}</span>
          <span>C {formatValue(display.close)}</span>
        </div>
      ) : null}
    </div>
  );
}
