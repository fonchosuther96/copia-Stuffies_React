// src/admin/pages/UsuarioNuevo.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const USERS_KEY = "stuffies_users";

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};
const setUsers = (arr) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  // notificar a otras vistas (UsuariosList, etc.)
  try { window.dispatchEvent(new Event("users:updated")); } catch {}
};

export default function UsuarioNuevo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    run: "",
    name: "",
    last: "",
    email: "",
    user: "",
    pass: "",
    pass2: "",
    address: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  // === Validación (mismos requisitos que Registro) ===
  const validate = () => {
    const e = {};
    // RUN chileno simple (solo números, 7–9 dígitos)
    if (!/^\d{7,9}$/.test(form.run.trim()))
      e.run = "Ingresa un RUN válido (solo números, 7–9 dígitos)";

    if (!form.name.trim()) e.name = "Ingresa tu nombre";
    if (!form.last.trim()) e.last = "Ingresa tus apellidos";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Correo inválido";
    if (!form.user.trim()) e.user = "Ingresa un usuario";

    if (form.pass.length < 4 || form.pass.length > 10)
      e.pass = "La contraseña debe tener 4–10 caracteres";
    if (form.pass2 !== form.pass)
      e.pass2 = "Las contraseñas no coinciden";

    if (!form.address.trim()) e.address = "Ingresa tu dirección";
    if (!form.role) e.role = "Selecciona un tipo de usuario";

    // Unicidad contra los existentes
    const users = getUsers();
    if (
      !e.email &&
      users.some(
        (u) => (u.email || "").toLowerCase() === form.email.trim().toLowerCase()
      )
    ) {
      e.email = "Este correo ya está registrado";
    }
    if (
      !e.user &&
      users.some(
        (u) => (u.user || "").toLowerCase() === form.user.trim().toLowerCase()
      )
    ) {
      e.user = "Este usuario ya existe";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErrors((er) => ({ ...er, [id]: "" })); // limpia error puntual
    setOk(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const users = getUsers();
    users.push({
      run: form.run.trim(),
      name: form.name.trim(),
      last: form.last.trim(),
      email: form.email.trim().toLowerCase(),
      user: form.user.trim(),
      pass: form.pass,
      address: form.address.trim(),
      role: form.role, // "cliente" | "vendedor" | "admin"
      avatar:
        "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png",
    });
    setUsers(users);

    setOk(true);
    // Limpia y vuelve al listado
    setForm({
      run: "",
      name: "",
      last: "",
      email: "",
      user: "",
      pass: "",
      pass2: "",
      address: "",
      role: "",
    });
    setTimeout(() => navigate("../usuarios"), 700);
  };

  const cls = (k) => `form-control ${errors[k] ? "is-invalid" : ""}`;
  const msg = (k) =>
    errors[k] ? (
      <div className="invalid-feedback">{errors[k]}</div>
    ) : (
      <div className="invalid-feedback"></div>
    );

  return (
    <div>
      <h2 className="mb-3">Nuevo usuario</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="run">RUN (sin puntos ni guion)</label>
                <input id="run" className={cls("run")} maxLength={9} value={form.run} onChange={onChange} />
                {msg("run")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="name">Nombre</label>
                <input id="name" className={cls("name")} maxLength={50} value={form.name} onChange={onChange} />
                {msg("name")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="last">Apellidos</label>
                <input id="last" className={cls("last")} maxLength={100} value={form.last} onChange={onChange} />
                {msg("last")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="email">Correo</label>
                <input id="email" type="email" className={cls("email")} maxLength={100} value={form.email} onChange={onChange} />
                {msg("email")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="user">Usuario</label>
                <input id="user" className={cls("user")} maxLength={30} value={form.user} onChange={onChange} />
                {msg("user")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="pass">Contraseña (4–10)</label>
                <input id="pass" type="password" className={cls("pass")} minLength={4} maxLength={10} value={form.pass} onChange={onChange} />
                {msg("pass")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="pass2">Repite la contraseña</label>
                <input id="pass2" type="password" className={cls("pass2")} minLength={4} maxLength={10} value={form.pass2} onChange={onChange} />
                {msg("pass2")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="address">Dirección</label>
                <input id="address" className={cls("address")} maxLength={300} value={form.address} onChange={onChange} />
                {msg("address")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="role">Tipo de usuario</label>
                <select id="role" className={`form-select ${errors.role ? "is-invalid" : ""}`} value={form.role} onChange={onChange}>
                  <option value="">Seleccione…</option>
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
                {msg("role")}
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Crear</button>
                <Link to="../usuarios" className="btn btn-outline-light">Volver</Link>
              </div>

              {ok && <div className="alert alert-success mt-2">Usuario creado correctamente. Redirigiendo…</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
