// src/admin/pages/UsuarioEditar.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

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
  try { window.dispatchEvent(new Event("users:updated")); } catch {}
};

export default function UsuarioEditar() {
  const { id } = useParams();            // índice 1-based desde la tabla
  const navigate = useNavigate();

  const [idx, setIdx] = useState(-1);    // índice real (0-based) dentro del array ordenado
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    run: "",
    name: "",
    last: "",
    email: "",
    user: "",
    pass: "",     // opcional (si no se cambia, queda igual)
    pass2: "",
    address: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  // Cargar usuario por el MISMO orden que en UsuariosList (user asc)
  useEffect(() => {
    const list = getUsers();
    const sorted = [...list].sort((a, b) =>
      String(a.user || "").localeCompare(String(b.user || ""))
    );
    const pos = Number(id) - 1;
    if (!Number.isFinite(pos) || pos < 0 || pos >= sorted.length) {
      setNotFound(true);
      return;
    }
    const u = sorted[pos];
    // Guardamos el índice REAL dentro del arreglo original (sin ordenar) para sobrescribir ahí
    const realIdx = list.findIndex((x) => (x.user || "") === (u.user || ""));
    setIdx(realIdx);

    setForm({
      run: String(u.run || ""),
      name: String(u.name || ""),
      last: String(u.last || ""),
      email: String(u.email || ""),
      user: String(u.user || ""),
      pass: "",            // vacío: no cambiar
      pass2: "",
      address: String(u.address || ""),
      role: String(u.role || u.rol || "cliente"),
    });
  }, [id]);

  // === Validación (igual que Registro/UsuarioNuevo, con diferencias para edición) ===
  const validate = () => {
    const e = {};
    if (!/^\d{7,9}$/.test(form.run.trim()))
      e.run = "Ingresa un RUN válido (solo números, 7–9 dígitos)";

    if (!form.name.trim()) e.name = "Ingresa tu nombre";
    if (!form.last.trim()) e.last = "Ingresa tus apellidos";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      e.email = "Correo inválido";
    if (!form.user.trim()) e.user = "Ingresa un usuario";

    // Contraseña opcional en edición
    const changingPass = form.pass.length > 0 || form.pass2.length > 0;
    if (changingPass) {
      if (form.pass.length < 4 || form.pass.length > 10)
        e.pass = "La contraseña debe tener 4–10 caracteres";
      if (form.pass2 !== form.pass)
        e.pass2 = "Las contraseñas no coinciden";
    }

    if (!form.address.trim()) e.address = "Ingresa tu dirección";
    if (!form.role) e.role = "Selecciona un tipo de usuario";

    // Unicidad ignorando al propio usuario
    const users = getUsers();
    users.forEach((u, i) => {
      if (i === idx) return; // ignora el actual
      if (!e.email && (u.email || "").toLowerCase() === form.email.trim().toLowerCase()) {
        e.email = "Este correo ya está registrado";
      }
      if (!e.user && (u.user || "").toLowerCase() === form.user.trim().toLowerCase()) {
        e.user = "Este usuario ya existe";
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErrors((er) => ({ ...er, [id]: "" }));
    setOk(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const list = getUsers();
    if (idx < 0 || idx >= list.length) {
      setNotFound(true);
      return;
    }

    const current = list[idx];
    const next = {
      ...current,
      run: form.run.trim(),
      name: form.name.trim(),
      last: form.last.trim(),
      email: form.email.trim().toLowerCase(),
      user: form.user.trim(),
      address: form.address.trim(),
      role: form.role,
    };

    // si el usuario decidió cambiar la contraseña
    if (form.pass || form.pass2) {
      next.pass = form.pass;
    }

    list[idx] = next;
    setUsers(list);

    setOk(true);
    setTimeout(() => navigate("../usuarios"), 700);
  };

  const cls = (k) => `form-control ${errors[k] ? "is-invalid" : ""}`;
  const msg = (k) =>
    errors[k] ? <div className="invalid-feedback">{errors[k]}</div> : <div className="invalid-feedback"></div>;

  if (notFound) {
    return (
      <div className="alert alert-warning">
        No se encontró el usuario solicitado.{" "}
        <Link to="../usuarios" className="alert-link">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Editar usuario #{id}</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label" htmlFor="user">Usuario</label>
                <input id="user" className={cls("user")} value={form.user} onChange={onChange} maxLength={30} />
                {msg("user")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="name">Nombre</label>
                <input id="name" className={cls("name")} value={form.name} onChange={onChange} maxLength={50} />
                {msg("name")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="last">Apellidos</label>
                <input id="last" className={cls("last")} value={form.last} onChange={onChange} maxLength={100} />
                {msg("last")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" type="email" className={cls("email")} value={form.email} onChange={onChange} maxLength={100} />
                {msg("email")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="run">RUN (sin puntos ni guion)</label>
                <input id="run" className={cls("run")} value={form.run} onChange={onChange} maxLength={9} />
                {msg("run")}
              </div>

              <div className="col-md-4">
                <label className="form-label" htmlFor="role">Rol</label>
                <select id="role" className={`form-select ${errors.role ? "is-invalid" : ""}`} value={form.role} onChange={onChange}>
                  <option value="">Seleccione…</option>
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
                {msg("role")}
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="address">Dirección</label>
                <input id="address" className={cls("address")} value={form.address} onChange={onChange} maxLength={300} />
                {msg("address")}
              </div>

              {/* Cambio de contraseña OPCIONAL */}
              <div className="col-md-3">
                <label className="form-label" htmlFor="pass">Nueva contraseña (opcional)</label>
                <input id="pass" type="password" className={cls("pass")} value={form.pass} onChange={onChange} minLength={4} maxLength={10} />
                {msg("pass")}
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="pass2">Repite la nueva contraseña</label>
                <input id="pass2" type="password" className={cls("pass2")} value={form.pass2} onChange={onChange} minLength={4} maxLength={10} />
                {msg("pass2")}
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary">Guardar</button>
                <Link to="../usuarios" className="btn btn-outline-light">Volver</Link>
              </div>

              {ok && (
                <div className="alert alert-success mt-2">
                  Usuario actualizado correctamente. Redirigiendo…
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
