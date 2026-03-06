import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const CRYPTOS = [
  { id: 1, name: "Bitcoin" },
  { id: 2, name: "Ethereum" },
  { id: 3, name: "Ripple" },
  { id: 4, name: "Bitcoin cash" },
  { id: 5, name: "Cardano" },
  { id: 6, name: "Litecoin" },
  { id: 7, name: "Dash" },
  { id: 8, name: "Iota" },
  { id: 9, name: "NEM" },
  { id: 10, name: "Stellar" },
];

const COLORS = {
  Bitcoin: "#F7931A",
  Ethereum: "#627EEA",
  Ripple: "#00AAE4",
  "Bitcoin cash": "#8DC351",
  Cardano: "#0033AD",
  Litecoin: "#BFBBBB",
  Dash: "#008CE7",
  Iota: "#8888cc",
  NEM: "#67B346",
  Stellar: "#7D00FF",
};


const CustomTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#0f1117",
        border: `1px solid ${color}44`,
        borderRadius: 10,
        padding: "10px 16px",
        boxShadow: `0 0 20px ${color}33`,
      }}
    >
      <p style={{ color: "#888", fontSize: 12, margin: 0 }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: 16, margin: "4px 0 0" }}>
        {payload[0].value.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}{" "}
        $
      </p>
    </div>
  );
};


export default function CryptoChart() {
  const [selected, setSelected] = useState(CRYPTOS[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    
    setLoading(true);
    setError(null);
    setData([]);

    const loadQuotations = async () => {
      try {
        const r = await fetch(
          `http://localhost:8000/api/crypto/${selected.id}/quotations`,
        {credentials: "include"});
        if (!r.ok) throw new Error(`Erreur HTTP ${r.status}`);
        const json = await r.json();

        if (!cancelled) {
          const formatted = json.quotations.map((q) => ({
            date: q.quotedAt,
            value: q.value,
          }));
          setData(formatted);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadQuotations();

    
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const color = COLORS[selected.name] ?? "#ffffff";
  const current = data[data.length - 1]?.value;
  const first = data[0]?.value;
  const delta = current && first ? ((current - first) / first) * 100 : 0;
  const isUp = delta >= 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        fontFamily: "'DM Mono', 'Courier New', monospace",
        color: "#e0e0e0",
      }}
    >
      
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#fff",
            margin: 0,
          }}
        >
          ₿ Bitchest
        </h1>
        <p
          style={{
            color: "#555",
            fontSize: 13,
            marginTop: 6,
            letterSpacing: "0.08em",
          }}
        >
          Évolution des cotations — 30 derniers jours
        </p>
      </div>

    
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          marginBottom: 32,
          maxWidth: 700,
        }}
      >
        {CRYPTOS.map((crypto) => (
          <button
            key={crypto.id}
            onClick={() => setSelected(crypto)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border:
                selected.id === crypto.id
                  ? `1.5px solid ${COLORS[crypto.name]}`
                  : "1.5px solid #2a2a3a",
              background:
                selected.id === crypto.id
                  ? `${COLORS[crypto.name]}18`
                  : "transparent",
              color: selected.id === crypto.id ? COLORS[crypto.name] : "#666",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: selected.id === crypto.id ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.04em",
            }}
          >
            {crypto.name}
          </button>
        ))}
      </div>

      
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          background: "#0f1117",
          borderRadius: 20,
          border: `1px solid ${color}22`,
          padding: "28px 28px 20px",
          boxShadow: `0 0 60px ${color}11`,
        }}
      >
        
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#555",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {selected.name}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#fff",
                marginTop: 4,
              }}
            >
              {current?.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              $
            </div>
          </div>
          <div
            style={{
              background: isUp ? "#0d2b1a" : "#2b0d0d",
              border: `1px solid ${isUp ? "#1a7a42" : "#7a1a1a"}`,
              borderRadius: 10,
              padding: "6px 14px",
              fontSize: 15,
              fontWeight: 700,
              color: isUp ? "#2ecc71" : "#e74c3c",
            }}
          >
            {isUp ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div
            style={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#444",
            }}
          >
            Chargement...
          </div>
        ) : error ? (
          <div
            style={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#e74c3c",
              fontSize: 13,
            }}
          >
            ⚠ {error} — vérifie que ton API Symfony est bien démarrée sur le
            port 8000
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="50%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#1a1a2e"
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 11, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "#444", fontSize: 11, fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                width={70}
                tickFormatter={(v) =>
                  v >= 1000
                    ? `${(v / 1000).toFixed(1)}k`
                    : v.toFixed(v < 1 ? 4 : 2)
                }
              />
              <Tooltip content={<CustomTooltip color={color} />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGlow)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: color,
                  stroke: "#0f1117",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <p
          style={{
            fontSize: 11,
            color: "#333",
            textAlign: "right",
            marginTop: 12,
            letterSpacing: "0.05em",
          }}
        >
          Données API Symfony • Bitchest prototype
        </p>
      </div>
    </div>
  );
}
