// src/pages/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState(""); // usuario o correo
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "", show: false });

  const [errors, setErrors] = useState({
    email: "",
    pass: "",
  });

  // Helpers de validación
  const requerido = (v) =>
    !v || !v.trim() ? "Este campo es obligatorio." : "";

  const longitud = (v, { min = 0, max = Infinity } = {}) => {
    const len = v.trim().length;
    if (len < min) return `Debe tener al menos ${min} caracteres.`;
    if (len > max) return `No puede superar los ${max} caracteres.`;
    return "";
  };

  const validarIdentidad = (v) =>
    requerido(v) || longitud(v, { min: 4, max: 40 });

  const validarPass = (v) =>
    requerido(v) || longitud(v, { min: 4, max: 10 });

  const validarTodo = (draft) => {
    const e = {};
    const eEmail = validarIdentidad(draft.email);
    if (eEmail) e.email = eEmail;
    const ePass = validarPass(draft.pass);
    if (ePass) e.pass = ePass;
    return e; // {} si no hay errores
  };

  const showMsg = (type, text) => setMsg({ type, text, show: true });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validarTodo({ email, pass });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      showMsg("danger", "Revisa los campos marcados en rojo.");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        username: email,
        password: pass,
      });

      const data = res.data; // { token, username, role }

      // Normalizamos roles: siempre array
      const rolesRaw = Array.isArray(data.roles)
        ? data.roles
        : data.role
        ? [data.role]
        : [];

      const roles = rolesRaw.map((r) =>
        typeof r === "string" ? r : r.authority
      );

      // Guardar sesión en contexto + localStorage
      login({
        token: data.token,
        username: data.username,
        roles,
      });

      const isAdmin = roles.includes("ROLE_ADMIN");

      if (isAdmin) {
        showMsg("success", "¡Bienvenido/a admin! Redirigiendo al panel…");
        setTimeout(() => navigate("/admin", { replace: true }), 500);
      } else {
        const nombre = data.username || email;
        showMsg("success", `¡Bienvenido/a, ${nombre}! Redirigiendo…`);
        setTimeout(() => navigate("/", { replace: true }), 500);
      }
    } catch (err) {
      console.error(err);
      showMsg("danger", "Credenciales inválidas. Revisa tus datos.");
    }
  };

  const onChangeEmail = (v) => {
    setEmail(v);
    setErrors((prev) => {
      const next = { ...prev };
      const err = validarIdentidad(v);
      if (err) next.email = err;
      else delete next.email;
      return next;
    });
  };

  const onChangePass = (v) => {
    setPass(v);
    setErrors((prev) => {
      const next = { ...prev };
      const err = validarPass(v);
      if (err) next.pass = err;
      else delete next.pass;
      return next;
    });
  };

  // ======== DISEÑO (más simple, estilo anterior) ========
  return (
    <main className="py-5">
      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="card shadow border-0"
          style={{ maxWidth: "420px", width: "100%" }}
        >
          <div className="card-body p-4">
            <h1 className="h4 mb-3 text-center">Iniciar sesión</h1>
            <p className="text-muted small text-center mb-4">
              Ingresa con tu usuario o correo y tu contraseña.
            </p>

            {msg.show && (
              <div
                className={`alert alert-${msg.type} py-2 small`}
                role="alert"
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label small">
                  Usuario o correo electrónico
                </label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${
                    errors.email ? "is-invalid" : ""
                  }`}
                  placeholder="tuusuario o correo@ejemplo.cl"
                  value={email}
                  onChange={(e) => onChangeEmail(e.target.value)}
                />
                {errors.email && (
                  <div className="invalid-feedback small">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small">Contraseña</label>
                <input
                  type="password"
                  className={`form-control form-control-sm ${
                    errors.pass ? "is-invalid" : ""
                  }`}
                  placeholder="Tu contraseña"
                  value={pass}
                  onChange={(e) => onChangePass(e.target.value)}
                />
                {errors.pass && (
                  <div className="invalid-feedback small">
                    {errors.pass}
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check form-check-sm">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberCheck"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label
                    className="form-check-label small"
                    htmlFor="rememberCheck"
                  >
                    Recordarme
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3 fw-semibold"
              >
                Entrar
              </button>
            </form>

            <p className="text-center small mb-0">
              ¿No tienes una cuenta?{" "}
              <Link to="/registro" className="text-decoration-none">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
