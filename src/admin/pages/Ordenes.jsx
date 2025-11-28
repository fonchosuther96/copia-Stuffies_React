// src/admin/pages/Ordenes.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders } from "../../services/orders.js";

const STORAGE_KEY = "stuffies_orders_v1";
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Ordenes() {
  const [orders, setOrders] = useState([]);

  // Cargar y escuchar cambios en órdenes (storage + evento custom)
  useEffect(() => {
    const load = () => setOrders(listOrders());
    load();

    const onStorage = (e) => {
      // reaccionar si cambia la key de órdenes o si se limpia todo
      if (!e || e.key === null || e.key === STORAGE_KEY) load();
    };
    const onOrdersUpdated = () => load(); // lo dispara saveAll() en orders.js

    window.addEventListener("storage", onStorage);
    window.addEventListener("orders:updated", onOrdersUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("orders:updated", onOrdersUpdated);
    };
  }, []);

  // Ya viene ordenado por listOrders(); dejamos memo por compatibilidad
  const rows = useMemo(() => [...orders], [orders]);

  const badgeClass = (estado = "") => {
    const e = (estado || "").toLowerCase();
    if (e.includes("pag")) return "bg-success";                 // Pagado
    if (e.includes("env")) return "bg-info";                    // Enviado
    if (e.includes("pend") || e.includes("proc")) return "bg-warning text-dark"; // Pendiente/Procesando
    if (e.includes("canc") || e.includes("err") || e.includes("rech")) return "bg-danger";
    return "bg-secondary";
  };

  const fmtFecha = (o) =>
    o.fechaLocal || (o.fechaISO ? new Date(o.fechaISO).toLocaleString("es-CL") : "—");

  const fmtCliente = (o) =>
    o.cliente?.nombre || o.cliente?.name || o.cliente || "—";

  const fmtTotal = (o) =>
    CLP.format(Number(o.totals?.total ?? o.total ?? 0));

  return (
    <div>
      <h2 className="mb-3">Órdenes / Boletas</h2>

      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-secondary py-4">
                Aún no hay órdenes registradas.
              </td>
            </tr>
          ) : (
            rows.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{fmtFecha(o)}</td>
                <td>{fmtCliente(o)}</td>
                <td>{fmtTotal(o)}</td>
                <td>
                  <span className={`badge ${badgeClass(o.estado)}`}>
                    {o.estado || "—"}
                  </span>
                </td>
                <td className="text-end">
                  <Link
                    to={`../boleta/${encodeURIComponent(o.id)}`}
                    className="btn btn-sm btn-primary"
                  >
                    Mostrar boleta
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
