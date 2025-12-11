import { useEffect, useState } from "react";
import { getAllOrders } from "../../services/orders.js";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Reportes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando reportes:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Cargando reportes…</p>;

  // ================================
  // 1) Ventas por día (últimos 14 días)
  // ================================
  const ventasPorDia = {};

  orders.forEach((o) => {
    if (!o.fechaCreacion) return;
    const fecha = new Date(o.fechaCreacion).toLocaleDateString("es-CL");
    ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + (o.total ?? 0);
  });

  const ventasPorDiaArray = Object.entries(ventasPorDia).sort(
    (a, b) => new Date(a[0]) - new Date(b[0])
  );

  // =======================================
  // 2) Top categorías (si el producto tiene categoría)
  // =======================================
  const categorias = {};

  orders.forEach((o) => {
    o.items?.forEach((it) => {
      const cat = it.product?.categoria || "Sin categoría";
      categorias[cat] = (categorias[cat] || 0) + it.cantidad;
    });
  });

  const topCategorias = Object.entries(categorias).sort((a, b) => b[1] - a[1]);

  // =======================================
  // 3) Top productos más vendidos
  // =======================================
  const productos = {};

  orders.forEach((o) =>
    o.items?.forEach((it) => {
      const nombre = it.product?.nombre || "Producto";
      productos[nombre] = (productos[nombre] || 0) + it.cantidad;
    })
  );

  const topProductos = Object.entries(productos).sort((a, b) => b[1] - a[1]);

  // =======================================
  // 4) Ticket promedio
  // =======================================
  const totalVentas = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const ticketPromedio =
    orders.length > 0 ? totalVentas / orders.length : 0;

  // =======================================
  // 5) Por medio de pago
  // =======================================
  const mediosPago = {};

  orders.forEach((o) => {
    const medio = o.medioPago || "Desconocido";
    mediosPago[medio] = (mediosPago[medio] || 0) + 1;
  });

  const mediosArray = Object.entries(mediosPago);

  // =======================================
  // 6) Por estado
  // =======================================
  const estados = {};

  orders.forEach((o) => {
    const est = o.estado || "Desconocido";
    estados[est] = (estados[est] || 0) + 1;
  });

  const estadosArray = Object.entries(estados);

  // =======================================

  return (
    <div>
      <h2 className="mb-3">Reportes</h2>

      <div className="row g-3">

        {/* VENTAS POR DÍA */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Ventas por día</h5>
              <hr />
              <ul className="small">
                {ventasPorDiaArray.map(([fecha, total]) => (
                  <li key={fecha}>
                    <strong>{fecha}:</strong> {CLP.format(total)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TOP CATEGORÍAS */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Top categorías</h5>
              <hr />
              <ul className="small">
                {topCategorias.map(([cat, qty]) => (
                  <li key={cat}>
                    {cat}: <strong>{qty}</strong> unidades
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TOP PRODUCTOS */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Top productos más vendidos</h5>
              <hr />
              <ul className="small">
                {topProductos.map(([prod, qty]) => (
                  <li key={prod}>
                    {prod}: <strong>{qty}</strong> unidades
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ESTADOS */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Pedidos por estado</h5>
              <hr />
              <ul className="small">
                {estadosArray.map(([est, qty]) => (
                  <li key={est}>
                    {est}: <strong>{qty}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* MEDIOS DE PAGO */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Pedidos por medio de pago</h5>
              <hr />
              <ul className="small">
                {mediosArray.map(([medio, qty]) => (
                  <li key={medio}>
                    {medio}: <strong>{qty}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TICKET PROMEDIO */}
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Ticket Promedio</h5>
              <hr />
              <h4>{CLP.format(ticketPromedio)}</h4>
              <p className="small text-secondary">Promedio por boleta</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
