// src/pages/Home.jsx
import React, { memo, useEffect } from "react";
import { Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/styles.css";

import { productos } from "../services/productos.js";
import ProductCard from "../components/ProductCard.jsx";

/* ---------- ErrorBoundary por tarjeta ---------- */
class CardBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, errorMsg: err?.message || "Error renderizando la tarjeta" };
  }
  componentDidCatch(error, info) {
    console.error("Error en ProductCard:", error, info);
  }
  render() {
    if (this.state.hasError) {
      const p = this.props.product;
      return (
        <div className="card h-100 border-danger">
          <div className="ratio ratio-1x1">
            <img
              className="card-img-top object-fit-cover"
              src={p.imagen}
              alt={p.nombre}
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/500x500?text=Imagen+no+disponible";
              }}
            />
          </div>
          <div className="card-body d-flex flex-column">
            <h6 className="card-title mb-2">{p.nombre}</h6>
            <div className="mb-2 fw-semibold">
              ${new Intl.NumberFormat("es-CL").format(p.precio)}
            </div>
            <div className="alert alert-danger p-2 m-0">
              {this.state.errorMsg || "No se pudo cargar la tarjeta."}
            </div>
            <div className="mt-3 d-flex gap-2">
              <Link to={`/detalle-producto/${p.id}`} className="btn btn-outline-dark btn-sm w-100">
                Ver detalles
              </Link>
              <Link to="/productos" className="btn btn-dark btn-sm w-100">
                Comprar
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Tarjeta simple (fallback manual opcional) ---------- */
const SimpleCard = memo(function SimpleCard({ p }) {
  return (
    <div className="card h-100">
      <div className="ratio ratio-1x1">
        <img
          src={p.imagen}
          alt={p.nombre}
          className="card-img-top object-fit-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/500x500?text=Imagen+no+disponible";
          }}
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-2">{p.nombre}</h6>
        <div className="mb-3 fw-semibold">
          ${new Intl.NumberFormat("es-CL").format(p.precio)}
        </div>
        <div className="mt-auto d-flex gap-2">
          <Link to={`/detalle-producto/${p.id}`} className="btn btn-outline-dark btn-sm w-100">
            Ver detalles
          </Link>
          <Link to="/productos" className="btn btn-primary btn-sm w-100">
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
});

export default function Home() {
  // Debug: confirmar si Home se monta
  useEffect(() => {
    console.log("[HOME] montado ✅");
  }, []);

  const destacados = productos.filter((p) => p.destacado);

  // 1) DEBUG: ver si algún destacado no tiene id
  useEffect(() => {
    console.table(destacados.map(p => ({ id: p?.id, nombre: p?.nombre })));
  }, [destacados]);

  // 2) Evitar renderizar items sin id (evita /detalle-producto/undefined)
  const destacadosConId = destacados.filter(p => p?.id != null);

  // Al montar, subir al inicio
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero d-flex align-items-center text-white">
        <div className="container">
          <div className="hero-content text-center">
            <h2 className="display-5 fw-bold mb-3">ROPA URBANA CON ESTILO</h2>
            <p className="mb-4">
              Descubre nuestra colección de poleras, polerones, jeans y accesorios con
              estilo estadounidense
            </p>
            <Link to="/productos" className="btn btn-primary btn-lg">
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      {/* Carousel */}
      <section className="carousel-section py-4">
        <div className="container">
          <div
            id="stuffiesCarousel"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3000"
            data-bs-pause="false"
            data-bs-touch="true"
          >
            <div className="carousel-indicators">
              <button
                type="button"
                data-bs-target="#stuffiesCarousel"
                data-bs-slide-to="0"
                className="active"
                aria-current="true"
                aria-label="Slide 1"
              ></button>
              <button
                type="button"
                data-bs-target="#stuffiesCarousel"
                data-bs-slide-to="1"
                aria-label="Slide 2"
              ></button>
              <button
                type="button"
                data-bs-target="#stuffiesCarousel"
                data-bs-slide-to="2"
                aria-label="Slide 3"
              ></button>
            </div>

            <div className="carousel-inner rounded-4 overflow-hidden">
              <div className="carousel-item active">
                <img
                  src="https://i.postimg.cc/J45FXPsm/santia-Asco.png"
                  className="d-block w-100"
                  alt="Promo 1"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Promoción de Poleras</h5>
                  <p>Descubre nuestras poleras urbanas con estilo único.</p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src="https://i.postimg.cc/GpVgRf5P/IMG-1164.jpg"
                  className="d-block w-100"
                  alt="Promo 2"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Polerones Exclusivos</h5>
                  <p>La comodidad y estilo que estabas buscando.</p>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  src="https://i.postimg.cc/ht451Tmm/476928810-17887865937208902-5206449320773511412-n.jpg"
                  className="d-block w-100"
                  alt="Promo 3"
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>Accesorios Urbanos</h5>
                  <p>Complementa tu outfit con los mejores accesorios.</p>
                </div>
              </div>
            </div>

            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#stuffiesCarousel"
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Anterior</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#stuffiesCarousel"
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Siguiente</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3) Productos destacados — zIndex para asegurar clics */}
      <section className="featured-products" style={{ position: "relative", zIndex: 5 }}>
        <div className="container">
          <h2>Productos Destacados</h2>
          <div className="row g-4">
            {destacadosConId.map((p) => (
              <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                {/* Si alguna tarjeta tira error, no rompe el grid */}
                <CardBoundary product={p}>
                  <ProductCard product={p} />
                </CardBoundary>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
