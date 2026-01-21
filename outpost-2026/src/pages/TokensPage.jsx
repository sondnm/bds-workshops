import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTokenList } from "../api/birdeye";
import TokenTable from "../components/TokenTable";
import Pagination from "../components/Pagination";
import { seedTokens } from "../data/mock";
import { useApiKey } from "../hooks/useApiKey";

const SORT_OPTIONS = [
  { value: "liquidity", label: "Liquidity" },
  { value: "market_cap", label: "Market Cap" },
  { value: "fdv", label: "FDV" },
  { value: "recent_listing_time", label: "Recent Listing Time" },
  { value: "last_trade_unix_time", label: "Last Trade Time" },
  { value: "holder", label: "Holders" },
  { value: "volume_1h_usd", label: "Volume 1H (USD)" },
  { value: "volume_2h_usd", label: "Volume 2H (USD)" },
  { value: "volume_4h_usd", label: "Volume 4H (USD)" },
  { value: "volume_8h_usd", label: "Volume 8H (USD)" },
  { value: "volume_24h_usd", label: "Volume 24H (USD)" },
  { value: "volume_7d_usd", label: "Volume 7D (USD)" },
  { value: "volume_30d_usd", label: "Volume 30D (USD)" },
  { value: "volume_1h_change_percent", label: "Volume 1H Change %" },
  { value: "volume_2h_change_percent", label: "Volume 2H Change %" },
  { value: "volume_4h_change_percent", label: "Volume 4H Change %" },
  { value: "volume_8h_change_percent", label: "Volume 8H Change %" },
  { value: "volume_24h_change_percent", label: "Volume 24H Change %" },
  { value: "volume_7d_change_percent", label: "Volume 7D Change %" },
  { value: "volume_30d_change_percent", label: "Volume 30D Change %" },
  { value: "price_change_1h_percent", label: "Price 1H Change %" },
  { value: "price_change_2h_percent", label: "Price 2H Change %" },
  { value: "price_change_4h_percent", label: "Price 4H Change %" },
  { value: "price_change_8h_percent", label: "Price 8H Change %" },
  { value: "price_change_24h_percent", label: "Price 24H Change %" },
  { value: "price_change_7d_percent", label: "Price 7D Change %" },
  { value: "price_change_30d_percent", label: "Price 30D Change %" },
  { value: "trade_1h_count", label: "Trades 1H" },
  { value: "trade_2h_count", label: "Trades 2H" },
  { value: "trade_4h_count", label: "Trades 4H" },
  { value: "trade_8h_count", label: "Trades 8H" },
  { value: "trade_24h_count", label: "Trades 24H" },
  { value: "trade_7d_count", label: "Trades 7D" },
  { value: "trade_30d_count", label: "Trades 30D" },
];

const SORT_LABELS = {
  liquidity: "liquidity",
  market_cap: "marketCap",
  fdv: "marketCap",
  volume_1h_usd: "volume24h",
  volume_2h_usd: "volume24h",
  volume_4h_usd: "volume24h",
  volume_8h_usd: "volume24h",
  volume_24h_usd: "volume24h",
  volume_7d_usd: "volume24h",
  volume_30d_usd: "volume24h",
  volume_1h_change_percent: "change1h",
  volume_2h_change_percent: "change1h",
  volume_4h_change_percent: "change1h",
  volume_8h_change_percent: "change1h",
  volume_24h_change_percent: "change24h",
  volume_7d_change_percent: "change7d",
  volume_30d_change_percent: "change30d",
  price_change_1h_percent: "change1h",
  price_change_2h_percent: "change1h",
  price_change_4h_percent: "change1h",
  price_change_8h_percent: "change1h",
  price_change_24h_percent: "change24h",
  price_change_7d_percent: "change7d",
  price_change_30d_percent: "change30d",
};

export default function TokensPage() {
  const navigate = useNavigate();
  const { apiKey } = useApiKey();
  const [tokens, setTokens] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [serverMode, setServerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("volume_24h_usd");
  const [sortType, setSortType] = useState("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "" });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      if (!apiKey) {
        setTokens(seedTokens);
        setTotalTokens(seedTokens.length);
        setServerMode(false);
        setLoading(false);
        return;
      }

      try {
        const { tokens: list, total } = await getTokenList({
          limit: pageSize,
          offset: (page - 1) * pageSize,
          sortBy,
          sortType,
          filters,
        });
        if (active) {
          setTokens(list);
          setTotalTokens(total || list.length);
          setServerMode(true);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setTokens(seedTokens);
          setTotalTokens(seedTokens.length);
          setServerMode(false);
          const message =
            err && err.message ? `Unable to load Birdeye token list: ${err.message}` : "Unable to load Birdeye token list.";
          setError(message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [apiKey, page, pageSize, sortBy, sortType, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, sortType, pageSize]);

  const filteredTokens = useMemo(() => {
    if (serverMode) return tokens;
    const query = filters.search.trim().toLowerCase();

    return tokens.filter((token) => {
      if (query) {
        const match =
          token.name.toLowerCase().includes(query) ||
          token.symbol.toLowerCase().includes(query) ||
          token.address.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [tokens, filters, serverMode]);

  const sortedTokens = useMemo(() => {
    if (serverMode) return filteredTokens;
    const key = SORT_LABELS[sortBy] || "volume24h";
    return [...filteredTokens].sort((a, b) => {
      const value = (a[key] || 0) - (b[key] || 0);
      return sortType === "asc" ? value : -value;
    });
  }, [filteredTokens, sortBy, sortType, serverMode]);

  const totalCount = serverMode ? totalTokens : sortedTokens.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageItems = serverMode ? sortedTokens : sortedTokens.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleFilterChange = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="section">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Token discovery</div>
            <div className="muted">Live prices, liquidity, and momentum on Solana</div>
          </div>
          <div className="toolbar">
            <span className="pill">{totalCount} tokens</span>
            <input
              type="search"
              placeholder="Search token or address"
              value={filters.search}
              onChange={handleFilterChange("search")}
              aria-label="Search tokens"
            />
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select value={sortType} onChange={(event) => setSortType(event.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        {error ? <div className="muted">{error}</div> : null}
        {loading ? <div className="empty-state">Loading tokens...</div> : null}
        {!loading ? (
          <TokenTable
            tokens={pageItems}
            onSelect={(token) => navigate(`/token/${token.address}`)}
          />
        ) : null}
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          onPageSize={(value) => setPageSize(Number(value))}
        />
      </div>

    </section>
  );
}
