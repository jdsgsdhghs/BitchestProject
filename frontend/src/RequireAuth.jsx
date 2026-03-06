import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const [state, setState] = useState({ loading: true, ok: false });
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;

    fetch("http://localhost:8000/api/me", {
      method: "GET",
      credentials: "include",
    })
      .then(async (res) => {
        if (cancelled) return;

        if (res.ok) {
          setState({ loading: false, ok: true });
          return;
        }

        setState({ loading: false, ok: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ loading: false, ok: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return null;

  if (!state.ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}