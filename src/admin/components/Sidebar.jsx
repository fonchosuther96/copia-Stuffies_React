import { NavLink } from "react-router-dom";
import { useState } from "react";

/**
 * Sidebar para el panel admin.
 * - Responsive: botón para colapsar en móviles
 * - Activo: NavLink añade la clase 'active' automáticamente
 */
export default function Sidebar() {
  const [open, setOpen] = useState(false);

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
        <div className="text-secondary text-uppercase fw-bold px-3 mb-2">
          General
        </div>
        <NavLink to="/admin" end className={linkCls}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/admin/ordenes" className={linkCls}>
          🧾 Órdenes / Boletas
        </NavLink>

        <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
          Productos
        </div>
        <NavLink to="/admin/productos" className={linkCls}>
          📦 Listado
        </NavLink>
        <NavLink to="/admin/productos/nuevo" className={linkCls}>
          ➕ Nuevo
        </NavLink>
        <NavLink to="/admin/productos/criticos" className={linkCls}>
          ⚠️ Críticos
        </NavLink>
        <NavLink to="/admin/reportes" className={linkCls}>
          📈 Reportes
        </NavLink>

        <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
          Catálogo
        </div>
        <NavLink to="/admin/categorias" className={linkCls}>
          🗂️ Categorías
        </NavLink>
        <NavLink to="/admin/categorias/nueva" className={linkCls}>
          ➕ Nueva categoría
        </NavLink>

        <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
          Usuarios
        </div>
        <NavLink to="/admin/usuarios" className={linkCls}>
          👤 Listado
        </NavLink>
        <NavLink to="/admin/usuarios/nuevo" className={linkCls}>
          ➕ Nuevo usuario
        </NavLink>

        <div className="text-secondary text-uppercase fw-bold px-3 mt-3 mb-2">
          Cuenta
        </div>
        <NavLink to="/admin/perfil" className={linkCls}>
          ⚙️ Perfil
        </NavLink>
      </div>
    </aside>
  );
}
