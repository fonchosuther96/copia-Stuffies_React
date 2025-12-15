// src/admin/pages/ProductosCriticos.jsx
import { useEffect, useState } from "react";
import api from "../../api";

const WARNING_THRESHOLD = 50; // amarillo
const DANGER_THRESHOLD = 40;  // rojo

export default function ProductosCriticos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCriticos = async () => {
      try {
        setLoading(true);
        setError("");

        // Traemos todos los productos con sus variants desde el backend
        const res = await api.get("/api/products");
        const productos = Array.isArray(res.data) ? res.data : [];

        const criticos = [];

        productos.forEach((p) => {
          const variants = Array.isArray(p.variants) ? p.variants : [];

          variants.forEach((v) => {
            const stock = Number(v.stock ?? 0);
            // Solo mostramos variantes con stock bajo 50
            if (stock < WARNING_THRESHOLD) {
              criticos.push({
                productId: p.id,
                nombre: p.nombre,
                talla: v.talla || v.size || "Única",
                stock,
              });
            }
          });
        });

        setItems(criticos);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos críticos.");
      } finally {
        setLoading(false);
      }
    };

    loadCriticos();
  }, []);

  const getBadgeClass = (stock) => {
    if (stock < DANGER_THRESHOLD) return "bg-danger"; // rojo < 40
    if (stock < WARNING_THRESHOLD) return "bg-warning text-dark"; // amarillo < 50
    return "bg-secondary";
  };

  if (loading) {
    return (
      <div>
        <h2 className="mb-3">Listado de productos críticos</h2>
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Listado de productos críticos</h2>

      {error && (
        <div className="alert alert-danger py-2 mb-3">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-muted">No hay productos críticos por ahora.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {items.map((p) => (
            <li
              key={`${p.productId}-${p.talla}`}
              className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center"
            >
              <span>
                #{p.productId} — {p.nombre}{" "}
                <span className="badge bg-secondary ms-2">
                  Talla: {p.talla}
                </span>
              </span>
              <span className={`badge ${getBadgeClass(p.stock)}`}>
                Stock: {p.stock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
