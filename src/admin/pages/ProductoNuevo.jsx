// src/admin/pages/ProductoNuevo.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; // 👈 usamos la API REST

export default function ProductoNuevo() {
  const navigate = useNavigate();

  // Estado del formulario
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    descripcion: "",
    imagen: "",
  });

  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);

  // Categorías dinámicas (ahora desde el backend)
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState("");

  // === Cargar categorías desde /api/products ===
  useEffect(() => {
    const loadCats = async () => {
      try {
        setCatsLoading(true);
        setCatsError("");

        const res = await api.get("/api/products");
        const list = (res.data || [])
          .map((p) => String(p.categoria || "").trim())
          .filter(Boolean);

        const unique = Array.from(new Set(list)).sort((a, b) =>
          a.localeCompare(b)
        );

        setCats(unique);

        // Si el formulario no tiene categoría válida, usar la primera
        setForm((f) =>
          unique.length && !unique.includes(f.categoria)
            ? { ...f, categoria: unique[0] }
            : f
        );
      } catch (err) {
        console.error(err);
        setCatsError("No se pudieron cargar las categorías.");
      } finally {
        setCatsLoading(false);
      }
    };

    loadCats();
  }, []);

  // === Validadores simples ===
  const required = (v, m = "Campo obligatorio") =>
    (typeof v === "string" ? v.trim() : v) ? null : m;

  const len = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };

  const isPrecio = (v) =>
    Number.isFinite(+v) && +v >= 0 ? null : "Precio inválido (usa números ≥ 0)";

  const isUrl = (v) =>
    /^(https?:\/\/)[^\s]+$/i.test(String(v || "").trim())
      ? null
      : "URL inválida (usa http/https)";

  const validate = (draft = form) => {
    const e = {};
    e.nombre = required(draft.nombre) || len(draft.nombre, { min: 3, max: 80 });

    if (!draft.categoria) {
      e.categoria = "Selecciona una categoría";
    } else if (cats.length && !cats.includes(draft.categoria)) {
      e.categoria = "La categoría no existe.";
    }

    e.precio = required(draft.precio) || isPrecio(draft.precio);
    e.descripcion =
      required(draft.descripcion) ||
      len(draft.descripcion, { min: 20, max: 400 });
    e.imagen = required(draft.imagen) || isUrl(draft.imagen);

    Object.keys(e).forEach((k) => e[k] == null && delete e[k]);
    return e;
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    const next = { ...form, [id]: value };
    setForm(next);
    setErrors(validate(next));
    setOk(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const eAll = validate();
    setErrors(eAll);
    if (Object.keys(eAll).length) return;

    try {
      setSaving(true);

      // Mapeamos al modelo que espera el backend
      // Tu entidad tiene campos: nombre, categoria, precio, descripcion, imageUrl, stock, tallas, activo
      await api.post("/api/products", {
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        precio: Number(form.precio),
        descripcion: form.descripcion.trim(),
        imageUrl: form.imagen.trim(), // 👈 backend usa imageUrl (o lo mapea a image_url)
        stock: 0,                      // podrías agregar campo en el form si quieres
        tallas: "",                    // por ahora vacío
        activo: true,
      });

      setOk(true);
      setTimeout(() => navigate("../productos"), 600);
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        _global: "No se pudo guardar el producto. Intenta nuevamente.",
      }));
    } finally {
      setSaving(false);
    }
  };

  const cls = (k) => `form-control ${errors[k] ? "is-invalid" : ""}`;
  const Msg = ({ k }) =>
    errors[k] ? (
      <div className="invalid-feedback">{errors[k]}</div>
    ) : (
      <div className="invalid-feedback" />
    );

  return (
    <div>
      <h2 className="mb-3">Nuevo producto</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              {errors._global && (
                <div className="col-12">
                  <div className="alert alert-danger">{errors._global}</div>
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  className={cls("nombre")}
                  placeholder="Nombre del producto"
                  value={form.nombre}
                  onChange={onChange}
                  maxLength={80}
                />
                <Msg k="nombre" />
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="categoria">
                  Categoría
                </label>
                <select
                  id="categoria"
                  className={cls("categoria").replace("form-control", "form-select")}
                  value={form.categoria}
                  onChange={onChange}
                  disabled={catsLoading || cats.length === 0}
                >
                  {catsLoading ? (
                    <option value="">Cargando categorías…</option>
                  ) : cats.length === 0 ? (
                    <option value="">(Sin categorías)</option>
                  ) : (
                    cats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  )}
                </select>
                {catsError && (
                  <div className="text-warning small mt-1">{catsError}</div>
                )}
                <Msg k="categoria" />
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="precio">
                  Precio
                </label>
                <input
                  id="precio"
                  className={cls("precio")}
                  placeholder="39990"
                  inputMode="numeric"
                  value={form.precio}
                  onChange={onChange}
                />
                <Msg k="precio" />
              </div>

              <div className="col-md-12">
                <label className="form-label" htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  className={cls("descripcion")}
                  rows={4}
                  placeholder="Descripción corta..."
                  value={form.descripcion}
                  onChange={onChange}
                  maxLength={400}
                />
                <Msg k="descripcion" />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="imagen">
                  Imagen
                </label>
                <input
                  id="imagen"
                  className={cls("imagen")}
                  placeholder="https://..."
                  value={form.imagen}
                  onChange={onChange}
                />
                <Msg k="imagen" />
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={catsLoading || saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <Link to="../productos" className="btn btn-outline-light">
                  Cancelar
                </Link>
              </div>

              {ok && (
                <div className="col-12">
                  <div className="alert alert-success mt-2">
                    Producto guardado correctamente.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
