import { BIRDEYE_CHAIN, getApiKey } from "./birdeye";

export const BIRDEYE_WS_URL =
  import.meta.env.VITE_BIRDEYE_WS_URL || `wss://public-api.birdeye.so/socket/${BIRDEYE_CHAIN}`;
export const BIRDEYE_WS_PROTOCOL = import.meta.env.VITE_BIRDEYE_WS_PROTOCOL || "echo-protocol";

function safeParse(message) {
  try {
    return JSON.parse(message);
  } catch (error) {
    return null;
  }
}

export function connectTokenStream({
  address,
  chartType = "1H",
  currency = "usd",
  onCandle,
  onStats,
  onTx,
  onStatus,
}) {
  if (!BIRDEYE_WS_URL) return null;
  const apiKey = getApiKey();
  let wsUrl;
  try {
    wsUrl = new URL(BIRDEYE_WS_URL);
  } catch (error) {
    return null;
  }
  if (apiKey) wsUrl.searchParams.set("x-api-key", apiKey);
  const socket = new WebSocket(wsUrl.toString(), BIRDEYE_WS_PROTOCOL);

  socket.addEventListener("open", () => {
    onStatus?.("open");
    socket.send(
      JSON.stringify({
        type: "SUBSCRIBE_PRICE",
        data: {
          queryType: "simple",
          address,
          currency,
          chartType,
        },
      }),
    );
    socket.send(
      JSON.stringify({
        type: "SUBSCRIBE_TOKEN_STATS",
        data: {
          address,
          select: {
            price: true,
            liquidity: true,
            marketcap: true,
            trade_data: {
              volume: true,
              price_change: true,
              intervals: ["1h", "4h", "24h"],
            },
          },
        },
      }),
    );
    socket.send(
      JSON.stringify({
        type: "SUBSCRIBE_TXS",
        data: { address },
      }),
    );
  });

  socket.addEventListener("message", (event) => {
    const payload = safeParse(event.data);
    if (!payload) return;
    const eventType = payload.type || payload.event || payload?.data?.type || "";
    const data = payload.data || payload;

    if (eventType === "PRICE_DATA") {
      onCandle?.(data);
    }
    if (eventType === "TOKEN_STATS_DATA") {
      onStats?.(data);
    }
    if (eventType === "TXS_DATA") {
      onTx?.(data);
    }
  });

  socket.addEventListener("close", () => onStatus?.("close"));
  socket.addEventListener("error", () => onStatus?.("error"));

  return socket;
}
