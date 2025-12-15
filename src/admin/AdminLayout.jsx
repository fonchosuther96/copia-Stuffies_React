// src/admin/AdminLayout.jsx
import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import AdminHeader from "./components/AdminHeader.jsx";
import AdminFooter from "./components/AdminFooter.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import "./admin-theme.css";

export default function AdminLayout() {
  const { user } = useContext(AuthContext) || {};

  const rawRole = String(
    user?.role ||
      (Array.isArray(user?.roles) ? user.roles[0] : "") ||
      ""
  ).toUpperCase();

  const isAdmin = rawRole.includes("ADMIN");
  const isVendedor = rawRole.includes("VENDEDOR");

  // ❌ No logeado o rol no permitido
  if (!user || (!isAdmin && !isVendedor)) {
    return (
      <div className="container py-5 text-center">
        <h2>No tienes permiso para ver esta página</h2>
        <p>Si crees que esto es un error, contacta al administrador.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-body admin-grid container py-3">
        <Sidebar />
        <main className="admin-main card p-3">
          <Outlet />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}
