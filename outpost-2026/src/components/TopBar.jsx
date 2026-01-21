import { useTheme } from "../hooks/useTheme";

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="topbar">
      <div className="brand">
        <h1>Outpost</h1>
        <span>Solana token intelligence built on Birdeye</span>
      </div>
      <div className="status-pill">
        <span className="pulse"></span>
        Mainnet live
      </div>
      <div className="top-actions">
        <button
          className="btn btn-ghost"
          type="button"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </header>
  );
}
