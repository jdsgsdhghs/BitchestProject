import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profil" },
  { to: "/crypto", label: "Crypto" },
  { to: "/cryptos", label: "Marchés" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner glass-footer">
        <div className="site-footer__brand">
          <div className="site-footer__logo">B</div>
          <div>
            <h3>BitChest</h3>
          </div>
        </div>

        <div className="site-footer__meta">
          <span>© {year} BitChest</span>
          <span className="site-footer__dot">•</span>
          <span>Built for secure crypto experience</span>
        </div>
      </div>
    </footer>
  );
}