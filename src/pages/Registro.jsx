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

    // RUN
    if (!run) {
      e.run = "Ingresa tu RUN";
    } else if (!validarRut(run)) {
      e.run = "RUN inválido. Debe incluir dígito verificador.";
    }

    // NOMBRE (mínimo 2)
    if (!name) {
      e.name = "Ingresa tu nombre";
    } else if (name.length < 2) {
      e.name = "El nombre debe tener al menos 2 caracteres";
    }

    // APELLIDOS (mínimo 2)
    if (!last) {
      e.last = "Ingresa tus apellidos";
    } else if (last.length < 2) {
      e.last = "Los apellidos deben tener al menos 2 caracteres";
    }

    // EMAIL
    if (!email) {
      e.email = "Ingresa tu correo";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.email = "Correo inválido";
    } else if (email.length > 100) {
      e.email = "El correo es demasiado largo";
    }

    // USUARIO (4–20)
    if (!user) {
      e.user = "Ingresa un usuario";
    } else if (user.length < 4) {
      e.user = "El usuario debe tener al menos 4 caracteres";
    } else if (user.length > 20) {
      e.user = "El usuario no debe superar 20 caracteres";
    }

    // CONTRASEÑA (4–10)
    if (!pass) {
      e.pass = "Ingresa una contraseña";
    } else if (pass.length < 4 || pass.length > 10) {
      e.pass = "Contraseña entre 4 y 10 caracteres";
    }

    // REPETIR CONTRASEÑA
    if (!pass2) {
      e.pass2 = "Repite la contraseña";
    } else if (pass2 !== pass) {
      e.pass2 = "Las contraseñas no coinciden";
    }

    // DIRECCIÓN (mínimo 5)
    if (!address) {
      e.address = "Ingresa tu dirección";
    } else if (address.length < 5) {
      e.address = "La dirección debe tener al menos 5 caracteres";
    }

    // ROL
    if (!role) {
      e.role = "Selecciona un rol";
    }

    return e;
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErrors((err) => ({ ...err, [id]: "" })); // limpia error del campo
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
        role: form.role.toUpperCase(), // backend usa ROLE_...
      };

      await api.post("/auth/register", payload);

      setOk(true);
      setErrors({});
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);

      const msg = err?.response?.data;

      // Backend suele responder: "No se pudo registrar el usuario: El usuario ya existe"
      if (typeof msg === "string" && msg.includes("El usuario ya existe")) {
        setErrors({ user: "Ese usuario ya existe. Prueba con otro nombre." });
      } else {
        setErrors({
          api: "No se pudo crear la cuenta. Verifica los datos o intenta más tarde.",
        });
      }
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
    <main
      className="py-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container" style={{ maxWidth: "650px" }}>
        <h2 className="text-light mb-4 text-center">Crear cuenta</h2>

        <form
          onSubmit={onSubmit}
          className="p-4 rounded-3"
          style={{ backgroundColor: "#1e1e1e", border: "1px solid #444" }}
          noValidate
        >
          {errors.api && (
            <div className="alert alert-danger">{errors.api}</div>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-light">RUN</label>
              <input
                id="run"
                className={cls("run")}
                placeholder="12345678-9"
                value={form.run}
                onChange={onChange}
              />
              {msg("run")}
            </div>

            <div className="col-md-6">
              <label className="form-label text-light">Nombre</label>
              <input
                id="name"
                className={cls("name")}
                value={form.name}
                onChange={onChange}
              />
              {msg("name")}
            </div>

            <div className="col-md-12">
              <label className="form-label text-light">Apellidos</label>
              <input
                id="last"
                className={cls("last")}
                value={form.last}
                onChange={onChange}
              />
              {msg("last")}
            </div>

            <div className="col-md-6">
              <label className="form-label text-light">Correo</label>
              <input
                id="email"
                className={cls("email")}
                type="email"
                value={form.email}
                onChange={onChange}
              />
              {msg("email")}
            </div>

            <div className="col-md-6">
              <label className="form-label text-light">Usuario</label>
              <input
                id="user"
                className={cls("user")}
                value={form.user}
                onChange={onChange}
              />
              {msg("user")}
            </div>

            <div className="col-md-6">
              <label className="form-label text-light">Contraseña</label>
              <input
                id="pass"
                type="password"
                className={cls("pass")}
                value={form.pass}
                onChange={onChange}
              />
              {msg("pass")}
            </div>

            <div className="col-md-6">
              <label className="form-label text-light">
                Repetir contraseña
              </label>
              <input
                id="pass2"
                type="password"
                className={cls("pass2")}
                value={form.pass2}
                onChange={onChange}
              />
              {msg("pass2")}
            </div>

            <div className="col-md-12">
              <label className="form-label text-light">Dirección</label>
              <input
                id="address"
                className={cls("address")}
                value={form.address}
                onChange={onChange}
              />
              {msg("address")}
            </div>

            <div className="col-md-12">
              <label className="form-label text-light">Rol</label>
              <select
                id="role"
                className={`form-select ${errors.role ? "is-invalid" : ""}`}
                value={form.role}
                onChange={onChange}
              >
                <option value="">Selecciona…</option>
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
              {msg("role")}
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary w-50" type="submit">
              Crear cuenta
            </button>
            <Link to="/login" className="btn btn-outline-light w-50">
              Ya tengo cuenta
            </Link>
          </div>

          {ok && (
            <div className="alert alert-success mt-3">
              ¡Cuenta creada! Redirigiendo…
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
