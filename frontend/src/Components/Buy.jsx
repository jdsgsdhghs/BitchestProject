import { useEffect, useState } from "react";

export default function BuyCrypto({
  cryptoId,
  walletInfo,
  onSuccess,
  onCancel,
  cryptoName,
  color = "#4B8BF4",
}) {
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const r = await fetch(`/api/crypto/${cryptoId}`, {
          credentials: "include",
        });
        const data = await r.json();
        setCryptoData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCrypto();
    const interval = setInterval(fetchCrypto, 5000);
    return () => clearInterval(interval);
  }, [cryptoId]);

  const canBuy =
    walletInfo && cryptoData && walletInfo.balance >= cryptoData.actualValue;

  const handleSubmit = async () => {
    if (!cryptoData || !walletInfo) return;
    if (!canBuy) {
      setError("Solde insuffisant.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/acquieredcrypto/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: cryptoData.name,
          value: cryptoData.actualValue,
          walletId: walletInfo.id,
          cryptoId: cryptoData.id,
        }),
      });
      if (!res.ok) throw new Error("Échec de l'achat.");

      const rest = await fetch(`/api/wallet/${walletInfo.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          balance: walletInfo.balance - cryptoData.actualValue,
        }),
      });
      if (!rest.ok) throw new Error("Échec de la mise à jour du wallet.");

      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cryptoData)
    return (
      <p style={{ fontSize: 13, color: "#aaa", padding: "8px 0", margin: 0 }}>
        Chargement...
      </p>
    );

  return (
    <div
      style={{
        background: `${color}08`,
        border: `1px solid ${color}22`,
        borderRadius: 14,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Prix + solde */}
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Prix actuel
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2 }}>
            €
            {cryptoData.actualValue?.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Votre solde
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: canBuy ? "#1a9e5c" : "#e74c3c",
              marginTop: 2,
            }}
          >
            €
            {walletInfo?.balance?.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            }) ?? "—"}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <p style={{ margin: 0, fontSize: 12, color: "#e74c3c" }}>⚠ {error}</p>
      )}
      {success && (
        <p
          style={{ margin: 0, fontSize: 12, color: "#1a9e5c", fontWeight: 600 }}
        >
          ✓ Achat confirmé !
        </p>
      )}

      {/* Actions */}
      {!success && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={loading || !canBuy}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 9,
              border: "none",
              background: !canBuy ? "#e8e8f0" : loading ? "#aac8f7" : color,
              color: !canBuy ? "#aaa" : "#fff",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: !canBuy || loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Achat en cours…" : `Confirmer l'achat`}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: "10px 18px",
                borderRadius: 9,
                border: "1.5px solid #e8e8f0",
                background: "transparent",
                color: "#aaa",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  );
}
