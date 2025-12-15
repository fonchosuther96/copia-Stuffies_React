// src/admin/pages/CategoriasList.jsx
import { useEffect, useMemo, useState } from "react";
import { getAllLive, getCategories } from "../../services/inventory.js";

export default function CategoriasList() {
  const [items, setItems] = useState([]); // productos
  const [cats, setCats] = useState([]);   // categorías únicas
  const [loading, setLoading] = useState(true);

  // ======================
  // CARGA DESDE API
  // ======================
  useEffect(() => {
    const load = async () => {
      try {
        const productos = await getAllLive();
        const categorias = await getCategories();

        setItems(Array.isArray(productos) ? productos : []);
        setCats(Array.isArray(categorias) ? categorias : []);
      } catch (err) {
        console.error(err);
        setItems([]);
        setCats([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ======================
  // CONTAR PRODUCTOS POR CATEGORÍA
  // ======================
  const counts = useMemo(() => {
    const map = new Map();
    for (const p of items) {
      const c = (p.categoria || "").trim();
      if (!c) continue;
      map.set(c, (map.get(c) || 0) + 1);
    }
    return map;
  }, [items]);

  // ======================
  // CREAR FILAS
  // ======================
  const rows = useMemo(() => {
    return cats
      .map((c) => ({
        nombre: c,
        productos: counts.get(c) || 0
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map((row, i) => ({
        id: i + 1,
        ...row
      }));
  }, [cats, counts]);

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Categorías</h2>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Productos asociados</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center text-secondary py-4">
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="text-uppercase">{c.nombre}</td>
                  <td>{c.productos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
