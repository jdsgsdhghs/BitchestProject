export default function DeleteUser({ userId }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/${userId}/delete`);
    const data = await res.json().catch(() => null);
    console.log("PATCH result:", data);
  };

  return <button onClick={handleSubmit}> Delete User {userId} </button>;
}
