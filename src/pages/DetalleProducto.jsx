// src/pages/DetalleProducto.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLiveById, getStockPorTalla } from "../services/inventory.js";
import { addToCart } from "../services/cart.js";

const CLP = new Intl.NumberFormat("es-CL");

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
  const numericId = Number(id);

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [stockPorTalla, setStockPorTalla] = useState({});

  // =========================
  // CARGAR PRODUCTO
  // =========================
  useEffect(() => {
    if (!numericId || Number.isNaN(numericId)) return;

    window.scrollTo({ top: 0, behavior: "auto" });

    const cargarProducto = async () => {
      setLoading(true);

      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://174.129.52.156:8080";

        const resp = await fetch(`${baseUrl}/api/products/${numericId}`);

        if (!resp.ok) throw new Error("Producto no encontrado");

        const data = await resp.json();

        const tallasNormalizadas = Array.isArray(data.tallas)
          ? data.tallas
          : typeof data.tallas === "string"
          ? data.tallas.split(",").map((t) => t.trim()).filter(Boolean)
          : [];

        const normalizado = {
          ...data,
          imagen: resolveImagen(data),
          tallas: tallasNormalizadas,
        };

        setProducto(normalizado);
        setLoading(false);
        return;
      } catch (e) {
        console.warn("Fallo API, usando inventario local:", e);
      }

      const local = getLiveById(numericId);
      setProducto(local ? { ...local, imagen: resolveImagen(local) } : null);
      setLoading(false);
    };

    cargarProducto();
  }, [numericId]);

  // =========================
  // STOCK POR TALLA
  // =========================
  useEffect(() => {
    if (!producto || !producto.id) return;

    // ✅ PRIORIDAD: usar variants del backend
    if (Array.isArray(producto.variants) && producto.variants.length > 0) {
      const stock = {};
      producto.variants.forEach((v) => {
        stock[v.talla] = v.stock;
      });
      setStockPorTalla(stock);
      return;
    }

    // 🔁 Fallback: endpoint /variants
    const obtenerStock = async () => {
      try {
        const stock = await getStockPorTalla(producto.id);
        setStockPorTalla(stock || {});
      } catch (e) {
        console.error("Error al obtener stock por talla:", e);
        setStockPorTalla({});
      }
    };

    obtenerStock();
  }, [producto]);

  // =========================
  // DERIVADOS
  // =========================
  const totalStock = useMemo(() => {
    if (typeof producto?.stock === "number") return producto.stock;
    return Object.values(stockPorTalla).reduce((a, b) => a + (b || 0), 0);
  }, [producto, stockPorTalla]);

  const sinStock = totalStock <= 0;

  const tallasDisponibles = useMemo(() => {
    if (producto?.tallas?.length) return producto.tallas;
    return Object.keys(stockPorTalla);
  }, [producto, stockPorTalla]);

  useEffect(() => {
    if (tallasDisponibles.length && !tallaSeleccionada) {
      setTallaSeleccionada(tallasDisponibles[0]);
    }
  }, [tallasDisponibles, tallaSeleccionada]);

  const onAddToCart = () => {
    if (!producto || sinStock) return;

    addToCart(
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: resolveImagen(producto),
      },
      {
        talla: tallaSeleccionada || "Única",
        color: colorSeleccionado || "Único",
        cantidad: 1,
      }
    );
  };

  // =========================
  // RENDER
  // =========================
  if (loading) {
    return (
      <main className="detalle-page py-5 text-light text-center">
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="detalle-page py-5 text-light text-center">
        <h2>Producto no encontrado</h2>
        <Link to="/productos" className="btn btn-outline-light mt-3">
          Volver a productos
        </Link>
      </main>
    );
  }

  return (
    <main className="detalle-page py-5 text-light">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-6">
            <img
              src={resolveImagen(producto)}
              alt={producto.nombre}
              className="w-100 rounded"
              onError={(e) => (e.currentTarget.src = "/img/product-placeholder.png")}
            />
          </div>

          <div className="col-md-6">
            <h1 className="h3">{producto.nombre}</h1>
            <p className="text-secondary">{producto.descripcion}</p>
            <p className="fs-4">${CLP.format(producto.precio || 0)}</p>

            {tallasDisponibles.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Talla</label>
                <div className="d-flex gap-2 flex-wrap">
                  {tallasDisponibles.map((t) => (
                    <button
                      key={t}
                      className={`btn btn-sm ${t === tallaSeleccionada ? "btn-primary" : "btn-outline-light"}`}
                      disabled={stockPorTalla[t] <= 0}
                      onClick={() => setTallaSeleccionada(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-primary flex-fill"
                disabled={sinStock}
                onClick={onAddToCart}
              >
                {sinStock ? "Sin stock" : "Añadir al carrito"}
              </button>

              <Link to="/productos" className="btn btn-outline-light flex-fill">
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
