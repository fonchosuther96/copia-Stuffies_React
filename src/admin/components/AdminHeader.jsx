// src/admin/components/AdminHeader.jsx
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";

export default function AdminHeader() {
  const nav = useNavigate();
  const { user, logout } = useContext(AuthContext) || {};

  const username = user?.username || "usuario";

  let rawRole =
    user?.role ||
    (Array.isArray(user?.roles) ? user.roles[0] : "") ||
    "";

  rawRole = String(rawRole).toUpperCase();

  const isAdmin = rawRole.includes("ADMIN");
  const isVendedor = rawRole.includes("VENDEDOR");

  let friendlyRole = "";
  if (isAdmin) friendlyRole = "Admin";
  else if (isVendedor) friendlyRole = "Vendedor";

  // Si NO es admin ni vendedor, lo saco del panel
  useEffect(() => {
    if (!isAdmin && !isVendedor) {
      if (typeof logout === "function") logout();
      nav("/", { replace: true });
    }
  }, [isAdmin, isVendedor, logout, nav]);

  const onLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("stuffies_session");
      window.dispatchEvent(new Event("session:updated"));
    }
    nav("/login", { replace: true });
  };

  return (
    <header className="admin-header container px-3 py-2 my-3 rounded-4">
      <div className="d-flex align-items-center justify-content-between gap-3">
        {/* Marca */}
        <Link
          to="/admin"
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <img
            src="https://stuffiesconcept.com/cdn/shop/files/output-onlinegiftools_1.gif?v=1723763811&width=500"
            alt="Stuffies"
            className="brand-logo"
            width={28}
            height={28}
          />
          <span
            className="fw-bold"
            style={{ color: "var(--cx-text, #0f172a)" }}
          >
            {isAdmin ? "Administrador Stuffies" : "Panel Vendedor Stuffies"}
          </span>
        </Link>

        {/* Acciones */}
        <nav className="nav-actions d-flex align-items-center gap-3">
          {/* Usuario + Rol */}
          <span className="ah-link text-uppercase">
            {username} · Rol: {friendlyRole}
          </span>

          <Link to="/" className="ah-link">
            Ir a la tienda
          </Link>

          {/* Dashboard solo visible para ADMIN */}
          {isAdmin && (
            <Link to="/admin" className="ah-link">
              Dashboard
            </Link>
          )}

          <button type="button" onClick={onLogout} className="btn-chip">
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
