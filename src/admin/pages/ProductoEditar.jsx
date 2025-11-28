// src/admin/pages/ProductoEditar.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getLiveById, updateProduct, getCategories } from "../../services/inventory.js";

export default function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    descripcion: "",
    imagen: "",
  });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // === CATEGORÍAS DINÁMICAS ===
  const [cats, setCats] = useState([]);

  // Cargar categorías del catálogo y reaccionar a cambios globales
  useEffect(() => {
    const loadCats = () => setCats(getCategories());
    loadCats();

    const onStorage = (e) => {
      if (e.key === "stuffies_categories_v1") loadCats();
    };
    const onUpdated = () => loadCats();

    window.addEventListener("storage", onStorage);
    window.addEventListener("inventory:updated", onUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("inventory:updated", onUpdated);
    };
  }, []);

  // Cargar datos del producto por id
  useEffect(() => {
    const p = getLiveById(id);
    if (!p) {
      setNotFound(true);
      return;
    }
    setForm({
      nombre: p.nombre || "",
      categoria: p.categoria || "",
      precio: String(p.precio ?? ""),
      descripcion: p.descripcion || "",
      imagen: p.imagen || "",
    });
  }, [id]);

  // Si la categoría del producto no está en el catálogo, la añadimos SOLO para el <select>
  const categoriaOptions = useMemo(() => {
    const set = new Set(cats);
    if (form.categoria && !set.has(form.categoria)) set.add(form.categoria);
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [cats, form.categoria]);

  // === Validadores ===
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
    e.categoria = required(draft.categoria, "Selecciona una categoría");
    e.precio = required(draft.precio) || isPrecio(draft.precio);
    e.descripcion =
      required(draft.descripcion) || len(draft.descripcion, { min: 20, max: 400 });
    e.imagen = required(draft.imagen) || isUrl(draft.imagen);

    Object.keys(e).forEach((k) => e[k] == null && delete e[k]);
    return e;
  };

  const onChange = (e) => {
    const { id: key, value } = e.target;
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors(validate(next));
    setOk(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const eAll = validate();
    setErrors(eAll);
    if (Object.keys(eAll).length) return;

    updateProduct(id, {
      nombre: form.nombre,
      categoria: form.categoria,
      precio: form.precio,
      descripcion: form.descripcion,
      imagen: form.imagen,
    });

    setOk(true);
    setTimeout(() => navigate("../productos"), 600);
  };

  const cls = (k) => `form-control ${errors[k] ? "is-invalid" : ""}`;
  const Msg = ({ k }) =>
    errors[k] ? <div className="invalid-feedback">{errors[k]}</div> : <div className="invalid-feedback" />;

  if (notFound) {
    return (
      <div className="alert alert-warning">
        No se encontró el producto #{id}.{" "}
        <Link to="../productos" className="alert-link">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3">Editar producto #{id}</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <form noValidate onSubmit={onSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  className={cls("nombre")}
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Nombre del producto"
                  maxLength={80}
                />
                <Msg k="nombre" />
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="categoria">Categoría</label>
                <select
                  id="categoria"
                  className={cls("categoria").replace("form-control", "form-select")}
                  value={form.categoria}
                  onChange={onChange}
                >
                  <option value="">Seleccione…</option>
                  {categoriaOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Msg k="categoria" />
              </div>

              <div className="col-md-3">
                <label className="form-label" htmlFor="precio">Precio</label>
                <input
                  id="precio"
                  className={cls("precio")}
                  value={form.precio}
                  onChange={onChange}
                  inputMode="numeric"
                  placeholder="39990"
                />
                <Msg k="precio" />
              </div>

              <div className="col-md-12">
                <label className="form-label" htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  className={cls("descripcion")}
                  rows={4}
                  value={form.descripcion}
                  onChange={onChange}
                  placeholder="Descripción corta..."
                  maxLength={400}
                />
                <Msg k="descripcion" />
              </div>

              <div className="col-md-6">
                <label className="form-label" htmlFor="imagen">Imagen</label>
                <input
                  id="imagen"
                  className={cls("imagen")}
                  value={form.imagen}
                  onChange={onChange}
                  placeholder="https://..."
                />
                <Msg k="imagen" />
              </div>

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary">Actualizar</button>
                <Link to="../productos" className="btn btn-outline-light">Volver</Link>
              </div>

              {ok && (
                <div className="alert alert-success mt-2">
                  Producto actualizado correctamente.
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
