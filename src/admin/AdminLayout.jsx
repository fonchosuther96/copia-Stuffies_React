// src/admin/AdminLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminHeader from "./components/AdminHeader.jsx";
import AdminFooter from "./components/AdminFooter.jsx";
import Sidebar from "./components/Sidebar.jsx";
import "./admin-theme.css"; // debe cargarse en el admin

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("stuffies_session") || "null");
    if (!session || session.role !== "admin") {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-body admin-grid container py-3">
        <Sidebar />
        {/* 👇 sin bg-dark / text-light */}
        <main className="admin-main card p-3">
          <Outlet />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}
