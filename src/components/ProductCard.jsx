// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

const CLP = new Intl.NumberFormat("es-CL");
const FALLBACK_IMG = "/img/placeholder-producto.png";

export default function ProductCard({ product }) {
  // Calcular el stock total por cada talla
  const stockTotal = product.variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
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

  // Lógica para obtener la primera talla de las tallas disponibles
  const primeraTalla = (product.tallas && typeof product.tallas === 'string' ? product.tallas.split(",")[0] : "Única");

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

        <div className="mt-auto d-flex flex-column gap-2">
          <Link
            to={`/detalle-producto/${product.id}`}
            className="btn btn-outline-light w-100"
          >
            Ver detalle
          </Link>
        </div>
      </div>
    </div>
  );
}
