import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

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
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error("Error cargando boleta:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading)
    return <div className="container my-5">Cargando boleta...</div>;

  if (!order)
    return (
      <div className="container my-5">
        <p className="alert alert-warning">
          No se encontró la boleta <strong>#{id}</strong>.
        </p>
        <Link to="/" className="btn btn-primary">Volver a la tienda</Link>
      </div>
    );

  const fecha = order.fechaCreacion
    ? new Date(order.fechaCreacion).toLocaleString("es-CL")
    : "(sin fecha)";

  // Email correcto
  const emailFinal =
    order.clienteEmail ||
    order.user?.email ||
    "(no informado)";

  // Nombre correcto (si viene separado desde sesión)
  const nombreFinal = order.clienteNombre || order.user?.nombre || "(no informado)";

  return (
    <main className="container my-5">
      <div className="card card-body bg-dark text-light">

        {/* ENCABEZADO */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Boleta #{order.id}</h2>
          <button className="btn btn-outline-light" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>

        {/* DATOS DEL CLIENTE */}
        <h5 className="mt-3">Datos del cliente</h5>

        <p><strong>Nombre:</strong> {nombreFinal}</p>
        <p><strong>Email:</strong> {emailFinal}</p>
        <p><strong>Dirección:</strong> {order.clienteDireccion || "(no informado)"}</p>
        <p><strong>Teléfono:</strong> {order.clienteTelefono || "(no informado)"}</p>
        <p><strong>Fecha de compra:</strong> {fecha}</p>

        <hr />

        {/* DETALLE */}
        <h5>Detalle de la compra</h5>

        <ul className="list-group list-group-flush mb-3">
          {order.items?.map((it) => {
            const nombreProducto = it.product?.nombre || it.nombre || "Producto";
            const subtotal = Number(it.precio) * Number(it.cantidad);

            return (
              <li
                key={it.id}
                className="list-group-item bg-transparent text-light d-flex justify-content-between"
              >
                <span>
                  <strong>{nombreProducto}</strong> <br />
                  {it.talla && <small>Talla: {it.talla}</small>}{" "}
                  {it.color && <small>Color: {it.color}</small>} <br />
                  <small>Cantidad: {it.cantidad}</small>
                </span>

                <span>{CLP.format(subtotal)}</span>
              </li>
            );
          })}
        </ul>

        <hr />

        {/* TOTAL */}
        <div className="d-flex justify-content-between fs-4 fw-bold">
          <span>Total</span>
          <span>{CLP.format(order.total)}</span>
        </div>

        <p className="mt-3"><strong>Estado:</strong> {order.estado}</p>
        <p><strong>Medio de pago:</strong> {order.medioPago}</p>

        <div className="mt-4">
          <Link className="btn btn-primary" to="/">
            Volver a la tienda
          </Link>
        </div>

      </div>
    </main>
  );
}
