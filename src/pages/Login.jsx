// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const USERS_KEY = "stuffies_users";
const SESSION_KEY = "stuffies_session";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "", show: false });

  // === Estado de errores para inputs ===
  const [errors, setErrors] = useState({}); // { email?: string, pass?: string }

  // === Validadores inline (ligeros) ===
  const requerido = (v) =>
    (typeof v === "string" ? v.trim() : v) ? null : "Este campo es obligatorio";

  const longitud = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };

  const emailRegex = /^\S+@\S+\.\S+$/;

  // El campo "email" admite usuario O correo.
  // Si trae "@", validamos formato email; si no, validamos como usuario (>=3).
  const validarIdentidad = (v) => {
    const base =
      requerido(v) || longitud(v, { min: 3, max: 100 });
    if (base) return base;
    const s = String(v).trim();
    if (s.includes("@") && !emailRegex.test(s)) return "Correo inválido";
    return null;
  };

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

  // Crear usuario admin por defecto (igual que en tu HTML)
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const exists = users.find(
        (u) => (u.user || "").toLowerCase() === "adminstuffies"
      );
      if (!exists) {
        users.push({
          name: "Administrador Stuffies",
          email: "adminstuffies@duoc.cl",
          user: "adminstuffies",
          pass: "1234",
          role: "admin",
          avatar:
            "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png",
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    } catch {}
  }, []);

  const getUsers = () => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const showMsg = (type, text) => setMsg({ type, text, show: true });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Validación de campos
    const fieldErrors = validarTodo({ email, pass });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      showMsg("danger", "Revisa los campos marcados en rojo.");
      return;
    }

    // 2) Autenticación
    const id = email.trim().toLowerCase();
    const users = getUsers();
    const found = users.find(
      (u) =>
        (u.user && u.user.toLowerCase() === id) ||
        (u.email && u.email.toLowerCase() === id)
    );

    if (!found || found.pass !== pass) {
      showMsg("danger", "Credenciales inválidas. Revisa tus datos.");
      return;
    }

    const avatar =
      found.avatar ||
      "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png";

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        user: found.user,
        name: found.name,
        email: found.email,
        avatar,
        role: found.role || "cliente",
        remember: !!remember,
      })
    );

    // Avisar a Header/otras pestañas que cambió la sesión
    window.dispatchEvent(new Event("session:updated"));

    if (found.role === "admin") {
      showMsg("success", "¡Bienvenido/a admin! Redirigiendo al panel…");
      setTimeout(() => navigate("/admin"), 500);
    } else {
      showMsg("success", `¡Bienvenido/a, ${found.name || found.user}! Redirigiendo…`);
      setTimeout(() => navigate("/"), 500);
    }
  };

  // Validación “en vivo” al tipear
  const onChangeEmail = (v) => {
    setEmail(v);
    setErrors((prev) => {
      const next = { ...prev };
      const err = validarIdentidad(v);
      if (err) next.email = err; else delete next.email;
      return next;
    });
  };

  const onChangePass = (v) => {
    setPass(v);
    setErrors((prev) => {
      const next = { ...prev };
      const err = validarPass(v);
      if (err) next.pass = err; else delete next.pass;
      return next;
    });
  };

  const cls = (name) => `form-control ${errors[name] ? "is-invalid" : ""}`;
  const Msg = ({ name, fallback }) =>
    errors[name] ? (
      <div className="invalid-feedback">{errors[name]}</div>
    ) : (
      // conserva tu bloque para mantener altura y layout
      fallback ? <div className="invalid-feedback d-none">{fallback}</div> : null
    );

  return (
    <main className="py-5 bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-7 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="mb-1">Iniciar Sesión</h2>
                  <p className="text-muted m-0">Ingresa a tu cuenta de STUFFIES</p>
                </div>

                <form id="loginForm" noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Usuario o correo electrónico
                    </label>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      className={cls("email")}
                      maxLength={100}
                      required
                      value={email}
                      onChange={(e) => onChangeEmail(e.target.value)}
                    />
                    {/* reemplazo por mensaje dinámico; dejo fallback invisible para no mover layout */}
                    <Msg
                      name="email"
                      fallback="Ingresa tu usuario o correo."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={cls("pass")}
                      minLength={4}
                      maxLength={10}
                      required
                      value={pass}
                      onChange={(e) => onChangePass(e.target.value)}
                    />
                    <Msg
                      name="pass"
                      fallback="Ingresa tu contraseña (4–10 caracteres)."
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <label className="d-flex align-items-center gap-2 m-0">
                      <input
                        type="checkbox"
                        name="remember"
                        id="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span>Recordarme</span>
                    </label>
                    <a href="#" className="text-decoration-none">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <button type="submit" className="btn btn-dark w-100">
                    Iniciar Sesión
                  </button>

                  {msg.show && (
                    <div
                      id="msg"
                      className={`alert alert-${msg.type} mt-3`}
                      role="alert"
                    >
                      {msg.text}
                    </div>
                  )}
                </form>

                <div className="mt-4 text-center">
                  <p className="m-0">
                    ¿No tienes una cuenta?{" "}
                    <Link to="/registro" className="text-decoration-none">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
