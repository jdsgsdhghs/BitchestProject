import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import "./App.css";
import EditForm from "./Components/admin/EditForm";
import NewForm from "./Components/admin/NewForm";
import Dashbord from "./Components/admin/Dashboard";
import CryptoDashbord from "./pages/Crypto";
import RequireAuth from "./RequireAuth";
import CryptoChart from "./pages/CryptoChart";
import Profile from "./pages/Profile";

export default function App() {
  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((r) => r.json())
      .then((data) => console.log("health:", data))
      .catch((err) => console.error("health error:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Routes protégées */}
        <Route element={<RequireAuth />}>
          <Route path="/cryptos" element={<CryptoChart />} />
          <Route path="/edit" element={<EditForm userId={2} />} />
          <Route path="/new" element={<NewForm service="admin" />} />
          <Route path="/dashboard" element={<Dashbord />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/crypto" element={<CryptoDashbord userId={2} />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
