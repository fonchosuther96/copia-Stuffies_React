// src/pages/Nosotros.jsx
import { Link } from "react-router-dom";

export default function Nosotros() {
  return (
    <main>
      {/* Hero */}
      <section className="hero py-5">
        <div className="container">
          <h2 className="text-white">Quiénes somos</h2>
          <p className="lead">Tienda Stuffies creada desde 2024.</p>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-4">
        <div className="container">
          <div className="cardx">
            <div className="row g-4 align-items-center">
              <div className="col-md-6">
                <h3>Nuestra historia</h3>
                <p>
                  Stuffies nace en Chile con la idea de ofrecer básicos de calidad y diseño fresco.
                  Inspirados en la cultura urbana, trabajamos colecciones versátiles que combinan
                  comodidad y estilo.
                </p>

                <h4 className="mt-4">Valores</h4>
                <ul>
                  <li>Calidad y detalle en cada prenda</li>
                  <li>Diseño accesible para todos</li>
                  <li>Comunidad y expresión personal</li>
                </ul>
              </div>

              <div className="col-md-6 text-center">
                <img
                  src="https://i.postimg.cc/R0phZ77L/ESTRELLA-BLANCA.png"
                  alt="Stuffies"
                  className="img-fluid"
                />
              </div>
            </div>

            <hr className="my-4" />

            <div className="row g-4">
              <div className="col-md-6">
                <h4>Equipo</h4>
                <ul className="mb-0">
                  <li><strong>Dirección Creativa:</strong> Stuffies Studio</li>
                  <li><strong>Desarrollo Web:</strong> Estudiantes DUOC UC</li>
                  <li><strong>Marketing:</strong> Comunidad Stuffies</li>
                </ul>
              </div>

              <div className="col-md-6">
                <h4>Tecnologías</h4>
                <p className="mb-0">
                  React (con Vite) · React Router DOM · Bootstrap 5 · JavaScript ES6+ · 
                  LocalStorage · CSS personalizado · Node.js (npm scripts)
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Link to="/productos" className="btn btn-primary me-2">Ver productos</Link>
              <Link to="/contacto" className="btn btn-outline-dark">Contáctanos</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
