import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import TokensPage from "./pages/TokensPage";
import TokenDetailPage from "./pages/TokenDetailPage";
import WalletPage from "./pages/WalletPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<TokensPage />} />
          <Route path="/token/:address?" element={<TokenDetailPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
