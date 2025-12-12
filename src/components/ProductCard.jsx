// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { getTotalStock } from "../services/inventory.js";
import { addToCart } from "../services/cart.js";
import { useState, useEffect, useMemo } from "react";

const CLP = new Intl.NumberFormat("es-CL");

// fallback
const FALLBACK_IMG = "/img/placeholder-producto.png";

export default function ProductCard({ product }) {
  const stockTotal = getTotalStock(product.id);
  const sinStock = stockTotal <= 0;

  const baseImg = useMemo(() => {
    const p = product || {};
    return (
      p.imagen ||
      p.imageUrl ||
      (Array.isArray(p.galeria) && p.galeria[0]) ||
      (Array.isArray(p.imagenes) && p.imagenes[0]) ||
      p.img ||
      FALLBACK_IMG
    );
  }, [product]);

  const hoverImg = useMemo(() => {
    const p = product || {};
    return (
      p.imagenHover ||
      (Array.isArray(p.galeria) && p.galeria[1]) ||
      (Array.isArray(p.imagenes) && p.imagenes[1]) ||
      null
    );
  }, [product]);

  const [img, setImg] = useState(baseImg);

  const primeraTalla = (product.tallas && product.tallas[0]) || "Única";
  const primerColor = (product.colores && product.colores[0]) || "Único";

  const onAdd = () => {
    if (sinStock) return;

    addToCart({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: baseImg,
      cantidad: 1,
      talla: primeraTalla,
      color: primerColor,
    });

    window.dispatchEvent(new Event("cart:updated"));
  };

  useEffect(() => {
    setImg(baseImg);
    if (hoverImg) {
      const i = new Image();
      i.src = hoverImg;
    }
  }, [baseImg, hoverImg]);

  return (
    <div className="card product-card h-100">
      <div className="ratio ratio-1x1 overflow-hidden">
        <Link to={`/detalle-producto/${product.id}`}>
          <img
            src={img}
            alt={product.nombre}
            className="card-img-top object-fit-cover"
            onMouseEnter={() => hoverImg && setImg(hoverImg)}
            onMouseLeave={() => setImg(baseImg)}
            onError={() => setImg(FALLBACK_IMG)}
          />
        </Link>
      </div>

      <div className="card-body d-flex flex-column text-center">
        <Link
          to={`/detalle-producto/${product.id}`}
          className="text-decoration-none text-reset"
        >
          <h6 className="card-title text-light">{product.nombre}</h6>
        </Link>

        <p className="card-text mb-2">${CLP.format(product.precio)}</p>

        <span
          className={`badge ${
            sinStock ? "text-bg-danger" : "text-bg-secondary"
          } mb-2`}
        >
          {sinStock ? "Agotado" : `Stock: ${stockTotal}`}
        </span>

        <div className="mt-auto d-flex flex-column gap-2">
          <Link to={`/detalle-producto/${product.id}`} className="btn btn-outline-light w-100">
            Ver detalle
          </Link>

          <button
            className="btn btn-primary w-100"
            onClick={onAdd}
            disabled={sinStock}
            style={sinStock ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            {sinStock ? "Sin stock" : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}
