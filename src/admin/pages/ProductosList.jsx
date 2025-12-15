import { useEffect, useMemo, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { AuthContext } from "../../context/AuthContext.jsx";

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function ProductosList() {
  const { user } = useContext(AuthContext) || {};

  const rawRole = String(
    user?.role ||
      (Array.isArray(user?.roles) ? user.roles[0] : "") ||
      ""
  ).toUpperCase();

  const isAdmin = rawRole.includes("ADMIN");
  const isVendedor = rawRole.includes("VENDEDOR");

  const [items, setItems] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar productos
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/api/products");
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos desde el servidor.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const rows = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return [...items].sort((a, b) => Number(a.id) - Number(b.id));
  }, [items]);

  const askDelete = async (id, nombre) => {
    if (!isAdmin) return;

    if (
      !window.confirm(
        `¿Eliminar el producto "${nombre}" (#${id})? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      setDeletingId(id);
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

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Productos</h2>

        <div className="d-flex gap-2">
          {isAdmin && (
            <>
              <Link className="btn btn-primary" to="../productos/nuevo">
                Nuevo producto
              </Link>
              <Link
                className="btn btn-outline-light"
                to="../productos/criticos"
              >
                Listado críticos
              </Link>
            </>
          )}

          {(isAdmin || isVendedor) && (
            <Link className="btn btn-outline-light" to="../reportes">
              Reportes
            </Link>
          )}
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
                  No hay productos aún.
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const imagen =
                  p.imagen ||
                  p.imageUrl ||
                  p.imagenUrl ||
                  p.image_url ||
                  null;

                const stock = p.stock ?? 0;
                const isDeleting = String(deletingId) === String(p.id);

                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {imagen && (
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
                        )}
                        <span>{p.nombre}</span>
                        {p.destacado && (
                          <span className="badge bg-warning text-dark">
                            Destacado
                          </span>
                        )}
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
                      {isAdmin ? (
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
                          >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
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
