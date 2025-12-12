// src/admin/pages/ProductoNuevo.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api"; // API REST base
import { updateVariants } from "../../services/inventory.js";

const SIZE_ORDER = ["S", "M", "L", "XL", "Única"];

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

  // Variantes (talla + stock)
  const [variants, setVariants] = useState([]);
  const [variantsError, setVariantsError] = useState("");

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

  // === Helpers ===
  const sortVariants = (list) => {
    return [...list].sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.talla);
      const ib = SIZE_ORDER.indexOf(b.talla);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  };

  const hasUnica = variants.some((v) => v.talla === "Única");
  const hasOtherSizes = variants.some(
    (v) => v.talla && v.talla !== "Única"
  );

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
    e.nombre =
      required(draft.nombre) || len(draft.nombre, { min: 3, max: 80 });

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

  const validateVariants = (list = variants) => {
    if (!list.length) return ""; // tallas opcionales

    // Regla Única: o solo Única, o solo S/M/L/XL
    const hasUni = list.some((v) => v.talla === "Única");
    const hasOthers = list.some(
      (v) => v.talla && v.talla !== "Única"
    );
    if (hasUni && hasOthers) {
      return "No puedes mezclar talla Única con otras tallas.";
    }

    for (const v of list) {
      if (!v.talla || String(v.talla).trim() === "") {
        return "Todas las tallas deben tener un valor.";
      }
      if (Number.isNaN(Number(v.stock)) || Number(v.stock) < 0) {
        return "El stock por talla debe ser un número mayor o igual a 0.";
      }
    }

    return "";
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    const next = { ...form, [id]: value };
    setForm(next);
    setErrors(validate(next));
    setOk(false);
  };

  // === Handlers de tallas ===
  const onVariantChange = (index, field, value) => {
    let next = variants.map((v, i) =>
      i === index
        ? {
            ...v,
            [field]:
              field === "stock"
                ? Math.max(0, Number(value) || 0)
                : value,
          }
        : v
    );

    // Reglas para talla Única
    if (field === "talla") {
      const nuevaTalla = value;

      if (nuevaTalla === "Única") {
        // Solo dejamos una fila con Única
        const stockActual = Math.max(
          0,
          Number(next[index]?.stock) || 0
        );
        next = [{ talla: "Única", stock: stockActual }];
      } else {
        // Quitamos cualquier fila que sea Única distinta de esta
        next = next.filter(
          (v, i) => !(v.talla === "Única" && i !== index)
        );
      }

      next = sortVariants(next);
    }

    setVariants(next);
    setVariantsError("");
  };

  const adjustVariantStock = (index, delta) => {
    const next = variants.map((v, i) =>
      i === index
        ? {
            ...v,
            stock: Math.max(0, Number(v.stock || 0) + delta),
          }
        : v
    );
    setVariants(next);
    setVariantsError("");
  };

  const onAddVariant = () => {
    if (hasUnica) return; // no agregar más si ya hay Única

    setVariants(
      sortVariants([
        ...variants,
        { talla: "", stock: 0 },
      ])
    );
    setVariantsError("");
  };

  const onRemoveVariant = (index) => {
    const next = variants.filter((_, i) => i !== index);
    setVariants(next);
    setVariantsError("");
  };

  // === Submit ===
  const onSubmit = async (e) => {
    e.preventDefault();
    const eAll = validate();
    setErrors(eAll);

    const vErr = validateVariants();
    setVariantsError(vErr);

    if (Object.keys(eAll).length || vErr) return;

    try {
      setSaving(true);

      const totalStock = variants.reduce(
        (acc, v) => acc + (Number(v.stock) || 0),
        0
      );
      const tallasStr = variants
        .map((v) => v.talla)
        .filter(Boolean)
        .join(",");

      // Crear producto base
      const res = await api.post("/api/products", {
        nombre: form.nombre.trim(),
        categoria: form.categoria.trim(),
        precio: Number(form.precio),
        descripcion: form.descripcion.trim(),
        imageUrl: form.imagen.trim(),
        stock: totalStock,
        tallas: tallasStr,
        activo: true,
      });

      const created = res.data;

      // Crear variantes si existen
      if (created?.id && variants.length) {
        await updateVariants(
          created.id,
          variants.map((v) => ({
            id: null,
            talla: String(v.talla).trim(),
            stock: Math.max(0, Number(v.stock) || 0),
          }))
        );
      }

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
                  <div className="alert alert-danger">
                    {errors._global}
                  </div>
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
                  className={cls("categoria").replace(
                    "form-control",
                    "form-select"
                  )}
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
                  <div className="text-warning small mt-1">
                    {catsError}
                  </div>
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

              {/* =========================
                  BLOQUE STOCK POR TALLA
                 ========================= */}
              <div className="col-12 mt-3">
                <h5>Stock por talla</h5>

                {variantsError && (
                  <div className="alert alert-danger py-2">
                    {variantsError}
                  </div>
                )}

                <div className="table-responsive">
                  <table className="table table-dark table-sm align-middle mb-2">
                    <thead>
                      <tr>
                        <th style={{ width: "40%" }}>Talla</th>
                        <th
                          style={{ width: "35%" }}
                          className="text-center"
                        >
                          Stock
                        </th>
                        <th
                          style={{ width: "25%" }}
                          className="text-center"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, idx) => (
                        <tr key={idx}>
                          <td>
                            <select
                              className="form-select"
                              value={v.talla ?? ""}
                              onChange={(e) =>
                                onVariantChange(idx, "talla", e.target.value)
                              }
                            >
                              <option value="">Selecciona talla</option>
                              {SIZE_ORDER.map((size) => {
                                const usedByOther = variants.some(
                                  (other, j) =>
                                    j !== idx &&
                                    other.talla === size
                                );

                                // Regla Única: si ya hay otras tallas,
                                // no permitir seleccionar Única (salvo que ya esté seleccionada aquí).
                                const disableUnica =
                                  size === "Única" &&
                                  hasOtherSizes &&
                                  v.talla !== "Única";

                                const disabled =
                                  usedByOther || disableUnica;

                                return (
                                  <option
                                    key={size}
                                    value={size}
                                    disabled={disabled}
                                  >
                                    {size}
                                  </option>
                                );
                              })}
                            </select>
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex align-items-center gap-2 justify-content-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                onClick={() =>
                                  adjustVariantStock(idx, -1)
                                }
                              >
                                −
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="form-control text-end"
                                style={{ maxWidth: "70px" }}
                                value={v.stock ?? 0}
                                onChange={(e) =>
                                  onVariantChange(
                                    idx,
                                    "stock",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                onClick={() =>
                                  adjustVariantStock(idx, +1)
                                }
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onRemoveVariant(idx)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}

                      {variants.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center text-muted">
                            No hay tallas definidas aún.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex gap-2 mb-3 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={onAddVariant}
                    disabled={hasUnica}
                  >
                    Añadir talla
                  </button>
                </div>
              </div>

              {/* Botones finales */}
              <div className="col-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={catsLoading || saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <Link
                  to="../productos"
                  className="btn btn-outline-light"
                >
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
