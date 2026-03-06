import { useEffect, useState } from "react";
import BuyCrypto from "../Components/Buy";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";

const COLORS = {
  Bitcoin: "#F7931A",
  Ethereum: "#627EEA",
  Ripple: "#00AAE4",
  "Bitcoin cash": "#8DC351",
  Cardano: "#4B8BF4",
  Litecoin: "#BFBBBB",
  Dash: "#008CE7",
  Iota: "#8888cc",
  NEM: "#67B346",
  Stellar: "#7D00FF",
};

function getColor(name) {
  return COLORS[name] ?? "#4B8BF4";
}

function CryptoAvatar({ name }) {
  const color = getColor(name);
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: `${color}18`,
        border: `1.5px solid ${color}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 13,
        color,
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function CryptoDashboard({ userId }) {
  const [cryptos, setCryptos] = useState([]);
  const [acquieredCryptos, setAcquiered] = useState([]);
  const [user, setUser] = useState({});
  const [search, setSearch] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("market"); // "market" | "portfolio"

  useEffect(() => {
    Promise.all([
      fetch("/api/crypto", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/acquieredcrypto", { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`/api/admin/${userId}`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
    ])
      .then(([cryptoData, acquiredData, userData]) => {
        setCryptos(cryptoData.CryptoCurrencies || []);
        setAcquiered(acquiredData.acquieredCrypto || []);
        setUser(userData || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  // Regroupe les cryptos acquises
  const groupedCryptos = Object.values(
    acquieredCryptos.reduce((acc, crypto) => {
      const key = `${crypto.crypto.name}-${crypto.value}`;
      if (!acc[key])
        acc[key] = {
          name: crypto.crypto.name,
          value: crypto.value,
          quantity: 0,
        };
      acc[key].quantity += 1;
      return acc;
    }, {}),
  );

  const filtered = cryptos.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPortfolio = groupedCryptos.reduce(
    (sum, c) => sum + c.value * c.quantity,
    0,
  );

  const handleBuySuccess = () => {
    setBuyingId(null);
    // Refresh acquired cryptos
    fetch("/api/acquieredcrypto", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setAcquiered(data.acquieredCrypto || []));
    // Refresh user wallet
    fetch(`/api/admin/${userId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data || {}));
  };

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f5fb",
          fontFamily: "'Sora', 'Segoe UI', sans-serif",
          padding: "32px 36px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#1a1a2e",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Marchés & Portfolio
            </h1>
            <p style={{ fontSize: 13, color: "#aaa", margin: "4px 0 0" }}>
              Achetez des cryptos et suivez vos investissements
            </p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e8e8f0",
              borderRadius: 14,
              padding: "10px 20px",
              textAlign: "right",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#aaa",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Solde disponible
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#1a9e5c",
                marginTop: 2,
              }}
            >
              €
              {user.wallet?.balance?.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              }) ?? "—"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "#fff",
            borderRadius: 12,
            padding: 4,
            width: "fit-content",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          {[
            ["market", "🏪 Marché"],
            ["portfolio", "💼 Mon Portfolio"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "8px 20px",
                borderRadius: 9,
                border: "none",
                background: activeTab === key ? "#4B8BF4" : "transparent",
                color: activeTab === key ? "#fff" : "#888",
                fontWeight: activeTab === key ? 700 : 500,
                fontSize: 13,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 60,
              color: "#bbb",
              fontSize: 14,
            }}
          >
            Chargement...
          </div>
        ) : activeTab === "market" ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "24px 28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              maxWidth: 860,
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#ccc",
                  fontSize: 15,
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Rechercher une crypto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 16px 11px 40px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e8f0",
                  background: "#fafafc",
                  fontSize: 14,
                  color: "#1a1a2e",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4B8BF4")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8f0")}
              />
            </div>

            {/* Crypto list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((crypto, i) => {
                const color = getColor(crypto.name);
                const isOpen = buyingId === crypto.id;
                return (
                  <div
                    key={crypto.id}
                    style={{
                      border: isOpen
                        ? `1.5px solid ${color}44`
                        : "1.5px solid #f0f0f7",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: isOpen ? `${color}05` : "#fff",
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        gap: 14,
                      }}
                    >
                      <CryptoAvatar name={crypto.name} />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1a1a2e",
                          }}
                        >
                          {crypto.name}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}
                        >
                          Cours en temps réel
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#1a1a2e",
                          minWidth: 90,
                          textAlign: "right",
                        }}
                      >
                        €
                        {crypto.actualValue?.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </div>

                      <button
                        onClick={() => setBuyingId(isOpen ? null : crypto.id)}
                        style={{
                          padding: "8px 20px",
                          borderRadius: 8,
                          border: "none",
                          background: isOpen ? "#f0f0f7" : "#4B8BF4",
                          color: isOpen ? "#888" : "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!isOpen) e.target.style.background = "#2d6fd4";
                        }}
                        onMouseLeave={(e) => {
                          if (!isOpen) e.target.style.background = "#4B8BF4";
                        }}
                      >
                        {isOpen ? "Annuler" : "Acheter"}
                      </button>
                    </div>

                    {/* Inline buy panel */}
                    {isOpen && (
                      <div style={{ padding: "0 16px 16px" }}>
                        <BuyCrypto
                          cryptoId={crypto.id}
                          walletInfo={user.wallet}
                          color={color}
                          onSuccess={handleBuySuccess}
                          onCancel={() => setBuyingId(null)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 860 }}>
            {/* Portfolio summary card */}
            <div
              style={{
                background: "#1a1a2e",
                borderRadius: 20,
                padding: "24px 28px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Valeur totale du portfolio
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#fff",
                    marginTop: 4,
                    letterSpacing: "-0.02em",
                  }}
                >
                  €
                  {totalPortfolio.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#555" }}>
                {groupedCryptos.length} crypto
                {groupedCryptos.length > 1 ? "s" : ""} détenue
                {groupedCryptos.length > 1 ? "s" : ""}
              </div>
            </div>

            {/* Portfolio items */}
            {groupedCryptos.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "48px 28px",
                  textAlign: "center",
                  color: "#bbb",
                  fontSize: 14,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                Vous ne possédez pas encore de cryptos.
                <br />
                <span
                  style={{
                    color: "#4B8BF4",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                  onClick={() => setActiveTab("market")}
                >
                  Aller au marché →
                </span>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {groupedCryptos.map((crypto, i) => {
                  const color = getColor(crypto.name);
                  const total = crypto.value * crypto.quantity;
                  return (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        border: "1.5px solid #f0f0f7",
                        borderRadius: 14,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                      }}
                    >
                      <CryptoAvatar name={crypto.name} />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1a2e",
                          }}
                        >
                          {crypto.name}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}
                        >
                          {crypto.quantity} unité
                          {crypto.quantity > 1 ? "s" : ""} · €
                          {crypto.value.toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}{" "}
                          / unité
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color }}>
                          €
                          {total.toLocaleString("fr-FR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}
                        >
                          valeur totale
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
