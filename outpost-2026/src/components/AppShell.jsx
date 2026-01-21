import TopBar from "./TopBar";
import NavTabs from "./NavTabs";

export default function AppShell({ children }) {
  return (
    <div className="app">
      <TopBar />
      <NavTabs />
      <main>{children}</main>
    </div>
  );
}
