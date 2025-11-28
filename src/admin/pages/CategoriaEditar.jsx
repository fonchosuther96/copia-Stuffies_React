// src/admin/pages/CategoriaEditar.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAllLive, renameCategory } from "../../services/inventory.js";

export default function CategoriaEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  // categorías existentes desde inventario (seed + agregados)
  const existentes = useMemo(() => {
    const list = getAllLive();
    return Array.from(new Set(list.map((p) => p.categoria)))
      .filter(Boolean);
  }, []);

  // Determinar nombre original desde el param:
  // - si id coincide con nombre (slug/case-insensitive), úsalo
  // - si id es número, tomarlo como índice 1-based en la lista ordenada
  const original = useMemo(() => {
    const byName = existentes.find(
      (c) => String(c).toLowerCase() === String(id).toLowerCase()
    );
    if (byName) return byName;

    const sorted = [...existentes].sort((a, b) => a.localeCompare(b));
    const idx = Number.isFinite(+id) ? +id - 1 : -1;
    if (idx >= 0 && idx < sorted.length) return sorted[idx];

    return existentes[0] || "poleras"; // fallback
  }, [id, existentes]);

  const [nombre, setNombre] = useState(original);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setNombre(original);
    setErr("");
    setOk(false);
  }, [original]);

  // Validadores
  const required = (v) =>
    (typeof v === "string" ? v.trim() : v) ? null : "Campo obligatorio";
  const len = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };
  const validate = (v) => required(v) || len(v, { min: 3, max: 30 });

  const onSubmit = (e) => {
    e.preventDefault();

    // base
    const e1 = validate(nombre);
    if (e1) return setErr(e1);

    // unicidad si cambiaste el nombre
    const lower = nombre.trim().toLowerCase();
    const lowerOrig = String(original).trim().toLowerCase();
    if (
      lower !== lowerOrig &&
      existentes.some((c) => String(c).trim().toLowerCase() === lower)
    ) {
      return setErr("La categoría ya existe");
    }

    // renombrar en inventario
    if (lower !== lowerOrig) {
      renameCategory(original, nombre.trim());
      // opcional: avisar a listeners
      window.dispatchEvent(new Event("inventory:updated"));
    }

    setOk(true);
    setTimeout(() => navigate("../categorias"), 600);
  };

  return (
    <div>
      <h2 className="mb-3">Editar categoría #{id}</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className={`form-control ${err ? "is-invalid" : ""}`}
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
                <button className="btn btn-primary">Actualizar</button>
                <Link to="../categorias" className="btn btn-outline-light">
                  Volver
                </Link>
              </div>

              {ok && (
                <div className="alert alert-success mt-2">
                  Categoría actualizada. Redirigiendo…
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
