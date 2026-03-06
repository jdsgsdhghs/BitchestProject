import { useEffect, useState } from "react";

export default function BuyCrypto({ cryptoId, walletInfo }) {
  const [cryptoData, setCryptoData] = useState([]);
  useEffect(() => {
    const fetchCrypto = async () => {
      const response = await fetch(`/api/crypto/${cryptoId}`);
      const data = await response.json();
      setCryptoData(data);
    };

    fetchCrypto();

    const interval = setInterval(fetchCrypto, 5000);

    return () => clearInterval(interval);
  }, [cryptoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cryptoData) return;

    if (cryptoData.actualValue > walletInfo.balance) {
      alert("You don't have enough balance.");
      return;
    }

    const balance = walletInfo.balance - cryptoData.actualValue;
    const walletLoad = { balance };
    const payload = {
      name: cryptoData.name,
      value: cryptoData.actualValue,
      walletId: walletInfo.id,
      cryptoId: cryptoData.id,
    };
    const res = await fetch("/api/acquieredcrypto/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    console.log("POST result:", data);
    const rest = await fetch(`/api/wallet/${walletInfo.id}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(walletLoad),
    });

    const data2 = await rest.json().catch(() => null);
    console.log("PATCH result:", data2);
    alert(`You have successfully bought ${cryptoData.name}`);
  };

  return <button onClick={handleSubmit}> Buy Crypto {cryptoId} </button>;
}
