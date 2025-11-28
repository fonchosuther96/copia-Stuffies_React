import { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    comentario: "",
  });

  const [errors, setErrors] = useState({});
  const [enviado, setEnviado] = useState(false);

  // === Validadores simples (inline) ===
  const requerido = (v) =>
    (typeof v === "string" ? v.trim() : v) ? null : "Este campo es obligatorio";

  const emailValido = (v) =>
    !v || /^\S+@\S+\.\S+$/.test(String(v).trim()) ? null : "Correo inválido";

  const longitud = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };

  // Aplica las reglas a un objeto { campo: valor }
  const validar = (draft) => {
    const e = {};
    // nombre: requerido (min 3, max 100)
    e.nombre =
      requerido(draft.nombre) || longitud(draft.nombre, { min: 3, max: 100 });

    // correo: opcional, pero si viene debe ser válido y <=100
    e.correo =
      emailValido(draft.correo) ||
      (draft.correo ? longitud(draft.correo, { max: 100 }) : null);

    // comentario: requerido (min 10, max 500)
    e.comentario =
      requerido(draft.comentario) ||
      longitud(draft.comentario, { min: 10, max: 500 });

    // limpia las claves sin error (deja solo las que tienen mensaje)
    Object.keys(e).forEach((k) => e[k] == null && delete e[k]);
    return e;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    const next = { ...form, [id]: value };
    setForm(next);

    // Validación por campo al tipear (opcional pero útil)
    const fieldErrors = validar(next);
    setErrors(fieldErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldErrors = validar(form);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length) return;

    // Éxito
    setEnviado(true);
    setForm({ nombre: "", correo: "", comentario: "" });
    setTimeout(() => setEnviado(false), 3000);
  };

  // Helpers de clases y mensajes
  const cls = (name) => `form-control ${errors[name] ? "is-invalid" : ""}`;
  const Msg = ({ name }) =>
    errors[name] ? (
      <div className="invalid-feedback">{errors[name]}</div>
    ) : null;

  return (
    <main>
      {/* Hero */}
      <section className="hero py-5">
        <div className="container">
          <h2 className="text-white">Contacto</h2>
          <p className="lead">
            ¿Dudas o comentarios? Completa el formulario y te responderemos.
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-4">
        <div className="container">
          <div className="cardx">
            <form id="formContacto" onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-md-6 form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    className={cls("nombre")}
                    maxLength={100}
                    required
                    value={form.nombre}
                    onChange={handleChange}
                  />
                  <Msg name="nombre" />
                </div>

                <div className="col-md-6 form-group">
                  <label htmlFor="correo" className="form-label">
                    Correo (opcional)
                  </label>
                  <input
                    id="correo"
                    type="email"
                    className={cls("correo")}
                    maxLength={100}
                    placeholder="nombre@duoc.cl"
                    value={form.correo}
                    onChange={handleChange}
                  />
                  <Msg name="correo" />
                </div>

                <div className="col-12 form-group">
                  <label htmlFor="comentario" className="form-label">
                    Comentario
                  </label>
                  <textarea
                    id="comentario"
                    className={cls("comentario")}
                    rows={5}
                    maxLength={500}
                    required
                    value={form.comentario}
                    onChange={handleChange}
                  />
                  <Msg name="comentario" />
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Enviar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => {
                    setForm({ nombre: "", correo: "", comentario: "" });
                    setErrors({});
                  }}
                >
                  Limpiar
                </button>
              </div>

              {enviado && (
                <div id="okMsg" className="alert alert-success mt-3">
                  ¡Gracias! Te contactaremos pronto.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}