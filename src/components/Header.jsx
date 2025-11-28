// src/components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { getCartTotals } from "../services/cart.js";

function MobileDrawer({ open, onClose, session, cartCount, onLogout, navigate }) {
  // Monta el portal en body para evitar stacking context
  if (typeof document === "undefined") return null;

  useEffect(() => {
    // Bloquear scroll cuando está abierto
    if (open) document.body.classList.add("mm-lock");
    else document.body.classList.remove("mm-lock");
    return () => document.body.classList.remove("mm-lock");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="mdraw-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside className="mdraw-panel" role="dialog" aria-modal="true" aria-label="Menú de navegación">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link to="/" onClick={onClose} className="d-inline-flex align-items-center gap-2 text-decoration-none">
            <img
              src="https://stuffiesconcept.com/cdn/shop/files/output-onlinegiftools_1.gif?v=1723763811&width=500"
              alt="Logo Stuffies"
              className="rounded-circle border"
              style={{ width: 36, height: 36, objectFit: "contain" }}
            />
            <span className="fw-bold">STUFFIES</span>
          </Link>
          <button className="btn btn-outline-dark btn-sm" onClick={onClose} aria-label="Cerrar menú">✕</button>
        </div>

        {/* Usuario */}
        <div className="d-flex align-items-center gap-2 mb-3">
          {session ? (
            <>
              <img
                src={session.avatar || "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png"}
                alt="Usuario"
                className="rounded-circle border"
                style={{ width: 36, height: 36, objectFit: "cover" }}
              />
              <div className="small">
                <div className="fw-semibold text-truncate" style={{ maxWidth: 160 }}>
                  {session.name || session.user || "usuario"}
                </div>
                <div className="text-muted">Sesión activa</div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>👤</div>
              <div className="small text-muted">No has iniciado sesión</div>
            </>
          )}
        </div>

        {/* Navegación */}
        <nav>
          <ul className="list-unstyled mb-3">
            <li><NavLink to="/home" className="mdraw-link" onClick={onClose}>Home</NavLink></li>
            <li><NavLink to="/productos" className="mdraw-link" onClick={onClose}>Productos</NavLink></li>
            <li><NavLink to="/blogs" className="mdraw-link" onClick={onClose}>Blogs</NavLink></li>
            <li><NavLink to="/nosotros" className="mdraw-link" onClick={onClose}>Nosotros</NavLink></li>
            <li><NavLink to="/contacto" className="mdraw-link" onClick={onClose}>Contacto</NavLink></li>
          </ul>
        </nav>

        {/* Acciones */}
        <div className="d-grid gap-2">
          <Link to="/carrito" className="btn btn-dark" onClick={onClose}>
            Carrito <span className="badge bg-light text-dark ms-1">{cartCount}</span> 🛒
          </Link>

          {!session ? (
            <Link to="/login" className="btn btn-outline-primary" onClick={onClose}>
              Iniciar sesión
            </Link>
          ) : (
            <>
              {session.role === "admin" && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => { onClose(); navigate("/admin"); }}
                >
                  Administración
                </button>
              )}
              <button className="btn btn-outline-danger" onClick={() => { onLogout(); onClose(); }}>
                Cerrar sesión
              </button>
            </>
          )}
        </div>
      </aside>
    </>,
    document.body
  );
}

