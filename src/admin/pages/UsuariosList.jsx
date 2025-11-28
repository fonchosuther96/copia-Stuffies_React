// src/admin/pages/UsuariosList.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const USERS_KEY = "stuffies_users";
const SESSION_KEY = "stuffies_session"; // opcional: para evitar borrarte a ti mismo

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveUsers = (arr) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  // avisa a otras pantallas
  try { window.dispatchEvent(new Event("users:updated")); } catch {}
};

const getCurrentUser = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    return s && s.user ? String(s.user) : null;
  } catch {
    return null;
  }
};

export default function UsuariosList() {
  const [users, setUsers] = useState([]);
  const [flash, setFlash] = useState(null); // {type,text}
  const [deleting, setDeleting] = useState(null); // username en eliminación

  // Cargar usuarios y reaccionar a cambios
  useEffect(() => {
    const load = () => setUsers(getUsers());
    load();

    const onStorage = (e) => {
      if (e.key === USERS_KEY) load();
    };
    window.addEventListener("storage", onStorage);

    const onUsersUpdated = () => load();
    window.addEventListener("users:updated", onUsersUpdated);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("users:updated", onUsersUpdated);
    };
  }, []);

  // Normaliza y ordena por user asc
  const rows = useMemo(() => {
    return [...users]
      .sort((a, b) => String(a.user || "").localeCompare(String(b.user || "")))
      .map((u, idx) => {
        const nombre =
          [u.name, u.last].filter(Boolean).join(" ").trim() ||
          u.nombre ||
          u.user ||
          "—";
        return {
          id: idx + 1, // ID solo de UI
          user: u.user || "",
          nombre,
          email: u.email || "",
          rol: (u.role || u.rol || "cliente").toLowerCase(),
        };
      });
  }, [users]);

  const handleDelete = (username) => {
    const current = getCurrentUser();

    // Protección opcional: no borrarse a uno mismo
    if (current && current.toLowerCase() === String(username).toLowerCase()) {
      setFlash({ type: "warning", text: "No puedes eliminar tu propio usuario mientras estás conectado." });
      setTimeout(() => setFlash(null), 2500);
      return;
    }

    const ok = window.confirm(`¿Eliminar al usuario "@${username}"? Esta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      setDeleting(username);
      const list = getUsers();
      const next = list.filter((u) => String(u.user).toLowerCase() !== String(username).toLowerCase());
      if (next.length === list.length) throw new Error("Usuario no encontrado");
      saveUsers(next);
      setFlash({ type: "success", text: `Usuario @${username} eliminado.` });
    } catch (err) {
      setFlash({ type: "danger", text: err?.message || "No se pudo eliminar el usuario." });
    } finally {
      setDeleting(null);
      setTimeout(() => setFlash(null), 2000);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Usuarios</h2>
        <Link className="btn btn-primary" to="../usuarios/nuevo">Nuevo usuario</Link>
      </div>

      {flash && <div className={`alert alert-${flash.type} py-2`}>{flash.text}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-secondary py-4">
                  Aún no hay usuarios.
                </td>
              </tr>
            ) : (
              rows.map((u) => {
                const isDeleting = deleting === u.user;
                return (
                  <tr key={`${u.user}-${u.id}`}>
                    <td>{u.id}</td>
                    <td>@{u.user}</td>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">{u.rol}</span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Link className="btn btn-sm btn-outline-primary" to={`../usuarios/editar/${u.id}`}>
                          Editar
                        </Link>
                        <Link className="btn btn-sm btn-outline-info" to={`../historial/${u.id}`}>
                          Historial de compras
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(u.user)}
                          disabled={isDeleting}
                          title="Eliminar usuario"
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
