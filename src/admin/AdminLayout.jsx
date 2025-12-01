// src/admin/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminHeader from "./components/AdminHeader.jsx";
import AdminFooter from "./components/AdminFooter.jsx";
import Sidebar from "./components/Sidebar.jsx";
import "./admin-theme.css"; // debe cargarse en el admin

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-body admin-grid container py-3">
        <Sidebar />
        {/* Contenido principal del panel admin */}
        <main className="admin-main card p-3">
          <Outlet />
        </main>
      </div>
      <AdminFooter />
    </div>
  );
}
