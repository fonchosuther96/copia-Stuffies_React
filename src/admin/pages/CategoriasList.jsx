// src/admin/pages/CategoriasList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLive, getCategories, deleteCategory } from "../../services/inventory.js";

export default function CategoriasList() {
  const [items, setItems] = useState([]); // productos
  const [cats, setCats] = useState([]);   // catálogo de categorías
  const [flash, setFlash] = useState(null); // {type, text}
  const [deleting, setDeleting] = useState(null); // nombre en eliminación

  // Carga inicial + suscripciones a cambios
  useEffect(() => {
    const load = () => {
      setItems(getAllLive());
      setCats(getCategories());
    };
    load();

    const onStorage = (e) => {
      if (e.key === "stuffies_inventory_v1" || e.key === "stuffies_categories_v1") load();
    };
    window.addEventListener("storage", onStorage);

    const onInventoryUpdated = () => load();
    window.addEventListener("inventory:updated", onInventoryUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("inventory:updated", onInventoryUpdated);
    };
  }, []);

  // Conteo de productos por categoría
  const counts = useMemo(() => {
    const m = new Map();
    for (const p of items) {
      const c = (p.categoria || "").trim();
      if (!c) continue;
      m.set(c, (m.get(c) || 0) + 1);
    }
    return m;
  }, [items]);

  // Fila final: catálogo + conteo (0 si no hay productos)
  const rows = useMemo(() => {
    return cats
      .map((c) => ({ nombre: c, productos: counts.get(c) || 0 }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((c, i) => ({ id: i + 1, ...c })); // id solo para UI
  }, [cats, counts]);

  const askDelete = async (nombre, productos) => {
    if (productos > 0) return; // protección extra (además del disable)
    const ok = window.confirm(
      `¿Eliminar la categoría "${nombre}"? Solo puede eliminarse si no tiene productos.`
    );
    if (!ok) return;

    try {
      setDeleting(nombre);
      await Promise.resolve(deleteCategory(nombre)); // por si en el futuro es async
      setFlash({ type: "success", text: `Categoría "${nombre}" eliminada.` });
      // refresco optimista local
      setCats((prev) => prev.filter((c) => c.toLowerCase() !== nombre.toLowerCase()));
    } catch (err) {
      setFlash({ type: "danger", text: err?.message || "No se pudo eliminar la categoría." });
    } finally {
      setDeleting(null);
      setTimeout(() => setFlash(null), 2000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Categorías</h2>
        <Link className="btn btn-primary" to="../categorias/nueva">Nueva categoría</Link>
      </div>

      {flash && <div className={`alert alert-${flash.type} py-2`}>{flash.text}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Productos</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  Aún no hay categorías.
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const disabled = c.productos > 0 || deleting === c.nombre;
                return (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td className="text-uppercase">{c.nombre}</td>
                    <td>{c.productos}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        {/* Edita por índice 1-based (compatible con tu CategoriaEditar actual).
                           Si prefieres por nombre, cambia el to por encodeURIComponent(c.nombre) */}
                        <Link
                          className="btn btn-sm btn-outline-primary"
                          to={`../categorias/editar/${c.id}`}
                        >
                          Editar
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => askDelete(c.nombre, c.productos)}
                          disabled={disabled}
                          title={
                            c.productos > 0
                              ? "No se puede eliminar: tiene productos"
                              : "Eliminar categoría"
                          }
                        >
                          {deleting === c.nombre ? "Eliminando..." : "Eliminar"}
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
