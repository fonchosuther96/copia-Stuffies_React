// src/pages/Registro.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

// ======================
//   VALIDAR RUN CHILENO
// ======================
function validarRut(rut) {
  rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += multiplo * Number(cuerpo[i]);
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  let dvCalc =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);

  return dvCalc === dv;
}

// ======================
// AUTO FORMATEAR RUN
// ======================
function formatearRut(value) {
  let v = value.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (v.length <= 1) return v;
  return v.slice(0, -1) + "-" + v.slice(-1);
}

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

  // ======================
  //   VALIDACIÓN COMPLETA
  // ======================
  const validate = () => {
    const e = {};

    const run = form.run.trim();
    const name = form.name.trim();
    const last = form.last.trim();
    const email = form.email.trim();
    const user = form.user.trim();
    const pass = form.pass;
    const pass2 = form.pass2;
    const address = form.address.trim();
    const role = form.role;

    if (!run) e.run = "Ingresa tu RUN";
    else if (!validarRut(run)) e.run = "RUN inválido.";

    if (!name) e.name = "Ingresa tu nombre";
    else if (name.length < 2) e.name = "Mínimo 2 caracteres";

    if (!last) e.last = "Ingresa tus apellidos";
    else if (last.length < 2) e.last = "Mínimo 2 caracteres";

    if (!email) e.email = "Ingresa tu correo";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Correo inválido";

    if (!user) e.user = "Ingresa un usuario";
    else if (user.length < 4 || user.length > 20)
      e.user = "Entre 4 y 20 caracteres";

    if (!pass) e.pass = "Ingresa una contraseña";
    else if (pass.length < 4 || pass.length > 10)
      e.pass = "Entre 4 y 10 caracteres";

    if (!pass2) e.pass2 = "Repite la contraseña";
    else if (pass2 !== pass) e.pass2 = "Las contraseñas no coinciden";

    if (!address) e.address = "Ingresa tu dirección";
    else if (address.length < 5) e.address = "Mínimo 5 caracteres";

    if (!role) e.role = "Selecciona un rol";

    return e;
  };

  // ======================
  // ON CHANGE (con RUN auto)
  // ======================
  const onChange = (e) => {
    const { id, value } = e.target;

    if (id === "run") {
      setForm((f) => ({ ...f, run: formatearRut(value) }));
    } else {
      setForm((f) => ({ ...f, [id]: value }));
    }

    setErrors((err) => ({ ...err, [id]: "", api: "" }));
  };

  // ======================
  //      ENVIAR A API
  // ======================
  const onSubmit = async (e) => {
    e.preventDefault();

    const eAll = validate();
    setErrors(eAll);
    if (Object.keys(eAll).length > 0) return;

    try {
      const payload = {
        rut: form.run.trim(),
        nombre: form.name.trim(),
        apellido: form.last.trim(),
        email: form.email.trim(),
        username: form.user.trim(),
        password: form.pass,
        direccion: form.address.trim(),
        role: form.role.toUpperCase(),
      };

      await api.post("/auth/register", payload);

      setOk(true);
      setErrors({});
      setTimeout(() => navigate("/login"), 800);

    } catch (error) {
      const e = {};

      if (error.response) {
        const data = error.response.data;
        const status = error.response.status;

        // Caso 1: backend manda message
        if (data?.message) {
          const msg = data.message.toLowerCase();

          if (msg.includes("email") || msg.includes("correo")) {
            e.email = "Ese email ya está registrado";
          } else if (msg.includes("usuario")) {
            e.user = "Ese nombre de usuario ya existe";
          } else {
            e.api = data.message;
          }

        // Caso 2: backend manda string directo
        } else if (typeof data === "string") {
          const msg = data.toLowerCase();

          if (msg.includes("email") || msg.includes("correo")) {
            e.email = "Ese email ya está registrado";
          } else if (msg.includes("usuario")) {
            e.user = "Ese nombre de usuario ya existe";
          } else {
            e.api = data;
          }

        // Caso 3: status 409 sin mensaje
        } else if (status === 409) {
          e.api = "El correo o nombre de usuario ya está registrado";
        } else {
          e.api = "No se pudo crear la cuenta. Intenta nuevamente.";
        }

      } else {
        e.api = "No se pudo crear la cuenta. Intenta nuevamente.";
      }

      setErrors(e);
    }
  };

  const cls = (f) => `form-control ${errors[f] ? "is-invalid" : ""}`;
  const msg = (f) =>
    errors[f] ? (
      <div className="invalid-feedback">{errors[f]}</div>
    ) : (
      <div className="invalid-feedback" />
    );

  return (
    <main className="py-5" style={{ minHeight: "100vh", background: "#111" }}>
      <div className="container" style={{ maxWidth: 650 }}>
        <h2 className="text-light text-center mb-4">Crear cuenta</h2>

        <form
          onSubmit={onSubmit}
          className="p-4 rounded-3 bg-dark border border-secondary"
          noValidate
        >
          <div className="row g-3">
            <div className="col-md-6">
              <input
                id="run"
                className={cls("run")}
                placeholder="12345678-9 (sin puntos, con guion)"
                value={form.run}
                onChange={onChange}
              />
              {msg("run")}
            </div>

            <div className="col-md-6">
              <input
                id="name"
                className={cls("name")}
                placeholder="Nombre (mín. 2 caracteres)"
                value={form.name}
                onChange={onChange}
              />
              {msg("name")}
            </div>

            <div className="col-md-12">
              <input
                id="last"
                className={cls("last")}
                placeholder="Apellidos (mín. 2 caracteres)"
                value={form.last}
                onChange={onChange}
              />
              {msg("last")}
            </div>

            <div className="col-md-6">
              <input
                id="email"
                type="email"
                className={cls("email")}
                placeholder="correo@ejemplo.cl"
                value={form.email}
                onChange={onChange}
              />
              {msg("email")}
            </div>

            <div className="col-md-6">
              <input
                id="user"
                className={cls("user")}
                placeholder="Usuario (4–20 caracteres)"
                value={form.user}
                onChange={onChange}
              />
              {msg("user")}
            </div>

            <div className="col-md-6">
              <input
                id="pass"
                type="password"
                className={cls("pass")}
                placeholder="Contraseña (4–10 caracteres)"
                value={form.pass}
                onChange={onChange}
              />
              {msg("pass")}
            </div>

            <div className="col-md-6">
              <input
                id="pass2"
                type="password"
                className={cls("pass2")}
                placeholder="Repite la contraseña"
                value={form.pass2}
                onChange={onChange}
              />
              {msg("pass2")}
            </div>

            <div className="col-md-12">
              <input
                id="address"
                className={cls("address")}
                placeholder="Dirección (mín. 5 caracteres)"
                value={form.address}
                onChange={onChange}
              />
              {msg("address")}
            </div>

            <div className="col-md-12">
              <select
                id="role"
                className={`form-select ${errors.role ? "is-invalid" : ""}`}
                value={form.role}
                onChange={onChange}
              >
                <option value="">Selecciona un rol</option>
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
              {msg("role")}
            </div>
          </div>

          {errors.api && (
            <div className="alert alert-danger mt-3">
              {errors.api}
            </div>
          )}

          {ok && (
            <div className="alert alert-success mt-3">
              ¡Cuenta creada! Redirigiendo…
            </div>
          )}

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary w-50">
              Crear cuenta
            </button>
            <Link to="/login" className="btn btn-outline-light w-50">
              Ya tengo cuenta
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
