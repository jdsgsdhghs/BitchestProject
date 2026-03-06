import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [register, setRegister] = useState(false);

  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function Switch() {
    setRegister((v) => !v);
    setError("");
    setInfo("");
  }

  function onSwitchKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      Switch();
    }
  }

  async function apiFetch(url, body) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log("[API] POST", url, body);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await res.text();
      console.log("[API] status", res.status, "body:", text);

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // ignore JSON parse
      }

      if (!res.ok) {
        throw new Error(data?.error || text || `Erreur HTTP ${res.status}`);
      }

      return data;
    } catch (e) {
      if (e.name === "AbortError") {
        throw new Error("Timeout: le serveur ne répond pas (10s).");
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    const cleanMail = mail.trim();
    if (!cleanMail || !password) {
      setError("Email et mot de passe requis.");
      return;
    }

    if (register && password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      if (register) {
        await apiFetch("http://localhost:8000/api/register", {
          mail: cleanMail,
          password,
        });

        await apiFetch("http://localhost:8000/api/login", {
          mail: cleanMail,
          password,
        });

        setInfo("Compte créé et connecté");
      } else {
        await apiFetch("http://localhost:8000/api/login", {
          mail: cleanMail,
          password,
        });

        setInfo("Connecté");
      }

      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">BitChest</h2>
        <h3 className="login-subtitle">{register ? "Sign up" : "Sign in"}</h3>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="email"
            placeholder="Email address"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            autoComplete="email"
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={register ? "new-password" : "current-password"}
          />

          {register && (
            <input
              className="login-input"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          )}

          {error && <p className="login-error">{error}</p>}
          {info && <p className="login-info">{info}</p>}

          <button className="login-button" disabled={loading} type="submit">
            {loading ? "..." : register ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p className="login-switch">
          {register ? "Already have an account?" : "Don't have an account?"}
          <span
            className="login-switchLink"
            onClick={Switch}
            onKeyDown={onSwitchKeyDown}
            role="button"
            tabIndex={0}
          >
            {register ? " Sign in" : " Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}
