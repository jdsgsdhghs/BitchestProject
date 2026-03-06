import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditForm({ userId }) {
  const [mail, setMail] = useState("");
  const [role, setRole] = useState("client");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`/api/admin/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setMail(data.mail || "");
        setRole(data.role || "client");
      });
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { mail, role };
    if (password.trim() !== "") payload.password = password;
    console.log(payload);

    const res = await fetch(`/api/admin/${userId}/edit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    console.log("PATCH result:", data);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={mail}
        onChange={(e) => setMail(e.target.value)}
        placeholder="mail"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="client">client</option>
        <option value="admin">admin</option>
      </select>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password (optional)"
        type="password"
      />
      <button type="submit">Update</button>
    </form>
  );
}
