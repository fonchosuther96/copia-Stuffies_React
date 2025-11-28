// src/pages/Registro.jsx
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
const setUsers = (arr) => localStorage.setItem(USERS_KEY, JSON.stringify(arr));

// 👇 MUEVO idToKey ARRIBA para no usarlo antes de declararlo
const idToKey = (id) =>
  ({
    regRun: "run",
    regName: "name",
    regLast: "last",
    regEmail: "email",
    regUser: "user",
    regPass: "pass",
    regPass2: "pass2",
    regAddress: "address",
    regRole: "role",
  }[id] || id);

// === Validadores inline, simples y reutilizables ===
const required = (v, msg = "Campo obligatorio") =>
  (typeof v === "string" ? v.trim() : v) ? null : msg;

const emailOk = (v) =>
  /^\S+@\S+\.\S+$/.test(String(v).trim()) ? null : "Correo inválido";

const len = (v, { min = 0, max = Infinity } = {}) => {
  const s = String(v ?? "").trim();
  if (s.length < min) return `Mínimo ${min} caracteres`;
  if (s.length > max) return `Máximo ${max} caracteres`;
  return null;
};

// RUN chileno simple (solo dígitos, 7–9). Si quieres DV lo agregamos luego.
const runSimple = (v) =>
  /^\d{7,9}$/.test(String(v).trim())
    ? null
    : "Ingresa un RUN válido (solo números, 7–9 dígitos)";

export default function Registro() {
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

  // Validación completa del formulario
  const validate = (draft = form) => {
    const e = {};

    e.run = runSimple(draft.run);
    e.name = required(draft.name, "Ingresa tu nombre") || len(draft.name, { min: 2, max: 50 });
    e.last = required(draft.last, "Ingresa tus apellidos") || len(draft.last, { min: 2, max: 100 });
    e.email = required(draft.email, "Ingresa tu correo") || emailOk(draft.email) || len(draft.email, { max: 100 });
    e.user = required(draft.user, "Ingresa un usuario") || len(draft.user, { min: 3, max: 30 });
    e.pass = required(draft.pass, "Ingresa una contraseña") || len(draft.pass, { min: 4, max: 10 });
    e.pass2 = required(draft.pass2, "Repite la contraseña") || (draft.pass2 !== draft.pass ? "Las contraseñas no coinciden" : null);
    e.address = required(draft.address, "Ingresa tu dirección") || len(draft.address, { min: 5, max: 300 });
    e.role = required(draft.role, "Selecciona un tipo de usuario");

    // Unicidad
    const users = getUsers();
    if (!e.email && users.some((u) => (u.email || "").toLowerCase() === draft.email.trim().toLowerCase())) {
      e.email = "Este correo ya está registrado";
    }
    if (!e.user && users.some((u) => (u.user || "").toLowerCase() === draft.user.trim().toLowerCase())) {
      e.user = "Este usuario ya existe";
    }

    // Limpia null/undefined
    Object.keys(e).forEach((k) => e[k] == null && delete e[k]);
    return e;
  };

  // Validación por campo al escribir (no cambia tu layout)
  const validateField = (key, value) => {
    const draft = { ...form, [key]: value };
    const e = validate(draft);
    setErrors(e);
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    const key = idToKey(id);
    setForm((f) => ({ ...f, [key]: value }));
    validateField(key, value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const eAll = validate();
    setErrors(eAll);
    if (Object.keys(eAll).length) return;

    const users = getUsers();
    users.push({
      run: form.run.trim(),
      name: form.name.trim(),
      last: form.last.trim(),
      email: form.email.trim().toLowerCase(),
      user: form.user.trim(),
      pass: form.pass,
      address: form.address.trim(),
      role: form.role,
      avatar: "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png",
    });
    setUsers(users);

    setOk(true);
    setTimeout(() => navigate("/login"), 800);
  };

  const cls = (key) => `form-control ${errors[key] ? "is-invalid" : ""}`;
  const msg = (key) =>
    errors[key] ? (
      <div className="invalid-feedback">{errors[key]}</div>
    ) : (
      // Reservo el espacio para que el layout no salte
      <div className="invalid-feedback" />
    );

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* usa tus estilos globales; si tienes .cardx en styles.css, aplica aquí */}
          <div className="cardx">
            <h2 className="mb-3">Crear cuenta</h2>

            <form id="registerForm" noValidate onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-4 form-group">
                  <label htmlFor="regRun" className="form-label">
                    RUN (sin puntos ni guion)
                  </label>
                  <input
                    id="regRun"
                    className={cls("run")}
                    inputMode="numeric"
                    maxLength={9}
                    value={form.run}
                    onChange={onChange}
                    placeholder="12345678"
                  />
                  {msg("run")}
                </div>

                <div className="col-md-4 form-group">
                  <label htmlFor="regName" className="form-label">Nombre</label>
                  <input id="regName" className={cls("name")} maxLength={50} value={form.name} onChange={onChange} />
                  {msg("name")}
                </div>

                <div className="col-md-4 form-group">
                  <label htmlFor="regLast" className="form-label">Apellidos</label>
                  <input id="regLast" className={cls("last")} maxLength={100} value={form.last} onChange={onChange} />
                  {msg("last")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regEmail" className="form-label">Correo</label>
                  <input
                    id="regEmail"
                    type="email"
                    className={cls("email")}
                    maxLength={100}
                    value={form.email}
                    onChange={onChange}
                    placeholder="nombre@duoc.cl"
                  />
                  {msg("email")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regUser" className="form-label">Usuario</label>
                  <input id="regUser" className={cls("user")} maxLength={30} value={form.user} onChange={onChange} />
                  {msg("user")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regPass" className="form-label">Contraseña (4–10)</label>
                  <input
                    id="regPass"
                    type="password"
                    className={cls("pass")}
                    minLength={4}
                    maxLength={10}
                    value={form.pass}
                    onChange={onChange}
                    placeholder="••••"
                  />
                  {msg("pass")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regPass2" className="form-label">Repite la contraseña</label>
                  <input
                    id="regPass2"
                    type="password"
                    className={cls("pass2")}
                    minLength={4}
                    maxLength={10}
                    value={form.pass2}
                    onChange={onChange}
                    placeholder="••••"
                  />
                  {msg("pass2")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regAddress" className="form-label">Dirección</label>
                  <input
                    id="regAddress"
                    className={cls("address")}
                    maxLength={300}
                    value={form.address}
                    onChange={onChange}
                  />
                  {msg("address")}
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="regRole" className="form-label">Tipo de usuario</label>
                  <select
                    id="regRole"
                    className={`form-select ${errors.role ? "is-invalid" : ""}`}
                    value={form.role}
                    onChange={onChange}
                  >
                    <option value="">Seleccione…</option>
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {msg("role")}
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Crear cuenta</button>
                <Link className="btn btn-outline-dark" to="/login">Ya tengo cuenta</Link>
              </div>

              {ok && (
                <div id="okMsg" className="alert alert-success mt-3">
                  ¡Cuenta creada! Redirigiendo a login…
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
