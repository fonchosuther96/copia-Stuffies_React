// src/admin/pages/Reportes.jsx
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
  // 1) Ventas por día
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
  // 2) Top categorías (por cantidad de ítems)
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
  // 4) Ticket promedio + UPB
  // =======================================
  const totalVentas = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const ticketPromedio = orders.length > 0 ? totalVentas / orders.length : 0;

  // total de unidades vendidas (suma de cantidades de todos los ítems)
  const totalUnidades = orders.reduce((s, o) => {
    const unidadesOrden =
      o.items?.reduce((acc, it) => acc + (it.cantidad ?? 0), 0) || 0;
    return s + unidadesOrden;
  }, 0);

  const upbPromedio =
    orders.length > 0 ? totalUnidades / orders.length : 0;

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
  // Datos auxiliares para los gráficos
  // =======================================

  // Barra: máximo del eje Y
  const maxVentaDia =
    ventasPorDiaArray.reduce((m, [, total]) => Math.max(m, total), 0) || 1;
  const MAX_BAR_HEIGHT = 180; // px

  // Pie: segmentos y colores
  const totalCategoriasNum = topCategorias.reduce(
    (s, [, qty]) => s + qty,
    0
  );

  const PIE_COLORS = [
    "#0d6efd",
    "#6f42c1",
    "#20c997",
    "#ffc107",
    "#fd7e14",
    "#dc3545",
    "#198754",
    "#0dcaf0",
  ];

  let offset = 0;
  const segmentosPie = topCategorias.map(([cat, qty], idx) => {
    const porcentaje = totalCategoriasNum
      ? (qty / totalCategoriasNum) * 100
      : 0;
    const start = offset;
    const end = offset + porcentaje;
    offset = end;
    return {
      cat,
      qty,
      start,
      end,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    };
  });

  const pieBackground =
    segmentosPie.length > 0
      ? `conic-gradient(${segmentosPie
          .map(
            (s) => `${s.color} ${s.start.toFixed(2)}% ${s.end.toFixed(2)}%`
          )
          .join(", ")})`
      : "radial-gradient(circle at center, #555 0, #222 100%)";

  return (
    <div>
      <h2 className="mb-3">Reportes</h2>

      <div className="row g-3">
        {/* VENTAS POR DÍA - GRÁFICO DE BARRAS */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5>Ventas por día</h5>
              <hr />
              {ventasPorDiaArray.length === 0 ? (
                <p className="small text-secondary mb-0">
                  Aún no hay ventas registradas.
                </p>
              ) : (
                <div
                  style={{
                    height: 240,
                    padding: "8px 8px 0 8px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 16,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 8,
                  }}
                >
                  {ventasPorDiaArray.map(([fecha, total]) => {
                    const ratio = total / maxVentaDia;
                    const heightPx =
                      ratio <= 0 ? 0 : Math.max(8, ratio * MAX_BAR_HEIGHT);
                    return (
                      <div
                        key={fecha}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: heightPx,
                            background:
                              "linear-gradient(180deg, #0d6efd, #6610f2)",
                            borderRadius: 6,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                          }}
                          title={`${fecha}: ${CLP.format(total)}`}
                        />
                        <small
                          style={{
                            marginTop: 6,
                            fontSize: 10,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fecha}
                        </small>
                        <small
                          style={{
                            fontSize: 10,
                            color: "#6c757d",
                          }}
                        >
                          {CLP.format(total)}
                        </small>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TOP CATEGORÍAS - GRÁFICO DE TORTA */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <h5>Top categorías</h5>
              <hr />
              {segmentosPie.length === 0 ? (
                <p className="small text-secondary mb-0">
                  No hay datos de categorías todavía.
                </p>
              ) : (
                <>
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      style={{
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: pieBackground,
                        boxShadow: "0 0 8px rgba(0,0,0,0.25)",
                      }}
                    />
                  </div>

                  <ul
                    className="small mb-0"
                    style={{ listStyle: "none", paddingLeft: 0 }}
                  >
                    {segmentosPie.map((s) => (
                      <li
                        key={s.cat}
                        className="d-flex align-items-center mb-1"
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            backgroundColor: s.color,
                            display: "inline-block",
                            marginRight: 6,
                          }}
                        />
                        <span style={{ flex: 1 }}>
                          {s.cat}: <strong>{s.qty}</strong> unidades
                        </span>
                        <span className="text-secondary">
                          {totalCategoriasNum
                            ? `${((s.qty / totalCategoriasNum) * 100).toFixed(
                                1
                              )}%`
                            : "0%"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TOP PRODUCTOS */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5>Top productos más vendidos</h5>
              <hr />
              <ul className="small mb-0">
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
          <div className="card h-100">
            <div className="card-body">
              <h5>Pedidos por estado</h5>
              <hr />
              <ul className="small mb-0">
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
          <div className="card h-100">
            <div className="card-body">
              <h5>Pedidos por medio de pago</h5>
              <hr />
              <ul className="small mb-0">
                {mediosArray.map(([medio, qty]) => (
                  <li key={medio}>
                    {medio}: <strong>{qty}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TICKET PROMEDIO + UPB */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5>Ticket Promedio</h5>
              <hr />
              <h4>{CLP.format(ticketPromedio)}</h4>
              <p className="small text-secondary mb-1">
                Promedio por boleta
              </p>
              <p className="small mb-0">
                <strong>UPB promedio:</strong>{" "}
                {upbPromedio.toFixed(1)} unidades por boleta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
