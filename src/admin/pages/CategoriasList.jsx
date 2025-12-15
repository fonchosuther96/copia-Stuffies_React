// src/admin/pages/CategoriasList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLive, getCategories, deleteCategory } from "../../services/inventory.js"; // Asegúrate de importar la función deleteCategory

export default function CategoriasList() {
  const [items, setItems] = useState([]); // productos
  const [cats, setCats] = useState([]);   // categorías únicas
  const [loading, setLoading] = useState(true);

  // Estado para confirmar eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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

  // Función para manejar la eliminación de una categoría
  const handleDeleteCategory = async (category) => {
    try {
      await deleteCategory(category);
      // Actualizar las categorías después de la eliminación
      const updatedCategories = cats.filter(c => c !== category);
      setCats(updatedCategories);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  if (loading) return <p>Cargando categorías...</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Categorías</h2>
        <Link to="/admin/categorias/nueva" className="btn btn-primary">
          Crear nueva categoría
        </Link>
      </div>

      {/* Confirmación de eliminación */}
      {showConfirmDelete && categoryToDelete && (
        <div className="alert alert-warning">
          <p>¿Estás seguro de que quieres eliminar la categoría "{categoryToDelete}"?</p>
          <button
            className="btn btn-danger"
            onClick={() => handleDeleteCategory(categoryToDelete)}
          >
            Eliminar
          </button>
          <button
            className="btn btn-secondary ms-2"
            onClick={() => setShowConfirmDelete(false)}
          >
            Cancelar
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  No hay categorías.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="text-uppercase">{c.nombre}</td>
                  <td>{c.productos}</td>
                  <td>
                    <Link
                      to={`/admin/categorias/editar/${c.nombre}`}
                      className="btn btn-sm btn-outline-warning me-2"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setCategoryToDelete(c.nombre);
                        setShowConfirmDelete(true);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
