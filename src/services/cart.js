// src/services/cart.js
import { productos } from "./productos.js";

const CART_KEY = "stuffies_cart_v1";

// -------- util --------
function readRaw() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeRaw(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

function num(n, d = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : d;
}

function pickImage(p) {
  return (
    p?.imagenHover ||
    p?.hover ||
    (Array.isArray(p?.galeria) && p.galeria[0]) ||
    p?.imagen ||
    null
  );
}

function sameVariant(a, b) {
  return a.id === b.id && a.talla === b.talla && a.color === b.color;
}

// -------- API --------
export function getCart() {
  return readRaw().map((it) => ({
    id: it.id,
    nombre: it.nombre ?? "",
    precio: num(it.precio, 0),
    imagen: it.imagen ?? null,
    cantidad: num(it.cantidad, 1),
    talla: it.talla ?? null,
    color: it.color ?? null,
  }));
}

export function setCart(items) {
  writeRaw(Array.isArray(items) ? items : []);
}

export function clearCart() {
  writeRaw([]);
}

/**
 * addToCart(producto, opts)
 * - Acepta el objeto completo del catálogo o { id }.
 * - Toma talla/color desde opts; si no vienen, usa producto.talla / producto.color.
 */
export function addToCart(producto, opts = {}) {
  if (!producto || typeof producto.id === "undefined") {
    throw new Error("addToCart: producto inválido");
  }

  // Fuente de verdad del catálogo
  const fromDB = productos.find((p) => p.id === Number(producto.id));
  const base = { ...(fromDB || {}), ...producto };

  const talla = opts.talla ?? producto.talla ?? null;
  const color = opts.color ?? producto.color ?? null;
  const cantidad = num(opts.cantidad ?? 1, 1);

  const item = {
    id: base.id,
    nombre: base.nombre || "",
    precio: num(base.precio, 0),
    imagen: pickImage(base),
    cantidad,
    talla,
    color,
  };

  const cart = getCart();
  const idx = cart.findIndex((it) => sameVariant(it, item));

  if (idx >= 0) {
    cart[idx].cantidad += item.cantidad;
  } else {
    cart.push(item);
  }

  writeRaw(cart);
}

export function updateQuantity(target, cantidad) {
  const qty = Math.max(1, num(cantidad, 1));
  const cart = getCart();
  const idx = cart.findIndex((it) => sameVariant(it, target));
  if (idx >= 0) {
    cart[idx].cantidad = qty;
    writeRaw(cart);
  }
}

export function removeFromCart(target) {
  const cart = getCart().filter((it) => !sameVariant(it, target));
  writeRaw(cart);
}

export function getCartTotals() {
  const items = getCart();
  const cantidad = items.reduce((acc, it) => acc + num(it.cantidad, 0), 0);
  const subtotal = items.reduce(
    (acc, it) => acc + num(it.precio, 0) * num(it.cantidad, 0),
    0
  );
  return { cantidad, subtotal };
}
