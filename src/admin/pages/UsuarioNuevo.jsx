// src/admin/pages/UsuarioNuevo.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";

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

  const validate = () => {
    const e = {};

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
    if (!form.role.trim()) e.role = "Selecciona un tipo de usuario";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
    setErrors((er) => ({ ...er, [id]: "" }));
    setOk(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.post("/api/users", {
        run: form.run,
        name: form.name,
        lastName: form.last,
        email: form.email,
        username: form.user,
        password: form.pass,
        address: form.address,
        role: form.role, // admin | vendedor | cliente
        avatar:
          "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png",
      });

      setOk(true);

      setTimeout(() => {
        window.dispatchEvent(new Event("users:updated"));
        navigate("../usuarios");
      }, 700);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el usuario (API).");
    }
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
                <label className="form-label">RUN</label>
                <input id="run" maxLength={9} className={cls("run")} value={form.run} onChange={onChange} />
                {msg("run")}
              </div>

              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input id="name" className={cls("name")} value={form.name} onChange={onChange} />
                {msg("name")}
              </div>

              <div className="col-md-4">
                <label className="form-label">Apellidos</label>
                <input id="last" className={cls("last")} value={form.last} onChange={onChange} />
                {msg("last")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input id="email" type="email" className={cls("email")} value={form.email} onChange={onChange} />
                {msg("email")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Usuario</label>
                <input id="user" className={cls("user")} value={form.user} onChange={onChange} />
                {msg("user")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input id="pass" type="password" className={cls("pass")} value={form.pass} onChange={onChange} />
                {msg("pass")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Repite contraseña</label>
                <input id="pass2" type="password" className={cls("pass2")} value={form.pass2} onChange={onChange} />
                {msg("pass2")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Dirección</label>
                <input id="address" className={cls("address")} value={form.address} onChange={onChange} />
                {msg("address")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Tipo de usuario</label>
                <select id="role" className={`form-select ${errors.role ? "is-invalid" : ""}`} value={form.role} onChange={onChange}>
                  <option value="">Seleccione…</option>
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
                {msg("role")}
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary">Crear</button>
                <Link to="../usuarios" className="btn btn-outline-light">Volver</Link>
              </div>

              {ok && <div className="alert alert-success mt-2">Usuario creado correctamente.</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
