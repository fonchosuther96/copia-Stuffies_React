import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getLiveById,
  getCategories,
  updateProduct,
  updateVariants,
} from "../../services/inventory.js";

export default function ProductoEditar() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    precio: "",
    descripcion: "",
    imagen: "",
  });

  const [cats, setCats] = useState([]);
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState(false);

  // Variantes (stock por talla)
  const [variants, setVariants] = useState([]);
  const [variantsError, setVariantsError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [prod, listCats] = await Promise.all([
          getLiveById(id),
          getCategories(),
        ]);

        if (!prod) {
          setNotFound(true);
          return;
        }

        setForm({
          nombre: prod.nombre || "",
          categoria: prod.categoria || "",
          precio: prod.precio ?? "",
          descripcion: prod.descripcion || "",
          imagen: prod.imagen || "",
        });

        // cargamos variantes (stock por talla)
        setVariants(Array.isArray(prod.variants) ? prod.variants : []);

        setCats(Array.isArray(listCats) ? listCats : []);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // =========================
  //   VALIDACIONES
  // =========================

  const required = (v, m = "Campo obligatorio") =>
    (typeof v === "string" ? v.trim() : v) ? null : m;

  const len = (v, { min = 0, max = Infinity } = {}) => {
    const s = String(v ?? "").trim();
    if (s.length < min) return `Mínimo ${min} caracteres`;
    if (s.length > max) return `Máximo ${max} caracteres`;
    return null;
  };

  const isPrecio = (v) =>
    Number.isFinite(+v) && +v >= 0 ? null : "Precio inválido";

  const isUrl = (v) =>
    /^(https?:\/\/)[^\s]+$/i.test(String(v || "").trim())
      ? null
      : "URL inválida";

  const validate = (draft = form) => {
    const e = {};

    e.nombre = required(draft.nombre) || len(draft.nombre, { min: 3, max: 80 });

    if (!draft.categoria) {
      e.categoria = "Selecciona una categoría";
    } else if (
      Array.isArray(cats) &&
      cats.length &&
      !cats.includes(String(draft.categoria))
    ) {
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

  const validateVariants = () => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return "";
    }

    for (const v of variants) {
      if (!v.talla || String(v.talla).trim() === "") {
        return "Todas las tallas deben tener nombre.";
      }
      if (Number.isNaN(Number(v.stock)) || Number(v.stock) < 0) {
        return "El stock debe ser un número mayor o igual a 0.";
      }
    }
    return "";
  };

  // =========================
  //   HANDLERS FORM
  // =========================

  const onChange = (e) => {
    const { id, value } = e.target;
    const next = { ...form, [id]: value };
    setForm(next);
    setErrors(validate(next));
    setOk(false);
  };

  // =========================
  //   HANDLERS VARIANTES
  // =========================

  const onVariantChange = (index, field, value) => {
    const next = variants.map((v, i) =>
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
    setVariants([
      ...variants,
      { id: null, talla: "", stock: 0 },
    ]);
    setVariantsError("");
  };

  const onRemoveVariant = (index) => {
    const next = variants.filter((_, i) => i !== index);
    setVariants(next);
    setVariantsError("");
  };

  // =========================
  //   SUBMIT GENERAL
  // =========================

  const onSubmit = async (e) => {
    e.preventDefault();

    const eAll = validate();
    setErrors(eAll);

    const vError = validateVariants();
    setVariantsError(vError);

    if (Object.keys(eAll).length || vError) return;

    try {
      await updateProduct(id, {
        nombre: form.nombre,
        categoria: form.categoria,
        precio: form.precio,
        descripcion: form.descripcion,
        imagen: form.imagen,
      });

      await updateVariants(
        id,
        (variants || []).map((v) => ({
          id: v.id ?? null,
          talla: String(v.talla || "").trim(),
          stock: Math.max(0, Number(v.stock) || 0),
        }))
      );

      setOk(true);
      setTimeout(() => navigate("../productos"), 600);
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el producto / stock por talla.");
    }
  };

  const cls = (k) => `form-control ${errors[k] ? "is-invalid" : ""}`;
  const Msg = ({ k }) =>
    errors[k] ? (
      <div className="invalid-feedback">{errors[k]}</div>
    ) : (
      <div className="invalid-feedback" />
    );

  if (loading) return <p>Cargando producto #{id}...</p>;

  if (notFound) {
    return (
      <div>
        <h2>Producto no encontrado</h2>
        <p>No existe el producto con id {id}.</p>
        <Link to="../productos" className="btn btn-outline-primary">
          Volver
        </Link>
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
                <label htmlFor="nombre" className="form-label">
                  Nombre
                </label>
                <input
                  id="nombre"
                  className={cls("nombre")}
                  value={form.nombre}
                  onChange={onChange}
                  maxLength={80}
                />
                <Msg k="nombre" />
              </div>

              <div className="col-md-3">
                <label htmlFor="categoria" className="form-label">
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
                  disabled={cats.length === 0}
                >
                  <option value="">Selecciona categoría</option>
                  {cats.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Msg k="categoria" />
              </div>

              <div className="col-md-3">
                <label htmlFor="precio" className="form-label">
                  Precio
                </label>
                <input
                  id="precio"
                  className={cls("precio")}
                  value={form.precio}
                  onChange={onChange}
                />
                <Msg k="precio" />
              </div>

              <div className="col-md-12">
                <label htmlFor="descripcion" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  className={cls("descripcion")}
                  rows={4}
                  value={form.descripcion}
                  onChange={onChange}
                />
                <Msg k="descripcion" />
              </div>

              <div className="col-md-6">
                <label htmlFor="imagen" className="form-label">
                  Imagen
                </label>
                <input
                  id="imagen"
                  className={cls("imagen")}
                  value={form.imagen}
                  onChange={onChange}
                />
                <Msg k="imagen" />
              </div>

              {/* =========================
                  BLOQUE STOCK POR TALLA
                 ========================= */}
              <div className="col-12 mt-4">
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
                        <tr key={v.id ?? idx}>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={v.talla ?? ""}
                              onChange={(e) =>
                                onVariantChange(idx, "talla", e.target.value)
                              }
                            />
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex align-items-center gap-2 justify-content-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                onClick={() => adjustVariantStock(idx, -1)}
                                title="Restar 1"
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
                                onClick={() => adjustVariantStock(idx, +1)}
                                title="Sumar 1"
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
                    className="btn btn-sm btn-outline-light"
                    onClick={onAddVariant}
                  >
                    Añadir talla
                  </button>
                </div>
              </div>

              {/* Botones principales del formulario */}
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Guardar cambios
                </button>
                <Link to="../productos" className="btn btn-outline-light">
                  Cancelar
                </Link>
              </div>

              {ok && (
                <div className="alert alert-success mt-2">
                  Producto y stock actualizados correctamente.
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
