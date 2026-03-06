import { useEffect, useState } from "react";

const EMPTY_FORM = {
  mail: "",
  nom: "",
  prenom: "",
  role: "ROLE_USER",
  password: "",
};

export default function Dashbord() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin", {
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 404) {
        setUsers([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "Erreur lors du chargement");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(user) {
    setEditingId(user.id);
    setError("");
    setFormData({
      mail: user.mail || "",
      nom: user.nom || "",
      prenom: user.prenom || "",
      fonction: user.fonction || "",
      role: user.role || "ROLE_USER",
      password: "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(userId) {
    try {
      setSavingId(userId);
      setError("");

      const payload = {
        mail: formData.mail.trim(),
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        fonction: formData.fonction.trim(),
        role: formData.role,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/admin/${userId}/edit`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors || data.error || data.message || "Erreur lors de la mise à jour");
      }

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? data : user))
      );

      setEditingId(null);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(userId) {
    const confirmed = window.confirm("Supprimer cet utilisateur ?");
    if (!confirmed) return;

    try {
      setDeletingId(userId);
      setError("");

      const response = await fetch(`/api/admin/${userId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Erreur lors de la suppression");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));

      if (editingId === userId) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  function getWalletBalance(user) {
    return user.walletBalance ?? user.wallet?.balance ?? 0;
  }

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Administration</p>
          <h1 className="dashboard__title">Gestion des utilisateurs</h1>
          <p className="dashboard__subtitle">
            Consulte, modifie ou supprime les comptes utilisateurs.
          </p>
        </div>

        <button className="btn btn--ghost" onClick={loadUsers}>
          Rafraîchir
        </button>
      </div>

      {error && <div className="dashboard__alert">{error}</div>}

      {loading ? (
        <div className="dashboard__empty">Chargement des utilisateurs...</div>
      ) : users.length === 0 ? (
        <div className="dashboard__empty">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="dashboard__grid">
          {users.map((user) => {
            const isEditing = editingId === user.id;
            const roleClass =
              user.role === "ROLE_ADMIN" ? "badge--admin" : "badge--user";

            return (
              <article className="user-card" key={user.id}>
                <div className="user-card__header">
                  <div>
                    <h2 className="user-card__name">
                      {user.prenom || "—"} {user.nom || ""}
                    </h2>
                    <p className="user-card__mail">{user.mail}</p>
                  </div>

                  <span className={`badge ${roleClass}`}>
                    {user.role || "ROLE_USER"}
                  </span>
                </div>

                {!isEditing ? (
                  <>
                    <div className="user-card__infos">
                      <div className="info-row">
                        <span>ID</span>
                        <strong>{user.id}</strong>
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
                        <span>Wallet</span>
                        <strong>{getWalletBalance(user)} €</strong>
                      </div>

                      <div className="info-row">
                        <span>Créé le</span>
                        <strong>{user.creationDate || "—"}</strong>
                      </div>
                    </div>

                    <div className="user-card__actions">
                      <button
                        className="btn btn--primary"
                        onClick={() => startEdit(user)}
                      >
                        Modifier
                      </button>

                      <button
                        className="btn btn--danger"
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? "Suppression..." : "Supprimer"}
                      </button>
                    </div>
                  </>
                ) : (
                  <form
                    className="user-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave(user.id);
                    }}
                  >
                    <div className="user-form__grid">
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
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Nom</span>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleChange}
                          required
                        />
                      </label>

                      <label className="field">
                        <span>Fonction</span>
                        <input
                          type="text"
                          name="fonction"
                          value={formData.fonction}
                          onChange={handleChange}
                        />
                      </label>

                      <label className="field">
                        <span>Rôle</span>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                        >
                          <option value="ROLE_USER">ROLE_USER</option>
                          <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                        </select>
                      </label>

                      <label className="field">
                        <span>Nouveau mot de passe</span>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Laisser vide pour ne pas changer"
                        />
                      </label>
                    </div>

                    <div className="user-form__wallet">
                      Solde du wallet : <strong>{getWalletBalance(user)} €</strong>
                    </div>

                    <div className="user-card__actions">
                      <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={savingId === user.id}
                      >
                        {savingId === user.id ? "Enregistrement..." : "Enregistrer"}
                      </button>

                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={cancelEdit}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}