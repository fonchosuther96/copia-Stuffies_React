import { NavLink, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};

  let rawRole =
    user?.role ||
    (Array.isArray(user?.roles) ? user.roles[0] : "") ||
    "";

  rawRole = String(rawRole).toUpperCase();

  const isAdmin = rawRole.includes("ADMIN");
  const isVendedor = rawRole.includes("VENDEDOR");

  // Seguridad extra: si no es admin ni vendedor, fuera
  useEffect(() => {
    if (!isAdmin && !isVendedor) {
      if (typeof logout === "function") logout();
      nav("/", { replace: true });
    }
  }, [isAdmin, isVendedor, logout, nav]);

  const linkCls = ({ isActive }) =>
    "list-group-item list-group-item-action bg-transparent text-light border-0 " +
    (isActive ? "active-sidebar" : "");

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      {/* Toggle mobile */}
      <button
        className="btn btn-outline-light w-100 d-lg-none mb-3"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Cerrar menú" : "Menú"}
      </button>

      <div className="list-group small">
        {/* ------------------ GENERAL ------------------ */}
        <div className="text-secondary text-uppercase fw-bold px-3 mb-2">
          General
        </div>

        <NavLink to="/admin" end className={linkCls}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/admin/ordenes" className={linkCls}>
          🧾 Órdenes / Boletas
        </NavLink>

        {/* ------------------ PRODUCTOS ------------------ */}
        <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
          Productos
        </div>

        <NavLink to="/admin/productos" className={linkCls}>
          📦 Listado
        </NavLink>

        {/* REPORTES: ADMIN y VENDEDOR */}
        {(isAdmin || isVendedor) && (
          <NavLink to="/admin/reportes" className={linkCls}>
            📈 Reportes
          </NavLink>
        )}

        {/* SOLO ADMIN */}
        {isAdmin && (
          <>
            <NavLink to="/admin/productos/nuevo" className={linkCls}>
              ➕ Nuevo
            </NavLink>

            <NavLink to="/admin/productos/criticos" className={linkCls}>
              ⚠️ Críticos
            </NavLink>
          </>
        )}

        {/* ------------------ CATÁLOGO ------------------ */}
        {isAdmin && (
          <>
            <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
              Catálogo
            </div>

            <NavLink to="/admin/categorias" className={linkCls}>
              🗂️ Categorías
            </NavLink>
          </>
        )}

        {/* ------------------ USUARIOS ------------------ */}
        {isAdmin && (
          <>
            <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
              Usuarios
            </div>

            <NavLink to="/admin/usuarios" className={linkCls}>
              👤 Listado
            </NavLink>
          </>
        )}
      </div>
    </aside>
  );
}
