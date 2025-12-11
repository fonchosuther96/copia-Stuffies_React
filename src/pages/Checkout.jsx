import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getCart, getCartTotals, clearCart } from "../services/cart.js";
import { createOrder } from "../services/orders.js";

export default function Checkout() {
  const navigate = useNavigate();

  const session = JSON.parse(localStorage.getItem("user") || "null");

  const [form, setForm] = useState({
    nombre: session?.nombre || "",
    apellidos: session?.apellido || "",
    email: session?.email || "",
    telefono: "",
    direccion: session?.direccion || "",
    comuna: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(null);

  const cart = getCart();
  const totals = getCartTotals();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ============================
  // Validaciones
  // ============================
  const rules = {
    nombre: v => !v.trim() ? "Ingresa tu nombre" : "",
    apellidos: v => !v.trim() ? "Ingresa tus apellidos" : "",
    email: v => /^\S+@\S+\.\S+$/.test(v) ? "" : "Correo inválido",
    telefono: v =>
      /^(\+?56\s?9\d{8}|9\d{8})$/.test(v.trim())
        ? ""
        : "Formato válido: +569XXXXXXXX",
    direccion: v => v.trim().length < 5 ? "Dirección muy corta" : "",
    comuna: v => v.trim().length < 3 ? "Ingresa tu comuna" : "",
  };

  const validateAll = () => {
    const e = {};
    Object.keys(rules).forEach(k => {
      const msg = rules[k](form[k] || "");
      if (msg) e[k] = msg;
    });
    return e;
  };

  const setField = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      setErrors(er => ({ ...er, [name]: rules[name](value) }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const eAll = validateAll();
    setErrors(eAll);
    setTouched({
      nombre: true,
      apellidos: true,
      email: true,
      telefono: true,
      direccion: true,
      comuna: true,
    });

    if (Object.keys(eAll).length > 0) {
      setFlash({ type: "warning", text: "Revisa los datos ingresados." });
      return;
    }

    if (!cart.length) {
      setFlash({ type: "danger", text: "Tu carrito está vacío." });
      return;
    }

    const payload = {
      cliente: {
        nombre: form.nombre + " " + form.apellidos,
        email: form.email,
        direccion: `${form.direccion}, ${form.comuna}`,
        telefono: form.telefono,
      },
      items: cart.map(it => ({
        productId: it.id,
        talla: it.talla,
        color: it.color,
        precio: Number(it.precio),
        cantidad: Number(it.cantidad),
        imagen: it.imagen,
      })),
      total: totals.total,
      estado: "PAGADO",
      medioPago: "WEB",
    };

    try {
      setSaving(true);
      const res = await createOrder(payload);
      clearCart();
      navigate(`/exito?order=${res.id}`);
    } catch (err) {
      console.error(err);
      setFlash({
        type: "danger",
        text: "No se pudo procesar la compra. Intenta nuevamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const cls = name =>
    `form-control ${
      touched[name] && errors[name]
        ? "is-invalid"
        : touched[name]
        ? "is-valid"
        : ""
    }`;

  return (
    <main className="container my-5">
      <h2 className="mb-4">Checkout</h2>

      {flash && (
        <div className={`alert alert-${flash.type}`}>{flash.text}</div>
      )}

      <form onSubmit={onSubmit} className="card card-body bg-dark text-light">

        <h5 className="mb-3">Datos del comprador</h5>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              name="nombre"
              className={cls("nombre")}
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
            />
            <div className="invalid-feedback">{errors.nombre}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Apellidos</label>
            <input
              name="apellidos"
              className={cls("apellidos")}
              value={form.apellidos}
              onChange={(e) => setField("apellidos", e.target.value)}
            />
            <div className="invalid-feedback">{errors.apellidos}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo</label>
            <input
              type="email"
              name="email"
              className={cls("email")}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Teléfono</label>
            <input
              name="telefono"
              placeholder="+569XXXXXXXX"
              className={cls("telefono")}
              value={form.telefono}
              onChange={(e) => setField("telefono", e.target.value)}
            />
            <div className="invalid-feedback">{errors.telefono}</div>
          </div>

          <div className="col-md-8">
            <label className="form-label">Dirección</label>
            <input
              name="direccion"
              className={cls("direccion")}
              value={form.direccion}
              onChange={(e) => setField("direccion", e.target.value)}
            />
            <div className="invalid-feedback">{errors.direccion}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Comuna</label>
            <input
              name="comuna"
              className={cls("comuna")}
              value={form.comuna}
              onChange={(e) => setField("comuna", e.target.value)}
            />
            <div className="invalid-feedback">{errors.comuna}</div>
          </div>
        </div>

        <button className="btn btn-primary mt-4" disabled={saving}>
          {saving ? "Procesando..." : "Confirmar compra"}
        </button>
      </form>
    </main>
  );
}
