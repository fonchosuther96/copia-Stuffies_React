// src/admin/pages/Ordenes.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../services/orders.js";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Ordenes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();

      // Asegurar que data siempre sea un array
      const list = Array.isArray(data) ? data : [];

      const fixed = list.map((o) => ({
        id: o.id,
        total: o.total ?? 0,
        createdAt: o.createdAt ?? "—",
        status: o.status ?? "Pagado",
        username: o.user?.username ?? "Cliente",
      }));

      setOrders(fixed);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;

  return (
    <div>
      <h2 className="mb-3">Órdenes / Boletas</h2>

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Aún no hay órdenes registradas.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.createdAt}</td>
                  <td>{o.username}</td>
                  <td>{CLP.format(o.total)}</td>
                  <td>{o.status}</td>

                  <td className="text-end">
                    <Link
                      className="btn btn-sm btn-primary"
                      to={`/admin/boleta/${o.id}`}
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
