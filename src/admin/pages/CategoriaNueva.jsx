// src/admin/pages/CategoriaNueva.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories, addCategory } from "../../services/inventory.js";

export default function CategoriaNueva() {
  const navigate = useNavigate();

  const [existentes, setExistentes] = useState([]); // nombres de categorías en minúscula
  const [nombre, setNombre] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  // ======================
  // Cargar categorías existentes
  // ======================
  useEffect(() => {
    let alive = true;

    async function loadCats() {
      try {
        const cats = await getCategories(); // sirve si es sync o async
        if (!alive) return;

        const lista = Array.isArray(cats) ? cats : [];
        setExistentes(lista.map((c) => String(c).toLowerCase()));
      } catch (e) {
        console.error("Error cargando categorías:", e);
        if (alive) setExistentes([]);
      }
    }

    loadCats();
    return () => {
      alive = false;
    };
  }, []);

  // ======================
  // Validaciones
  // ======================
  const required = (v) =>
    (typeof v === "string" ? v.trim() : v) ? null : "Campo obligatorio";

  const len = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };

  const validate = (v) => required(v) || len(v, { min: 3, max: 30 });

  // ======================
  // Guardar
  // ======================
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);

    const e1 = validate(nombre);
    if (e1) {
      setErr(e1);
      return;
    }

    const normalizado = nombre.trim().toLowerCase();
    if (existentes.includes(normalizado)) {
      setErr("La categoría ya existe");
      return;
    }

    try {
      // Por si addCategory es async
      await addCategory(nombre.trim());

      setOk(true);
      setErr("");
      // Pequeña pausa para mostrar mensaje
      setTimeout(() => navigate("../categorias"), 600);
    } catch (error) {
      console.error(error);
      setErr(error?.message || "Error al guardar");
    }
  };

  // ======================
  // Render
  // ======================
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
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setErr("");
                    setOk(false);
                  }}
                  maxLength={30}
                />
                {err ? (
                  <div className="invalid-feedback">{err}</div>
                ) : (
                  <div className="invalid-feedback" />
                )}
              </div>

              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
                <Link to="../categorias" className="btn btn-outline-light">
                  Volver
                </Link>
              </div>

              {ok && (
                <div className="alert alert-success mt-2">
                  Categoría creada. Redirigiendo…
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
