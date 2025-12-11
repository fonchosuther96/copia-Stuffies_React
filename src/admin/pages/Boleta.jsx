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

  // Datos del cliente (preferencia: datos del checkout → usuario)
  const nombreFinal =
    order.clienteNombre || order.user?.nombre || "(no informado)";

  const emailFinal =
    order.clienteEmail || order.user?.email || "(no informado)";

  const direccionFinal =
    order.clienteDireccion || order.user?.direccion || "(no informado)";

  const telefonoFinal =
    order.clienteTelefono || order.user?.telefono || "(no informado)";

  const fechaStr = order.fechaCreacion
    ? new Date(order.fechaCreacion).toLocaleString("es-CL")
    : "(sin fecha)";

  return (
    <div>
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Boleta / {order.id}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-light" onClick={() => window.print()}>
            Imprimir
          </button>
          <Link to="../ordenes" className="btn btn-primary">Volver</Link>
        </div>
      </div>

      {/* CARD CONTENEDORA */}
      <div className="card bg-dark border-light">
        <div className="card-body">
          <div className="row g-3">

            {/* DATOS DEL CLIENTE */}
            <div className="col-md-6">
              <h5 className="mb-3">Datos del cliente</h5>

              <p><strong>Nombre:</strong> {nombreFinal}</p>
              <p><strong>Email:</strong> {emailFinal}</p>
              <p><strong>Dirección:</strong> {direccionFinal}</p>
              <p><strong>Teléfono:</strong> {telefonoFinal}</p>
              <p><strong>Fecha:</strong> {fechaStr}</p>
              <p><strong>Estado:</strong> {order.estado}</p>
              <p><strong>Medio de pago:</strong> {order.medioPago}</p>
            </div>

            {/* DETALLE DE PRODUCTOS */}
            <div className="col-md-6">
              <h5 className="mb-3">Detalle</h5>

              <ul className="m-0">
                {(order.items || []).map((it, i) => {
                  const nombreProducto =
                    it.product?.nombre ||
                    it.nombre ||
                    "Producto";

                  const subtotal = Number(it.precio) * Number(it.cantidad);

                  return (
                    <li key={`${it.id}-${i}`} className="mb-3">
                      <strong>{nombreProducto}</strong>
                      <br />

                      {it.talla && <small>Talla: {it.talla} </small>}
                      {it.color && <small>Color: {it.color}</small>}
                      <br />

                      <small>
                        {CLP.format(it.precio)} × {it.cantidad}
                      </small>

                      {" = "}
                      <strong>{CLP.format(subtotal)}</strong>
                    </li>
                  );
                })}
              </ul>

              <hr />

              <p className="m-0 fs-4 fw-bold">
                Total: {CLP.format(order.total || 0)}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
