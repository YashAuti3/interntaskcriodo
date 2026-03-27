import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthPage from "../pages/AuthPage";
import GamePage from "../pages/GamePage";
import WalletPage from "../pages/WalletPage";
import AdminPage from "../pages/AdminPage";
import Navbar from "../components/Navbar";

export default function AppRoutes() {
  const { user, logout, loadingUser } = useAuth();
  const [page, setPage] = useState("game");

  if (loadingUser) {
    return (
      <div className="page-center">
        <div className="bet-card">
          <h2 className="game-title">Loading</h2>
          <p className="game-sub">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (user.role === "admin") {
    return <AdminPage onLogout={logout} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={logout}
      />

      {page === "game" && <GamePage />}
      {page === "wallet" && <WalletPage />}
    </div>
  );
}
