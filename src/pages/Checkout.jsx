// src/pages/Checkout.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotals, clearCart } from "../services/cart.js";
import { createOrder } from "../services/orders.js";

const SESSION_KEY = "stuffies_session";
const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

// -------- Validadores --------
const rules = {
  nombre: (v) => {
    const val = String(v || "").trim();
    if (!val) return "Ingresa tu nombre completo.";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,60}$/.test(val))
      return "Solo letras/espacios (3–60).";
    return "";
  },
  direccion: (v) => {
    const val = String(v || "").trim();
    if (!val) return "Ingresa tu dirección.";
    if (!/^[\wÁÉÍÓÚÑáéíóúñ\s.\-#]{5,120}$/.test(val))
      return "Dirección inválida (5–120).";
    return "";
  },
  comuna: (v) => {
    const val = String(v || "").trim();
    if (!val) return "Ingresa tu comuna.";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,40}$/.test(val))
      return "Solo letras/espacios (3–40).";
    return "";
  },
  telefono: (v) => {
    const val = String(v || "").trim();
    if (!val) return "Ingresa tu teléfono.";
    // +569XXXXXXXX  |  56 9 XXXXXXXX  |  9XXXXXXXX
    if (!/^(\+?56\s?9\d{8}|9\d{8})$/.test(val))
      return "Formato válido: +569XXXXXXXX o 9XXXXXXXX.";
    return "";
  },
};

const validateAll = (form) => {
  const e = {};
  for (const k of Object.keys(rules)) {
    const msg = rules[k](form[k]);
    if (msg) e[k] = msg;
  }
  return e;
};

export default function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
    comuna: "",
    telefono: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);

  const cart = getCart();
  const totals = useMemo(() => getCartTotals(), [cart]);

  // scroll arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors((er) => ({ ...er, [name]: rules[name](value) }));
    }
  };

  const onChange = (e) => setField(e.target.name, e.target.value);

  const onBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((er) => ({ ...er, [name]: rules[name](value) }));
  };

  const cls = (name) =>
    `form-control ${
      touched[name] && errors[name]
        ? "is-invalid"
        : touched[name] && !errors[name]
        ? "is-valid"
        : ""
    }`;

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!cart.length) {
      setFlash({ type: "danger", text: "Tu carrito está vacío." });
      return;
    }

    // validar todo
    const eAll = validateAll(form);
    setErrors(eAll);
    setTouched({
      nombre: true,
      direccion: true,
      comuna: true,
      telefono: true,
    });

    if (Object.keys(eAll).length) {
      setFlash({
        type: "warning",
        text: "Revisa los campos marcados en rojo.",
      });
      return;
    }

    const session = getSession();

    const payload = {
      cliente: {
        // si más adelante guardas nombre/email en la sesión,
        // esto los usará automáticamente
        nombre: session?.nombre || session?.username || form.nombre,
        email: session?.email || "",
        direccion: `${form.direccion}, ${form.comuna}`,
        telefono: form.telefono,
      },
      items: cart.map((it) => ({
        productId: it.id,
        nombre: it.nombre,
        talla: it.talla,
        color: it.color,
        precio: Number(it.precio),
        cantidad: Number(it.cantidad),
        imagen: it.imagen,
      })),
      total: totals.subtotal ?? totals.total ?? 0,
      estado: "PAGADO",
      medioPago: "WEB",
    };

    try {
      setSaving(true);
      const res = await createOrder(payload); // 👈 ahora va al backend

      clearCart();

      const orderId = res?.id ?? res?.orderId ?? "";
      if (orderId) {
        navigate(`/exito?order=${encodeURIComponent(orderId)}`);
      } else {
        navigate("/exito");
      }
    } catch (err) {
      console.error(err);
      setFlash({
        type: "danger",
        text: "No se pudo registrar la compra. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalCLP = (totals.subtotal ?? totals.total ?? 0).toLocaleString(
    "es-CL"
  );

  return (
    <main className="container my-5">
      <h2 className="mb-4">Checkout</h2>

      {flash && (
        <div className={`alert alert-${flash.type}`} role="alert">
          {flash.text}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form
            noValidate
            onSubmit={onSubmit}
            className="card card-body bg-dark text-light"
          >
            <h5 className="mb-3">Datos de envío</h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" htmlFor="nombre">
                  Nombre completo *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  className={cls("nombre")}
                  value={form.nombre}
                  onChange={onChange}
                  onBlur={onBlur}
                  minLength={3}
                  maxLength={60}
                  autoComplete="name"
                  required
                />
                <div className="invalid-feedback">
                  {errors.nombre || " "}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label" htmlFor="direccion">
                  Dirección *
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  className={cls("direccion")}
                  value={form.direccion}
                  onChange={onChange}
                  onBlur={onBlur}
                  minLength={5}
                  maxLength={120}
                  autoComplete="address-line1"
                  required
                />
                <div className="invalid-feedback">
                  {errors.direccion || " "}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="comuna">
                  Comuna *
                </label>
                <input
                  id="comuna"
                  name="comuna"
                  className={cls("comuna")}
                  value={form.comuna}
                  onChange={onChange}
                  onBlur={onBlur}
                  minLength={3}
                  maxLength={40}
                  autoComplete="address-level2"
                  required
                />
                <div className="invalid-feedback">
                  {errors.comuna || " "}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="telefono">
                  Teléfono *
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  className={cls("telefono")}
                  value={form.telefono}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder="+569XXXXXXXX"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                />
                <div className="invalid-feedback">
                  {errors.telefono || " "}
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Procesando..." : "Confirmar compra"}
              </button>
              <button
                className="btn btn-outline-light"
                type="button"
                onClick={() => navigate("/carrito")}
              >
                Volver al carrito
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card card-body bg-dark-subtle">
            <h5 className="mb-3">Resumen</h5>

            {!cart.length ? (
              <p>No hay productos.</p>
            ) : (
              <>
                <ul className="list-group list-group-flush mb-3">
                  {cart.map((it, i) => (
                    <li
                      key={i}
                      className="list-group-item bg-transparent d-flex justify-content-between"
                    >
                      <span>
                        {it.nombre} × {it.cantidad}
                      </span>
                      <span>
                        $
                        {(Number(it.precio) * Number(it.cantidad)).toLocaleString(
                          "es-CL"
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${totalCLP}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
