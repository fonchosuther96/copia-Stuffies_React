// src/admin/pages/ProductosList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api"; // 👈 ahora usamos la API REST

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function ProductosList() {
  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [flash, setFlash] = useState(null); // {type,text}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar productos desde el backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // GET /api/products
        const res = await api.get("/api/products");

        // Si el backend devuelve un array directo:
        setItems(Array.isArray(res.data) ? res.data : []);

        // Si fuera paginado tipo { content: [...] }:
        // setItems(Array.isArray(res.data?.content) ? res.data.content : []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Ordenar por id (SEGURO — evita error "is not iterable")
  const rows = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => Number(a.id) - Number(b.id));
  }, [items]);

  const askDelete = async (id, nombre) => {
    if (
      !window.confirm(
        `¿Eliminar el producto "${nombre}" (#${id})? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      setDeletingId(id);

      // DELETE /api/products/{id}
      await api.delete(`/api/products/${id}`);

      setFlash({ type: "success", text: `Producto #${id} eliminado.` });
      setItems((prev) => prev.filter((p) => String(p.id) !== String(id)));
    } catch (err) {
      console.error(err);
      setFlash({
        type: "danger",
        text: `No se pudo eliminar el producto #${id}.`,
      });
    } finally {
      setDeletingId(null);
      setTimeout(() => setFlash(null), 2000);
    }
  };

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos</h2>
        <div className="d-flex gap-2">
          <Link className="btn btn-primary" to="../productos/nuevo">
            Nuevo producto
          </Link>
          <Link className="btn btn-outline-light" to="../productos/criticos">
            Listado críticos
          </Link>
          <Link className="btn btn-outline-light" to="../productos/reportes">
            Reportes
          </Link>
        </div>
      </div>

      {flash && (
        <div className={`alert alert-${flash.type} py-2`}>{flash.text}</div>
      )}

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
                // Soporte para distintos nombres de campo imagen
                const imagen =
                  p.imagen ||
                  p.imageUrl ||
                  p.imagenUrl ||
                  p.image_url ||
                  null;

                // Stock: si backend tiene "stock", tomarlo, si no, 0
                const stock = p.stock ?? 0;

                const isDeleting = String(deletingId) === String(p.id);

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={p.nombre}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : null}
                        <span>{p.nombre}</span>
                        {p.destacado ? (
                          <span className="badge bg-warning text-dark">
                            Destacado
                          </span>
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
