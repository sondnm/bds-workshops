import { useEffect, useRef } from "react";
import { connectTokenStream } from "../api/birdeyeSocket";

export function useRealtimeToken({ address, chartType, currency, onCandle, onStats, onTx, onStatus, fallback }) {
  const fallbackRef = useRef(null);

  useEffect(() => {
    if (!address) return undefined;

    let socket = null;
    const handleStatus = (nextStatus) => {
      onStatus?.(nextStatus);
      if ((nextStatus === "error" || nextStatus === "close") && fallback && !fallbackRef.current) {
        fallbackRef.current = fallback();
      }
    };

    if (typeof WebSocket !== "undefined") {
      socket = connectTokenStream({
        address,
        chartType,
        currency,
        onCandle,
        onStats,
        onTx,
        onStatus: handleStatus,
      });
    }

    if (!socket && fallback) {
      fallbackRef.current = fallback();
    }

    return () => {
      if (socket) socket.close();
      if (fallbackRef.current) {
        fallbackRef.current();
        fallbackRef.current = null;
      }
    };
  }, [address, chartType, currency, onCandle, onStats, onTx, onStatus, fallback]);
}
