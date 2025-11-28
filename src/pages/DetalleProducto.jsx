// src/pages/DetalleProducto.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLiveById, getStockPorTalla } from "../services/inventory.js";
import { addToCart } from "../services/cart.js";

export default function DetalleProducto() {
  const { id } = useParams();
  const producto = useMemo(() => getLiveById(id), [id]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, []);

  if (!producto) {
    return (
      <main className="detalle-page">
        <div className="container py-5 text-center text-light">
          <h2>Producto no encontrado</h2>
          <Link to="/productos" className="btn btn-outline-light mt-3">Volver a productos</Link>
        </div>
      </main>
    );
  }

  const [imgSrc, setImgSrc] = useState(producto.imagen);
  const [talla, setTalla] = useState(
    Array.isArray(producto.tallas) && producto.tallas.length ? String(producto.tallas[0]) : "Única"
  );
  const colorDefault = (producto.colores && producto.colores[0]) || "Único";

  const stockMap = getStockPorTalla(producto.id) || {};
  const stockTalla = Number(stockMap[talla] || 0);
  const sinStockTalla = stockTalla <= 0;

  const onAdd = () => {
    if (sinStockTalla) {
      alert("No hay stock en esta talla");
      return;
    }
    try {
      const res = addToCart({ id: producto.id, talla, color: colorDefault, cantidad: 1 });
      alert(`Añadido. Total: ${res.totalCLP} (${res.cantidad} ítems)`);
    } catch (err) {
      alert(err?.message || "No se pudo añadir al carrito");
    }
  };

  return (
    <main className="detalle-page">
      <div className="container py-5 text-light">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-md-6">
            <img
              src={imgSrc}
              alt={producto.nombre}
              className="img-fluid rounded shadow"
              onMouseOver={() => producto.imagenHover && setImgSrc(producto.imagenHover)}
              onMouseOut={() => setImgSrc(producto.imagen)}
              onError={e => { e.currentTarget.src = "https://via.placeholder.com/800x800?text=Imagen+no+disponible"; }}
            />
          </div>

          <div className="col-12 col-md-6">
            <h2 className="fw-bold mb-2">{producto.nombre}</h2>
            <p className="mb-3">{producto.descripcion}</p>
            <div className="h4 fw-bold mb-3">
              ${new Intl.NumberFormat("es-CL").format(producto.precio)}
            </div>

            {producto.tallas?.length > 0 && (
              <div className="mb-3">
                <label className="form-label me-2">Talla</label>
                <select
                  className="form-select w-auto d-inline-block"
                  value={talla}
                  onChange={(e) => setTalla(e.target.value)}
                >
                  {producto.tallas.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <small className={`d-block mt-2 ${sinStockTalla ? "text-danger" : "text-success"}`}>
                  {sinStockTalla ? "Sin stock" : `Stock disponible: ${stockTalla}`}
                </small>
              </div>
            )}

            {producto.colores?.length > 0 && (
              <div className="mb-3">
                <span className="me-2">Color:</span>
                {producto.colores.map((c) => <span key={c} className="badge bg-secondary me-2">{c}</span>)}
              </div>
            )}

            <div className="d-flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={onAdd} disabled={sinStockTalla}>
                {sinStockTalla ? "Sin stock" : "Añadir al carrito"}
              </button>
              <Link to="/productos" className="btn btn-outline-light">Volver</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
