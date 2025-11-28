// src/components/Footer.jsx
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ show: false, type: "success", text: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = email.trim();

    // Validación básica de email
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) {
      setMsg({ show: true, type: "danger", text: "Ingresa un correo válido." });
      return;
    }

    // Simula envío (sin almacenar nada)
    setMsg({
      show: true,
      type: "success",
      text: `¡Gracias por suscribirte, ${value}!`,
    });
    setEmail("");
  };

  return (
    <footer className="footer-dark py-5">
      <div className="container">
        <div className="row gy-4">
          {/* Logo y descripción */}
          <div className="col-md-4 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-3">
              <img
                src="https://i.postimg.cc/R0phZ77L/ESTRELLA-BLANCA.png"
                alt="Logo Stuffies"
                className="footer-logo me-2"
              />
              <h3 className="m-0 text-white">STUFFIES</h3>
            </div>
            <p className="text-light small">
              Tienda online de ropa urbana y casual en Chile.
            </p>
          </div>

          {/* Enlaces */}
          <div className="col-md-4 text-center">
            <h5 className="text-white mb-3">Enlaces</h5>
            <ul className="list-unstyled mb-0">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/productos" className="text-light text-decoration-none">Productos</a></li>
              <li><a href="/blogs" className="text-light text-decoration-none">Blogs</a></li>
              <li><a href="/nosotros" className="text-light text-decoration-none">Nosotros</a></li>
              <li><a href="/contacto" className="text-light text-decoration-none">Contacto</a></li>
            </ul>
          </div>

          {/* Suscripción */}
          <div className="col-md-4 text-center text-md-end">
            <h5 className="text-white mb-3">Suscríbete</h5>

            <form
              className="d-flex justify-content-center justify-content-md-end"
              onSubmit={handleSubmit}
              noValidate
            >
              <input
                type="email"
                placeholder="Ingresa tu email"
                className="form-control me-2 w-auto footer-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-light footer-btn">
                Suscribirse
              </button>
            </form>

            {msg.show && (
              <div className={`alert alert-${msg.type} mt-3 py-2 px-3`} role="alert">
                {msg.text}
              </div>
            )}
          </div>
        </div>

        {/* Línea inferior */}
        <div className="footer-bottom text-center mt-4 pt-3 border-top border-secondary">
          <small className="text-light">
            © 2025 Stuffies. Todos los derechos reservados.
          </small>
        </div>
      </div>
    </footer>
  );
}
