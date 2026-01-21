import { NavLink } from "react-router-dom";

export default function NavTabs() {
  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className="nav" role="tablist">
      <NavLink className={linkClass} to="/" role="tab">
        Tokens
      </NavLink>
      <NavLink className={linkClass} to="/token" role="tab">
        Token Detail
      </NavLink>
      <NavLink className={linkClass} to="/wallet" role="tab">
        Wallet
      </NavLink>
    </nav>
  );
}
