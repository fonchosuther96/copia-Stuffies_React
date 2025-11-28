// src/admin/pages/CategoriaNueva.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, addCategory } from "../../services/inventory.js";

export default function CategoriaNueva() {
  const navigate = useNavigate();
  const existentes = useMemo(() => getCategories().map((c) => c.toLowerCase()), []);

  const [nombre, setNombre] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const required = (v) => (typeof v === "string" ? v.trim() : v) ? null : "Campo obligatorio";
  const len = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };
  const validate = (v) => required(v) || len(v, { min: 3, max: 30 });

  const onSubmit = (e) => {
    e.preventDefault();
    const e1 = validate(nombre);
    if (e1) return setErr(e1);
    if (existentes.includes(nombre.trim().toLowerCase())) return setErr("La categoría ya existe");

    try {
      addCategory(nombre.trim());
      setOk(true);
      setTimeout(() => navigate("../categorias"), 600);
    } catch (error) {
      setErr(error.message || "Error al guardar");
    }
  };

  return (
    <div>
      <h2 className="mb-3">Nueva categoría</h2>
      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className={`form-control ${err ? "is-invalid" : ""}`}
                  placeholder="poleras / polerones…"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErr(""); setOk(false); }}
                  maxLength={30}
                />
                {err ? <div className="invalid-feedback">{err}</div> : <div className="invalid-feedback" />}
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary">Guardar</button>
                <Link to="../categorias" className="btn btn-outline-light">Volver</Link>
              </div>
              {ok && <div className="alert alert-success mt-2">Categoría creada. Redirigiendo…</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
