import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../../services/orders.js";

const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const [ventas7d, setVentas7d] = useState(0);
  const [pedidos, setPedidos] = useState(0);
  const [ticketPromedio, setTicketPromedio] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getAllOrders();
      if (!Array.isArray(data)) return;

      const hoy = new Date();
      const hace7dias = new Date();
      hace7dias.setDate(hoy.getDate() - 7);

      const ordenes7d = data.filter((o) => {
        if (!o.fechaCreacion) return false;
        const f = new Date(o.fechaCreacion);
        return f >= hace7dias && f <= hoy;
      });

      const total7d = ordenes7d.reduce((sum, o) => sum + (o.total ?? 0), 0);
      const totalPedidos = data.length;

      const avg =
        totalPedidos > 0
          ? data.reduce((sum, o) => sum + (o.total ?? 0), 0) / totalPedidos
          : 0;

      setVentas7d(total7d);
      setPedidos(totalPedidos);
      setTicketPromedio(avg);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  // RUTAS ABSOLUTAS DEL ADMIN
  const sections = [
    { name: "Órdenes / Boletas", path: "/admin/ordenes" },
    { name: "Productos", path: "/admin/productos" },
    { name: "Usuarios", path: "/admin/usuarios" },
    { name: "Categorías", path: "/admin/categorias" },
    { name: "Reportes", path: "/admin/reportes" },
  ];

  if (loading) return <p>Cargando dashboard...</p>;

  return (
    <div>
      <h2 className="mb-3">Home / Dashboard</h2>

      {/* TARJETAS SUPERIORES */}
      <div className="row g-3">
        <div className="col-6 col-lg-4">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Ventas (7d)</small>
              <h3 className="m-0">{CLP.format(ventas7d)}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Pedidos</small>
              <h3 className="m-0">{pedidos}</h3>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-4">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Ticket Promedio</small>
              <h3 className="m-0">{CLP.format(ticketPromedio)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES ESTILO PANEL ADMIN */}
      <div className="mt-4 d-flex gap-2 flex-wrap">
        {sections.map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="btn"
            style={{
              backgroundColor: "#d1d1d1",
              color: "#000",
              border: "1px solid #c0c0c0",
              fontWeight: "500",
            }}
          >
            {s.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
