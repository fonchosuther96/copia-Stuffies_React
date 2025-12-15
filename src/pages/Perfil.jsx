import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Perfil() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    apellido: "",
    email: "",
    direccion: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // ==========================
  // CARGAR PERFIL
  // ==========================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/users/me");

        setForm({
          rut: res.data.rut || "",
          nombre: res.data.nombre || "",
          apellido: res.data.apellido || "",
          email: res.data.email || "",
          direccion: res.data.direccion || "",
          username: res.data.username || "",
          password: "",
        });
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        setMsg({ type: "danger", text: "No se pudo cargar el perfil." });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [logout, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================
  // GUARDAR CAMBIOS
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setMsg({ type: "danger", text: "Nombre y apellido son obligatorios." });
      return;
    }

    try {
      await api.put("/api/users/me", {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        direccion: form.direccion.trim(),
        password: form.password || null,
      });

      setMsg({ type: "success", text: "Perfil actualizado correctamente." });
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setMsg({ type: "danger", text: "No se pudo actualizar el perfil." });
    }
  };

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div>
      <h2 className="mb-3">Perfil</h2>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              <div className="col-md-4">
                <label className="form-label text-light">RUT</label>
                <input className="form-control" value={form.rut} disabled />
              </div>

              <div className="col-md-4">
                <label className="form-label text-light">Nombre</label>
                <input
                  className="form-control"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label text-light">Apellido</label>
                <input
                  className="form-control"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Email</label>
                <input className="form-control" value={form.email} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Dirección</label>
                <input
                  className="form-control"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Usuario</label>
                <input className="form-control" value={form.username} disabled />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Nueva contraseña</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div className="col-12">
                <button className="btn btn-primary">
                  Actualizar perfil
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
