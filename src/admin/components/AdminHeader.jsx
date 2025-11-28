// src/admin/components/AdminHeader.jsx
import { Link, useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const nav = useNavigate();

  const onLogout = () => {
    localStorage.removeItem("stuffies_session");
    window.dispatchEvent(new Event("session:updated"));
    nav("/login", { replace: true });
  };

  return (
    <header className="admin-header container px-3 py-2 my-3 rounded-4">
      <div className="d-flex align-items-center justify-content-between gap-3">
        {/* Marca (logo + texto) */}
        <Link to="/admin" className="d-flex align-items-center gap-2 text-decoration-none">
          <img
            src="https://stuffiesconcept.com/cdn/shop/files/output-onlinegiftools_1.gif?v=1723763811&width=500"
            alt="Stuffies"
            className="brand-logo"
            width={28}
            height={28}
          />
          <span className="fw-bold" style={{ color: "var(--cx-text, #0f172a)" }}>
            Administrador Stuffies
          </span>
        </Link>

        {/* Acciones */}
        <nav className="nav-actions d-flex align-items-center gap-3">
          <Link to="/" className="ah-link">Ir a la tienda</Link>
          <Link to="/admin" className="ah-link">Dashboard</Link>

          {/* Botón chip */}
          <button type="button" onClick={onLogout} className="btn-chip">
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
