// src/admin/pages/HistorialCompras.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listOrders } from "../../services/orders.js";   // ahora funciona OK

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function HistorialCompras() {
  const { id } = useParams();  // ID del usuario en la BD
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // Cargar órdenes desde backend
  // ================================
  useEffect(() => {
    async function load() {
      try {
        const all = await listOrders(); // Admin obtiene TODAS las órdenes
        setOrders(all);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ================================
  // Filtrar por user_id
  // ================================
  const rows = useMemo(() => {
    if (!id) return [];
    return orders.filter(o => String(o.user?.id || "") === String(id));
  }, [orders, id]);

  if (loading) return <p>Cargando órdenes...</p>;

  return (
    <div>
      <h2 className="mb-3">Historial de compras</h2>

      <div className="table-responsive">
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Fecha</th>
              <th>Total</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  Este usuario no registra compras.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString("es-CL")
                      : "—"}
                  </td>
                  <td>{CLP.format(o.total || 0)}</td>
                  <td className="text-end">
                    <Link
                      to={`../boleta/${encodeURIComponent(o.id)}`}
                      className="btn btn-sm btn-primary"
                    >
                      Ver boleta
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link to="../usuarios" className="btn btn-outline-light">Volver</Link>
    </div>
  );
}
