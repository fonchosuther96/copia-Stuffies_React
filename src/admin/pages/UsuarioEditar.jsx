// src/admin/pages/UsuarioEditar.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function UsuarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/users/${id}`);
        setForm(res.data);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErr("");
    setOk(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/api/users/${id}`, form);
      setOk(true);
      setTimeout(() => navigate("../usuarios"), 600);
    } catch (err) {
      console.error(err);
      setErr("No se pudo actualizar");
    }
  };

  if (loading) return <p>Cargando usuario...</p>;

  return (
    <div>
      <h2 className="mb-3">Editar usuario #{id}</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Usuario</label>
                <input
                  id="username"
                  className="form-control"
                  value={form.username}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  id="email"
                  className="form-control"
                  value={form.email || ""}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Rol</label>
                <select
                  id="role"
                  className="form-select"
                  value={form.role}
                  onChange={onChange}
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="(Opcional)"
                  value={form.password || ""}
                  onChange={onChange}
                />
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary">Guardar</button>
                <Link to="../usuarios" className="btn btn-outline-light">
                  Cancelar
                </Link>
              </div>

              {err && <div className="alert alert-danger mt-2">{err}</div>}
              {ok && (
                <div className="alert alert-success mt-2">
                  Usuario actualizado.
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
