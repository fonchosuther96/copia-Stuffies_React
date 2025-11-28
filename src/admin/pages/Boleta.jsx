// src/admin/pages/Boleta.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../../services/orders.js";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Boleta() {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const load = () => setOrder(getOrderById(String(id)));
    load();

    // se actualiza si otra vista crea/modifica órdenes
    const onOrdersUpdated = () => load();
    window.addEventListener("orders:updated", onOrdersUpdated);
    return () => window.removeEventListener("orders:updated", onOrdersUpdated);
  }, [id]);

  const totales = useMemo(() => {
    if (!order || !order.totals) return { subtotal: 0, impuestos: 0, total: 0 };
    const { subtotal = 0, impuestos = 0, total = 0 } = order.totals;
    return { subtotal: Number(subtotal), impuestos: Number(impuestos), total: Number(total) };
  }, [order]);

  if (!order) {
    return (
      <div className="alert alert-warning">
        No se encontró la boleta <strong>{id}</strong>.{" "}
        <Link to="../ordenes" className="alert-link">Volver a órdenes</Link>
      </div>
    );
  }

  const fechaStr = order.fechaLocal
    ? order.fechaLocal
    : order.fechaISO
    ? new Date(order.fechaISO).toLocaleString("es-CL")
    : "—";

  const clienteNombre = order.cliente?.nombre || "—";
  const clienteEmail = order.cliente?.email || "—";
  const clienteDir = order.cliente?.direccion || "—";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Boleta / {order.id}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={() => window.print()}>Imprimir</button>
          <Link to="../ordenes" className="btn btn-primary">Volver</Link>
        </div>
      </div>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <h5 className="mb-3">Datos del cliente</h5>
              <p className="m-0"><strong>Nombre:</strong> {clienteNombre}</p>
              <p className="m-0"><strong>Email:</strong> {clienteEmail}</p>
              <p className="m-0"><strong>Dirección:</strong> {clienteDir}</p>
              <p className="m-0"><strong>Fecha:</strong> {fechaStr}</p>
              <p className="m-0"><strong>Estado:</strong> {order.estado || "—"}</p>
            </div>

            <div className="col-md-6">
              <h5 className="mb-3">Detalle</h5>
              <ul className="m-0">
                {(order.items || []).map((it, i) => {
                  const attrs = [it.talla, it.color].filter(Boolean).join(", ");
                  const subtotalItem = Number(it.precio || 0) * Number(it.cantidad || 0);
                  return (
                    <li key={`${it.id}-${i}`}>
                      {it.nombre}
                      {attrs ? ` (${attrs})` : ""} — {CLP.format(Number(it.precio || 0))} × {Number(it.cantidad || 0)} ={" "}
                      <strong>{CLP.format(Number(it.subtotal ?? subtotalItem))}</strong>
                    </li>
                  );
                })}
              </ul>
              <hr />
              <p className="m-0"><strong>Subtotal:</strong> {CLP.format(totales.subtotal)}</p>
              <p className="m-0"><strong>Impuestos:</strong> {CLP.format(totales.impuestos)}</p>
              <p className="m-0"><strong>Total:</strong> {CLP.format(totales.total)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