export default function Header() {
  const navigate = useNavigate();

  const readSession = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("stuffies_session") || "null");
    } catch {
      return null;
    }
  }, []);

  const [session, setSession] = useState(() => readSession());
  const [cartCount, setCartCount] = useState(() => getCartTotals().cantidad || 0);

  // Dropdown escritorio
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Drawer móvil
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mantener sesión y carrito sincronizados
  useEffect(() => {
    const refreshSession = () => setSession(readSession());
    const refreshCart = () => setCartCount(getCartTotals().cantidad || 0);

    window.addEventListener("storage", refreshSession);
    window.addEventListener("storage", refreshCart);
    window.addEventListener("focus", refreshSession);
    window.addEventListener("focus", refreshCart);
    window.addEventListener("session:updated", refreshSession);
    window.addEventListener("cart:updated", refreshCart);

    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("storage", refreshCart);
      window.removeEventListener("focus", refreshSession);
      window.removeEventListener("focus", refreshCart);
      window.removeEventListener("session:updated", refreshSession);
      window.removeEventListener("cart:updated", refreshCart);
    };
  }, [readSession]);

  // Cierra el menú (escritorio) al hacer click fuera o presionar ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const onLogout = () => {
    localStorage.removeItem("stuffies_session");
    setSession(null);
    window.dispatchEvent(new Event("session:updated"));
    setMenuOpen(false);
    setDrawerOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="border-bottom bg-white">
        <div className="container d-flex align-items-center justify-content-between py-2">
          {/* Izquierda: botón menú (xs) + logo + marca */}
          <div className="d-flex align-items-center gap-2">
            {/* Hamburger solo en móvil */}
            <button
              className="btn d-inline-flex d-md-none me-1"
              aria-label="Abrir menú"
              aria-controls="mobile-drawer"
              aria-expanded={drawerOpen ? "true" : "false"}
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button>

            <Link to="/" className="d-inline-flex align-items-center">
              <img
                src="https://stuffiesconcept.com/cdn/shop/files/output-onlinegiftools_1.gif?v=1723763811&width=500"
                alt="Logo Stuffies"
                className="logo-gif"
                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: "50%" }}
              />
            </Link>

            <h1 className="m-0 fs-4 fs-md-3" style={{ fontFamily: "'Libre Baskerville', serif" }}>
              <Link to="/" className="text-dark text-decoration-none">STUFFIES</Link>
            </h1>
          </div>

          {/* Centro: Nav (oculto en xs) */}
          <nav className="d-none d-md-block">
            <ul className="nav">
              <li className="nav-item"><NavLink end to="/home" className="nav-link">Home</NavLink></li>
              <li className="nav-item"><NavLink to="/productos" className="nav-link">Productos</NavLink></li>
              <li className="nav-item"><NavLink to="/blogs" className="nav-link">Blogs</NavLink></li>
              <li className="nav-item"><NavLink to="/nosotros" className="nav-link">Nosotros</NavLink></li>
              <li className="nav-item"><NavLink to="/contacto" className="nav-link">Contacto</NavLink></li>
            </ul>
          </nav>

          {/* Derecha: acciones */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Carrito: icono compacto en móvil */}
            <Link to="/carrito" className="text-decoration-none d-inline-flex align-items-center position-relative">
              <span className="d-none d-md-inline me-2">Carrito</span>
              🛒
              <span className="badge bg-dark position-absolute translate-middle top-0 start-100">
                {cartCount}
              </span>
            </Link>

            {/* Avatar / Login */}
            {!session ? (
              <Link to="/login" className="btn btn-outline-primary d-none d-md-inline-flex">Iniciar Sesión</Link>
            ) : (
              <div className="d-none d-md-flex align-items-center gap-2 position-relative" ref={menuRef}>
                <button
                  type="button"
                  className="btn p-0 border-0 bg-transparent"
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? "true" : "false"}
                  onClick={() => setMenuOpen((v) => !v)}
                  title="Cuenta"
                >
                  <img
                    src={
                      session.avatar ||
                      "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png"
                    }
                    alt="Usuario"
                    className="avatar-img rounded-circle shadow-sm border"
                    style={{ width: 38, height: 38, objectFit: "cover" }}
                  />
                </button>

                {/* Nombre visible */}
                <span
                  className="text-dark text-truncate"
                  title={session.name || session.user || "usuario"}
                  style={{ maxWidth: 160 }}
                >
                  {session.name || session.user || "usuario"}
                </span>

                {/* Menú dropdown controlado por React (solo desktop) */}
                <ul
                  className={`dropdown-menu dropdown-menu-end ${menuOpen ? "show" : ""}`}
                  style={{ right: 0, left: "auto", zIndex: 2000 }}
                >
                  <li className="px-3 py-2 small text-muted">
                    Hola, {session.name || session.user || "usuario"}
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/perfil" onClick={() => setMenuOpen(false)}>
                      Perfil
                    </Link>
                  </li>
                  {session.role === "admin" && (
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin");
                        }}
                      >
                        Administración
                      </button>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={onLogout}>
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {/* En móvil, el acceso a cuenta está dentro del drawer */}
          </div>
        </div>
      </header>

      {/* Drawer móvil */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={session}
        cartCount={cartCount}
        onLogout={onLogout}
        navigate={navigate}
      />
    </>
  );
}
