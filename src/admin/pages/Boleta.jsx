// src/admin/pages/Boleta.jsx
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (e) {
        console.error("Error cargando boleta:", e);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Cargando boleta...</p>;

  if (!order) {
    return (
      <div className="alert alert-warning">
        No se encontró la boleta <strong>{id}</strong>.{" "}
        <Link to="../ordenes" className="alert-link">Volver a órdenes</Link>
      </div>
    );
  }

  // Cliente
  const clienteNombre = order.user?.username || "Cliente invitado";
  const clienteEmail = "—";    // tu backend no lo envía
  const clienteDir = "—";      // tampoco envía dirección
  const fechaStr = "—";        // no tienes fecha en BD
  const estado = "Pagado";     // ya que no guardas estado

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Boleta / {order.id}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={() => window.print()}>
            Imprimir
          </button>
          <Link to="../ordenes" className="btn btn-primary">Volver</Link>
        </div>
      </div>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <div className="row g-3">

            {/* DATOS DEL CLIENTE */}
            <div className="col-md-6">
              <h5 className="mb-3">Datos del cliente</h5>

              <p className="m-0"><strong>Nombre:</strong> {clienteNombre}</p>
              <p className="m-0"><strong>Email:</strong> {clienteEmail}</p>
              <p className="m-0"><strong>Dirección:</strong> {clienteDir}</p>
              <p className="m-0"><strong>Fecha:</strong> {fechaStr}</p>
              <p className="m-0"><strong>Estado:</strong> {estado}</p>
            </div>

            {/* DETALLE DE PRODUCTOS */}
            <div className="col-md-6">
              <h5 className="mb-3">Detalle</h5>
              <ul className="m-0">
                {(order.items || []).map((it, i) => {
                  const nombre = it.product?.nombre || "Producto";
                  const subtotal = Number(it.precio) * Number(it.cantidad);

                  return (
                    <li key={`${it.id}-${i}`}>
                      {nombre} — {CLP.format(it.precio)} × {it.cantidad} ={" "}
                      <strong>{CLP.format(subtotal)}</strong>
                    </li>
                  );
                })}
              </ul>

              <hr />
              <p className="m-0">
                <strong>Total:</strong> {CLP.format(order.total || 0)}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
