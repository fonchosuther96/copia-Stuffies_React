// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { getTotalStock } from "../services/inventory.js";
import { addToCart } from "../services/cart.js";
import { useState, useEffect, useMemo } from "react";

const CLP = new Intl.NumberFormat("es-CL");

export default function ProductCard({ product }) {
  const stockTotal = getTotalStock(product.id);
  const sinStock = stockTotal <= 0;

  // === Nuevo: intenta encontrar una imagen "hover" en distintos campos ===
  const hoverImg = useMemo(() => {
    const p = product || {};
    return (
      p.imagenHover ||
      p.hover ||
      (Array.isArray(p.galeria) && p.galeria[1]) ||
      (Array.isArray(p.imagenes) && p.imagenes[1]) ||
      p.imagen2 ||
      p.imgHover ||
      p.img2 ||
      null
    );
  }, [product]);

  const [img, setImg] = useState(product.imagen);

  const primeraTalla = (product.tallas && product.tallas[0]) || "Única";
  const primerColor  = (product.colores && product.colores[0]) || "Único";

  const onAdd = () => {
    if (sinStock) return;
    const res = addToCart({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      cantidad: 1,
      talla: primeraTalla,
      color: primerColor,
    });
    window.dispatchEvent(new Event("cart:updated"));
    alert(`Añadido al carrito. Ítems: ${res.cantidad}`);
  };

  // Reset + precarga del hover cuando cambia el producto
  useEffect(() => {
    setImg(product.imagen);
    if (hoverImg) {
      const i = new Image();
      i.src = hoverImg; // precarga
    }
  }, [product, hoverImg]);

  return (
    <div className="card product-card h-100">
      <div className="ratio ratio-1x1 overflow-hidden">
        <Link
          to={`/detalle-producto/${product.id}`}
          className="text-decoration-none text-reset"
        >
          <img
            src={img}
            alt={product.nombre}
            className="card-img-top object-fit-cover"
            style={{ transition: "transform 0.3s ease, opacity 0.3s ease" }}
            // handlers en la imagen
            onMouseEnter={() => hoverImg && setImg(hoverImg)}
            onMouseLeave={() => setImg(product.imagen)}
            onError={() => setImg(product.imagen)} // si falla el hover, vuelve a la base
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
          } align-self-center mb-2`}
        >
          {sinStock ? "Agotado" : `Stock: ${stockTotal}`}
        </span>

        <div className="mt-auto d-flex flex-column gap-2">
          <Link
            to={`/detalle-producto/${product.id}`}
            className="btn btn-outline-light w-100"
          >
            Ver detalle
          </Link>
          <button
            className="btn btn-primary w-100"
            onClick={onAdd}
            disabled={sinStock}
            aria-disabled={sinStock}
            title={sinStock ? "Sin stock disponible" : "Añadir al carrito"}
            style={
              sinStock ? { opacity: 0.6, cursor: "not-allowed" } : undefined
            }
          >
            {sinStock ? "Sin stock" : "Añadir"}
          </button>
        </div>
      </div>
    </div>
  );
}
