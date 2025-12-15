import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api";

export default function UsuarioEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "ROLE_CLIENTE",
    nombre: "",
    apellido: "",
    direccion: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  // ==========================
  // CARGAR USUARIO
  // ==========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/api/users/${id}`);

        setForm({
          username: res.data.username || "",
          email: res.data.email || "",
          role: res.data.role || "ROLE_CLIENTE",
          nombre: res.data.nombre || "",
          apellido: res.data.apellido || "",
          direccion: res.data.direccion || "",
          password: "",
        });
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // ==========================
  // HANDLE CHANGE
  // ==========================
  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErr("");
    setOk(false);
  };

  // ==========================
  // VALIDACIÓN (MISMA LÓGICA QUE REGISTRO)
  // ==========================
  const validate = () => {
    if (!form.username || form.username.length < 4 || form.username.length > 20) {
      return "El usuario debe tener entre 4 y 20 caracteres";
    }

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Correo electrónico inválido";
    }

    if (form.nombre && form.nombre.length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }

    if (form.apellido && form.apellido.length < 2) {
      return "El apellido debe tener al menos 2 caracteres";
    }

    if (form.direccion && form.direccion.length < 5) {
      return "La dirección debe tener al menos 5 caracteres";
    }

    // password SOLO si viene
    if (form.password && (form.password.length < 4 || form.password.length > 10)) {
      return "La contraseña debe tener entre 4 y 10 caracteres";
    }

    return null;
  };

  // ==========================
  // GUARDAR CAMBIOS
  // ==========================
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);

    const validationError = validate();
    if (validationError) {
      setErr(validationError);
      return;
    }

    try {
      await api.put(`/api/users/${id}`, {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        direccion: form.direccion.trim(),
        password: form.password || null,
      });

      setOk(true);
      setTimeout(() => navigate("../usuarios"), 700);

    } catch (err) {
      console.error(err);

      if (typeof err.response?.data === "string") {
        setErr(err.response.data);
      } else {
        setErr("No se pudo actualizar el usuario");
      }
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
                <label className="form-label text-light">Usuario</label>
                <input
                  id="username"
                  className="form-control"
                  value={form.username}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Nombre</label>
                <input
                  id="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Apellido</label>
                <input
                  id="apellido"
                  className="form-control"
                  value={form.apellido}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label text-light">Dirección</label>
                <input
                  id="direccion"
                  className="form-control"
                  value={form.direccion}
                  onChange={onChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Rol</label>
                <select
                  id="role"
                  className="form-select"
                  value={form.role}
                  onChange={onChange}
                >
                  <option value="ROLE_CLIENTE">Cliente</option>
                  <option value="ROLE_VENDEDOR">Vendedor</option>
                  <option value="ROLE_ADMIN">Administrador</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label text-light">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="(Opcional)"
                  value={form.password}
                  onChange={onChange}
                />
              </div>

              <div className="col-12 d-flex gap-2 mt-3">
                <button className="btn btn-primary">
                  Guardar cambios
                </button>

                <Link to="../usuarios" className="btn btn-outline-light">
                  Cancelar
                </Link>
              </div>

              {err && (
                <div className="alert alert-danger mt-3">
                  {err}
                </div>
              )}

              {ok && (
                <div className="alert alert-success mt-3">
                  Usuario actualizado correctamente.
                </div>
              )}

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
