// src/admin/pages/HistorialCompras.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listOrders } from "../../services/orders.js";

const USERS_KEY = "stuffies_users";
const CLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}

function resolveUserByRouteId(routeId) {
  const users = loadUsers();
  if (!routeId) return { user: null, users };

  const n = Number(routeId);
  if (Number.isFinite(n) && n > 0) {
    const u = users[n - 1] || null;
    return { user: u, users };
  }

  if (routeId.includes("@")) {
    const u = users.find((x) => (x.email || "").toLowerCase() === routeId.toLowerCase()) || null;
    return { user: u, users };
  }

  const u = users.find((x) => (x.user || "").toLowerCase() === routeId.toLowerCase()) || null;
  return { user: u, users };
}

export default function HistorialCompras() {
  const { id } = useParams();
  const [{ user }, setState] = useState({ user: null });
  const [orders, setOrders] = useState([]);

  // Cargar usuario y órdenes
  useEffect(() => {
    const { user: resolved } = resolveUserByRouteId(id);
    setState({ user: resolved });
    setOrders(listOrders());

    const onOrdersUpdated = () => setOrders(listOrders());
    const onStorage = (e) => {
      if (!e || e.key === null || e.key === "stuffies_orders_v1" || e.key === USERS_KEY) {
        const r = resolveUserByRouteId(id);
        setState({ user: r.user });
        setOrders(listOrders());
      }
    };

    window.addEventListener("orders:updated", onOrdersUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("orders:updated", onOrdersUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [id]);

  // Filtro por usuario
  const rows = useMemo(() => {
    if (!user) return [];
    const email = (user.email || "").toLowerCase();
    const fullName = [user.name, user.last].filter(Boolean).join(" ").trim();
    const uname = (user.user || "").toLowerCase();

    return orders
      .filter((o) => {
        const oEmail = (o.cliente?.email || "").toLowerCase();
        const oName = String(o.cliente?.nombre || o.cliente?.name || "").trim();
        const oUserMeta = (o.meta?.user || o.cliente?.user || "").toLowerCase();

        // Regla principal: email exacto
        if (email && oEmail && oEmail === email) return true;

        if (!email && fullName && oName && oName.toLowerCase() === fullName.toLowerCase()) return true;

        if (uname && oUserMeta === uname) return true;

        return false;
      })
      .sort((a, b) => {
        const ta = a.fechaISO ? +new Date(a.fechaISO) : 0;
        const tb = b.fechaISO ? +new Date(b.fechaISO) : 0;
        return tb - ta || String(b.id).localeCompare(String(a.id));
      });
  }, [user, orders]);

  if (!user) {
    return (
      <div>
        <h2 className="mb-3">Historial de compras</h2>
        <div className="alert alert-warning">
          No se encontró el usuario con referencia <strong>{id}</strong>.
        </div>
        <Link to="../usuarios" className="btn btn-outline-light">Volver</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">
        Historial de compras — {user.name ? `${user.name} ${user.last || ""}`.trim() : `@${user.user}`}
      </h2>

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
                  <td>{o.fechaLocal || (o.fechaISO ? new Date(o.fechaISO).toLocaleString("es-CL") : "—")}</td>
                  <td>{CLP.format(Number(o.totals?.total ?? o.total ?? 0))}</td>
                  <td className="text-end">
                    <Link to={`../boleta/${encodeURIComponent(o.id)}`} className="btn btn-sm btn-primary">
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