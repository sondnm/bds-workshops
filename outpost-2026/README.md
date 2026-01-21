# Outpost 2026 – Birdeye Solana Dashboard

A real‑time crypto token analytics dashboard for Solana using Birdeye REST APIs + WebSockets. Includes:

- Token list landing page with pagination/sorting
- Token detail page with metadata, momentum, OHLCV candlestick chart, and live transactions
- Wallet analytics with PnL, transfers, balance changes
- Light/Dark mode toggle

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Set your Birdeye API key in `.env`:

   ```bash
   VITE_BIRDEYE_API_KEY=your_key_here
   ```

   Optional (defaults are already set in `.env.example`):

   ```bash
   VITE_BIRDEYE_BASE_URL=https://public-api.birdeye.so
   VITE_BIRDEYE_CHAIN=solana
   VITE_BIRDEYE_WS_URL=wss://public-api.birdeye.so/socket/solana
   VITE_BIRDEYE_WS_PROTOCOL=echo-protocol
   ```

## Run the app

```bash
npm run dev
```

Open the dev server URL that Vite prints in your terminal.

## Build for production

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Notes

- If the API key is missing, the app may fall back to mock data for some screens.
- Websocket updates require a valid Birdeye API key.

## Useful files

- API client: `src/api/birdeye.js`
- Token list page: `src/pages/TokensPage.jsx`
- Token detail page: `src/pages/TokenDetailPage.jsx`
- Wallet page: `src/pages/WalletPage.jsx`
