import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/new", label: "Nouvel utilisateur" },
  { to: "/profile", label: "Profil" },
  { to: "/crypto", label: "Crypto" },
  { to: "/cryptos", label: "Marchés" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("logout error:", error);
    } finally {
      navigate("/login");
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner glass-nav">
          <NavLink to="/dashboard" className="site-header__brand">
            <span className="site-header__logo">C</span>
            <div>
              <strong>BitChest</strong>
              <span>First on crypto</span>
            </div>
          </NavLink>

          <nav className="site-header__nav desktop-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `site-header__link ${isActive ? "is-active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button
              className="site-header__logout desktop-only"
              onClick={handleLogout}
            >
              Déconnexion
            </button>

            <button
              className={`burger ${menuOpen ? "is-open" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu-backdrop ${menuOpen ? "is-visible" : ""}`} />

      <aside className={`mobile-menu glass-nav ${menuOpen ? "is-open" : ""}`}>
        <div className="mobile-menu__top">
          <div className="site-header__brand site-header__brand--mobile">
            <span className="site-header__logo">C</span>
            <div>
              <strong>Crypto Admin</strong>
              <span>Navigation</span>
            </div>
          </div>

          <button
            className="mobile-menu__close"
            onClick={() => setMenuOpen(false)}
            type="button"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-menu__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `mobile-menu__link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="site-header__logout mobile-menu__logout"
          onClick={handleLogout}
        >
          Déconnexion
        </button>
      </aside>
    </>
  );
}
