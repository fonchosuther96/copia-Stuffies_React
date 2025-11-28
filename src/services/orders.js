// src/services/orders.js
const ORDERS_KEY = "stuffies_orders_v1";

// ========== Utilidades ==========
function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  try {
    window.dispatchEvent(new Event("orders:updated"));
  } catch {}
}

function genId() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `BOL-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`;
}

function calcTotals(items = []) {
  // items: [{ id, nombre, precio, cantidad, talla?, color?, imagen? }]
  let subtotal = 0;
  for (const it of items) {
    subtotal += (it.precio || 0) * (it.cantidad || 0);
  }
  const impuestos = 0;
  const total = subtotal + impuestos;
  return { subtotal, impuestos, total };
}

// ========== API pública ==========
export function listOrders() {
  // más recientes primero
  return loadAll().sort((a, b) => new Date(b.fechaISO) - new Date(a.fechaISO));
}

export function getOrderById(id) {
  return loadAll().find((o) => o.id === id) || null;
}

/**
 * Crea una orden/boleta a partir de items de carrito + datos de cliente.
 * @param {Object} payload
 *  - cliente: { nombre, rut?, email?, direccion? }
 *  - items:   [{ id, nombre, precio, cantidad, talla?, color?, imagen? }]
 *  - pago:    { metodo?: 'efectivo'|'debito'|'credito'|'transferencia', transaccionId?: string }
 *  - meta:    { nota?: string }
 *  - estado:  'Pagado' | 'Enviado' | 'Pendiente' | 'Cancelado' (default: 'Pagado')
 * @returns id de la boleta creada
 */
export function createOrder(payload) {
  const now = new Date();
  const id = genId();
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const totals = calcTotals(items);

  const orden = {
    id,
    fechaISO: now.toISOString(),
    fechaLocal: now.toLocaleString("es-CL"),
    cliente: payload?.cliente || { nombre: "Cliente" },
    items,
    totals,
    pago: payload?.pago || { metodo: "desconocido" },
    meta: payload?.meta || {},
    estado: payload?.estado || "Pagado",
  };

  const all = loadAll();
  all.push(orden);
  saveAll(all);
  return id;
}

// Permite actualizar el estado (opcional).
export function updateOrderStatus(id, nuevoEstado) {
  const all = loadAll();
  const idx = all.findIndex((o) => o.id === id);
  if (idx >= 0) {
    all[idx].estado = nuevoEstado;
    saveAll(all);
    return true;
  }
  return false;
}
