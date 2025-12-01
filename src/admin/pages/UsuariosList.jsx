// src/admin/pages/UsuariosList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function UsuariosList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      setFlash({ type: "danger", text: "No se pudieron cargar los usuarios" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id, username) => {
    if (!window.confirm(`¿Eliminar al usuario "${username}"?`)) return;

    try {
      setDeleting(id);
      await api.delete(`/api/users/${id}`);
      setFlash({ type: "success", text: `Usuario ${username} eliminado.` });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      setFlash({ type: "danger", text: "Error al eliminar usuario" });
    } finally {
      setDeleting(null);
      setTimeout(() => setFlash(null), 2000);
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Usuarios</h2>
      </div>

      {flash && (
        <div className={`alert alert-${flash.type}`}>{flash.text}</div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Rol</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-3">
                  No hay usuarios.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.rut}</td>
                  <td>{u.nombre}</td>
                  <td>{u.apellido}</td>
                  <td>{u.username}</td>
                  <td>{u.email || "sin email"}</td>
                  <td>{u.direccion || "sin dirección"}</td>
                  <td>
                    <span className="badge bg-secondary text-uppercase">
                      {u.role}
                    </span>
                  </td>

                  <td className="text-end">
                    <div className="btn-group">
                      <Link
                        to={`../usuarios/editar/${u.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        Editar
                      </Link>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        disabled={deleting === u.id}
                        onClick={() => handleDelete(u.id, u.username)}
                      >
                        {deleting === u.id ? "..." : "Eliminar"}
                      </button>
                    </div>
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
