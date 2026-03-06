import { useEffect, useState } from "react";

export default function NewForm({ service }) {
  const [mail, setMail] = useState("");
  const [role, setRole] = useState("client");
  // const [password, setPassword] = useState("");

  // useEffect(() => {
  //   fetch("/api/admin/password")
  //     .then((r) => r.json())
  //     .then((data) => {
  //       setPassword(data);
  //     });
  // });
  // console.log(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { mail, role };

    const res = await fetch(`/api/${service}/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    console.log("POST result:", data);
    alert("You have sucessfully create an user");
    setMail("");
    setRole("client");
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
      {/* <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password (optional)"
        type="password"
      /> */}
      <button type="submit">Create User</button>
    </form>
  );
}
