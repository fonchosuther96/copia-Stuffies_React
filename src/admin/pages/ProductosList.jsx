// src/admin/pages/ProductosList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLive, getTotalStock, deleteProduct } from "../../services/inventory.js";

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function ProductosList() {
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [flash, setFlash] = useState(null); // {type,text}

  useEffect(() => {
    const load = () => setItems(getAllLive());
    load();

    const onStorage = (e) => { if (e.key === "stuffies_inventory_v1") load(); };
    const onInventoryUpdated = () => load();

    window.addEventListener("storage", onStorage);
    window.addEventListener("inventory:updated", onInventoryUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("inventory:updated", onInventoryUpdated);
    };
  }, []);

  const rows = useMemo(() => [...items].sort((a, b) => Number(a.id) - Number(b.id)), [items]);

  const askDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el producto "${nombre}" (#${id})? Esta acción no se puede deshacer.`)) return;
    try {
      setDeletingId(id);
      deleteProduct(id);
      window.dispatchEvent(new Event("inventory:updated"));
      setFlash({ type: "success", text: `Producto #${id} eliminado.` });
      setItems((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch {
      setFlash({ type: "danger", text: `No se pudo eliminar el producto #${id}.` });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFlash(null), 2000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos</h2>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="../productos/nuevo">Nuevo producto</Link>
          <Link className="btn btn-outline-light" to="../productos/criticos">Listado críticos</Link>
          <Link className="btn btn-outline-light" to="../productos/reportes">Reportes</Link>
        </div>
      </div>

      {flash && <div className={`alert alert-${flash.type} py-2`}>{flash.text}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th className="text-end col-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
                  No hay productos aún. Crea el primero con “Nuevo producto”.
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const stock = getTotalStock(p.id);
                const isDeleting = String(deletingId) === String(p.id);
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.imagen ? (
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : null}
                        <span>{p.nombre}</span>
                        {p.destacado ? (
                          <span className="badge bg-warning text-dark">Destacado</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">
                        {p.categoria || "—"}
                      </span>
                    </td>
                    <td>{stock}</td>
                    <td>{money.format(p.precio ?? 0)}</td>
                    <td className="text-end col-actions">
                      <div className="btn-group">
                        <Link
                          to={`../productos/editar/${p.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Editar
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => askDelete(p.id, p.nombre)}
                          disabled={isDeleting}
                          title="Eliminar producto"
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
