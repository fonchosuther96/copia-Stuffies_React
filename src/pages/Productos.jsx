// src/pages/DetalleProducto.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLiveById, getStockPorTalla } from "../services/inventory.js";
import { addToCart } from "../services/cart.js";

const CLP = new Intl.NumberFormat("es-CL");

// Helper para resolver la URL de la imagen desde distintos campos
function resolveImagen(producto) {
  if (!producto) return "/img/product-placeholder.png";

  return (
    producto.imagen ||
    producto.imageUrl ||
    producto.imagenUrl ||
    (Array.isArray(producto.imagenes) && producto.imagenes[0]) ||
    (Array.isArray(producto.galeria) && producto.galeria[0]) ||
    "/img/product-placeholder.png"
  );
}

export default function DetalleProducto() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("");

  // Cargar producto: primero intenta API, si no, inventario local
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    async function cargarProducto() {
      setLoading(true);

      // 1) Intentar backend Spring Boot
      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const resp = await fetch(`${baseUrl}/api/products/${id}`);

        if (resp.ok) {
          const data = await resp.json();
          const normalizado = {
            ...data,
            // Normalizamos el campo de imagen al que usa el frontend
            imagen: resolveImagen(data),
          };
          setProducto(normalizado);
          setLoading(false);
          return;
        }
      } catch (e) {
        // Ignoramos el error y probamos con inventario local
        console.warn("No se pudo obtener el producto desde la API:", e);
      }

      // 2) Fallback: inventario local (productos.js + localStorage)
      const local = getLiveById(id);
      if (local) {
        setProducto({
          ...local,
          imagen: resolveImagen(local),
        });
      } else {
        setProducto(null);
      }
      setLoading(false);
    }

    cargarProducto();
  }, [id]);

  // Stock por talla (del inventario local)
  const stockPorTalla = useMemo(() => {
    if (!producto) return {};
    try {
      return getStockPorTalla(producto.id) || {};
    } catch {
      return {};
    }
  }, [producto]);

  const totalStock = useMemo(
    () =>
      Object.values(stockPorTalla).reduce(
        (acc, v) => acc + (typeof v === "number" ? v : 0),
        0
      ),
    [stockPorTalla]
  );

  const sinStock = !producto || totalStock <= 0;

  // Tallas y colores
  const tallasDisponibles =
    (producto && producto.tallas && producto.tallas.length > 0
      ? producto.tallas
      : Object.keys(stockPorTalla)) || [];

  const coloresDisponibles =
    (producto && producto.colores && producto.colores.length > 0
      ? producto.colores
      : []) || [];

  useEffect(() => {
    if (tallasDisponibles.length > 0 && !tallaSeleccionada) {
      setTallaSeleccionada(tallasDisponibles[0]);
    }
  }, [tallasDisponibles, tallaSeleccionada]);

  useEffect(() => {
    if (coloresDisponibles.length > 0 && !colorSeleccionado) {
      setColorSeleccionado(coloresDisponibles[0]);
    }
  }, [coloresDisponibles, colorSeleccionado]);

  const onAddToCart = () => {
    if (!producto || sinStock) return;

    const res = addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: resolveImagen(producto),
      cantidad: 1,
      talla: tallaSeleccionada || "Única",
      color: colorSeleccionado || "Único",
    });

    window.dispatchEvent(new Event("cart:updated"));
    alert(`Añadido al carrito. Ítems en carrito: ${res.cantidad}`);
  };

  // =======================
  // RENDER
  // =======================

  if (loading) {
    return (
      <main className="detalle-page py-5 text-light">
        <div className="container text-center">
          <p>Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="detalle-page py-5 text-light">
        <div className="container text-center">
          <h2 className="mb-3">Producto no encontrado</h2>
          <Link to="/productos" className="btn btn-outline-light">
            Volver a productos
          </Link>
        </div>
      </main>
    );
  }

  const img = resolveImagen(producto);

  return (
    <main className="detalle-page py-5 text-light">
      <div className="container">
        <div className="row g-4">
          {/* Imagen */}
          <div className="col-md-6">
            <div className="ratio ratio-1x1 bg-dark-subtle rounded-3 overflow-hidden">
              <img
                src={img}
                alt={producto.nombre}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.currentTarget.src = "/img/product-placeholder.png";
                }}
              />
            </div>
          </div>

          {/* Info producto */}
          <div className="col-md-6 d-flex flex-column">
            <h1 className="h3 mb-3">{producto.nombre}</h1>

            {producto.descripcion && (
              <p className="mb-3 text-secondary">{producto.descripcion}</p>
            )}

            <p className="fs-4 fw-semibold mb-3">
              ${CLP.format(producto.precio || 0)}
            </p>

            {/* Stock */}
            <p className="mb-3">
              {sinStock ? (
                <span className="badge text-bg-danger">Sin stock</span>
              ) : (
                <span className="badge text-bg-secondary">
                  Stock total: {totalStock}
                </span>
              )}
            </p>

            {/* Selector de talla */}
            {tallasDisponibles.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Talla</label>
                <div className="d-flex flex-wrap gap-2">
                  {tallasDisponibles.map((t) => {
                    const stockTalla = stockPorTalla[t] ?? 0;
                    const agotada = stockTalla <= 0;

                    return (
                      <button
                        key={t}
                        type="button"
                        className={`btn btn-sm ${
                          t === tallaSeleccionada
                            ? "btn-primary"
                            : "btn-outline-light"
                        }`}
                        disabled={agotada}
                        onClick={() => setTallaSeleccionada(t)}
                      >
                        {t} {agotada ? "(Agotada)" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de color */}
            {coloresDisponibles.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Color</label>
                <div className="d-flex flex-wrap gap-2">
                  {coloresDisponibles.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn btn-sm ${
                        c === colorSeleccionado
                          ? "btn-primary"
                          : "btn-outline-light"
                      }`}
                      onClick={() => setColorSeleccionado(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="mt-auto d-flex flex-column flex-sm-row gap-2 pt-3">
              <button
                className="btn btn-primary flex-fill"
                disabled={sinStock}
                onClick={onAddToCart}
              >
                {sinStock ? "Sin stock" : "Añadir al carrito"}
              </button>

              <Link
                to="/productos"
                className="btn btn-outline-light flex-fill"
              >
                Volver a productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
