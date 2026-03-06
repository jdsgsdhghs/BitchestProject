import { useEffect, useMemo, useState } from "react";
import Header from "../Components/layout/Header";

const INITIAL_FORM = {
  mail: "",
  nom: "",
  prenom: "",
  password: "",
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/me", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de charger le profil");
      }

      const currentUser = data.user;
      setUser(currentUser);
      setFormData({
        mail: currentUser.mail || "",
        nom: currentUser.nom || "",
        prenom: currentUser.prenom || "",
        password: "",
      });
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditToggle() {
    if (!user) return;

    setIsEditing((prev) => !prev);
    setError("");
    setMessage("");

    if (isEditing) {
      setFormData({
        mail: user.mail || "",
        nom: user.nom || "",
        prenom: user.prenom || "",
        password: "",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        mail: formData.mail.trim(),
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await fetch("/api/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de mettre à jour le profil");
      }

      setUser(data.user);
      setFormData({
        mail: data.user.mail || "",
        nom: data.user.nom || "",
        prenom: data.user.prenom || "",
        password: "",
      });
      setMessage("Profil mis à jour avec succès.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  }

  const initials = useMemo(() => {
    const first = user?.prenom?.[0] || "";
    const last = user?.nom?.[0] || "";
    const value = `${first}${last}`.trim();
    return value ? value.toUpperCase() : "U";
  }, [user]);

  if (loading) {
    return (
      <section className="profile-page">
        <div className="profile-page__bg profile-page__bg--one" />
        <div className="profile-page__bg profile-page__bg--two" />
        <div className="profile-page__bg profile-page__bg--three" />
        <div className="profile-shell">
          <div className="profile-empty glass">Chargement du profil...</div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-page__bg profile-page__bg--one" />
        <div className="profile-page__bg profile-page__bg--two" />
        <div className="profile-page__bg profile-page__bg--three" />
        <div className="profile-shell">
          <div className="profile-empty glass">Utilisateur introuvable.</div>
        </div>
      </section>
    );
  }

  return (
    <>
    <Header />
    <section className="profile-page">
      <div className="profile-page__bg profile-page__bg--one" />
      <div className="profile-page__bg profile-page__bg--two" />
      <div className="profile-page__bg profile-page__bg--three" />

      <div className="profile-shell">
        <header className="profile-hero glass">
          <div className="profile-hero__left">
            <div className="profile-avatar">{initials}</div>

            <div>
              <p className="profile-hero__eyebrow">Mon espace</p>
              <h1 className="profile-hero__title">
                {user.prenom || "Utilisateur"} {user.nom || ""}
              </h1>
              <p className="profile-hero__subtitle">{user.mail}</p>
            </div>
          </div>

          <div className="profile-hero__stats">
            <div className="profile-stat glass glass--soft">
              <span>Rôle</span>
              <strong>{user.role || "ROLE_USER"}</strong>
            </div>

            <div className="profile-stat glass glass--soft">
              <span>Wallet</span>
              <strong>{user.walletBalance ?? user.wallet?.balance ?? 0} €</strong>
            </div>
          </div>
        </header>

        {error && <div className="profile-alert profile-alert--error glass">{error}</div>}
        {message && <div className="profile-alert profile-alert--success glass">{message}</div>}

        <div className="profile-grid">
          <article className="profile-card glass">
            <div className="profile-card__head">
              <h2>Informations du compte</h2>
              <button className="btn btn--ghost" onClick={handleEditToggle}>
                {isEditing ? "Annuler" : "Modifier"}
              </button>
            </div>

            {!isEditing ? (
              <div className="profile-infos">
                <div className="info-row">
                  <span>Email</span>
                  <strong>{user.mail || "Non renseigné"}</strong>
                </div>

                <div className="info-row">
                  <span>Prénom</span>
                  <strong>{user.prenom || "Non renseigné"}</strong>
                </div>

                <div className="info-row">
                  <span>Nom</span>
                  <strong>{user.nom || "Non renseigné"}</strong>
                </div>

                <div className="info-row">
                  <span>Date de création</span>
                  <strong>{user.creationDate || "—"}</strong>
                </div>
              </div>
            ) : (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form__grid">
                  <label className="field">
                    <span>Email</span>
                    <input
                      type="email"
                      name="mail"
                      value={formData.mail}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="field">
                    <span>Prénom</span>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="field">
                    <span>Nom</span>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="field field--full">
                    <span>Nouveau mot de passe</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Laisser vide pour ne pas le changer"
                    />
                  </label>
                </div>

                <div className="profile-form__actions">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={saving}
                  >
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>

                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={handleEditToggle}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </article>

          <aside className="profile-card glass">
            <div className="profile-card__head">
              <h2>Résumé</h2>
            </div>

            <div className="profile-summary">
              <div className="summary-box glass glass--soft">
                <span>Identifiant</span>
                <strong>#{user.id}</strong>
              </div>

              <div className="summary-box glass glass--soft">
                <span>Rôle</span>
                <strong>{user.role || "ROLE_USER"}</strong>
              </div>

              <div className="summary-box glass glass--soft">
                <span>Balance wallet</span>
                <strong>{user.walletBalance ?? user.wallet?.balance ?? 0} €</strong>
              </div>

              <div className="summary-box glass glass--soft">
                <span>Wallet ID</span>
                <strong>{user.wallet?.id ?? "—"}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  );
}