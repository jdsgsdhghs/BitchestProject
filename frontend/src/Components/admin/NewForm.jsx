import { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

export default function NewForm({ service }) {
  const [mail, setMail] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mail.trim()) {
      setError("L'adresse email est requise.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/${service}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mail: mail.trim(), role }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Échec de la création.");

      setSuccess(true);
      setMail("");
      setRole("client");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f5fb",
          fontFamily: "'Sora', 'Segoe UI', sans-serif",
          padding: "48px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Page title */}
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1a1a2e",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Nouvel utilisateur
          </h1>
          <p style={{ fontSize: 13, color: "#aaa", margin: "6px 0 0" }}>
            Créez un compte client ou administrateur
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#fff",
            borderRadius: 20,
            padding: "32px 36px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          {/* Success banner */}
          {success && (
            <div
              style={{
                background: "#e8faf0",
                border: "1.5px solid #a3e4c0",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#1a7a42",
                fontWeight: 600,
              }}
            >
              ✓ Utilisateur créé avec succès !
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: "#fde8e8",
                border: "1.5px solid #f5b8b8",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
                fontSize: 13,
                color: "#b0413e",
                fontWeight: 500,
              }}
            >
              ⚠ {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            {/* Email field */}
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Adresse email
              </span>
              <input
                type="email"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                placeholder="exemple@email.com"
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e8e8f0",
                  background: "#fafafc",
                  fontSize: 14,
                  color: "#1a1a2e",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4B8BF4")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8f0")}
              />
            </label>

            {/* Role field */}
            <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Rôle
              </span>
              <div style={{ display: "flex", gap: 10 }}>
                {["client", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      borderRadius: 10,
                      border:
                        role === r
                          ? "1.5px solid #4B8BF4"
                          : "1.5px solid #e8e8f0",
                      background: role === r ? "#eef3ff" : "#fafafc",
                      color: role === r ? "#4B8BF4" : "#aaa",
                      fontSize: 13,
                      fontWeight: role === r ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {r === "client" ? "👤 Client" : "🛡 Administrateur"}
                  </button>
                ))}
              </div>
            </label>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #f0f0f7", margin: "4px 0" }} />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: loading ? "#aac8f7" : "#4B8BF4",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = "#2d6fd4";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = "#4B8BF4";
              }}
            >
              {loading ? "Création en cours…" : "Créer l'utilisateur"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
