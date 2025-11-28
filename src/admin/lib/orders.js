// src/admin/lib/orders.js
const KEY = "orders";

export function loadOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveOrders(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr || []));
}

export function seedOrdersIfEmpty() {
  const now = new Date();
  let orders = loadOrders();
  if (orders.length) return;

  const sample = (d, total, items) => ({
    id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    date: d.toISOString(),
    total,
    items, // [{ id, nombre, precio, cantidad, categoria }]
  });

  const daysAgo = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 12, 0, 0);

  orders = [
    sample(daysAgo(0), 55990, [{ id: 3, nombre: "Stella Chroma Zip Hoodie", precio: 55990, cantidad: 1, categoria: "polerones" }]),
    sample(daysAgo(1), 39990, [{ id: 1, nombre: "Hoodie White Dice", precio: 39990, cantidad: 1, categoria: "polerones" }]),
    sample(daysAgo(2), 48980, [
      { id: 4, nombre: "Boxy-Slim White Tee", precio: 22990, cantidad: 1, categoria: "poleras" },
      { id: 5, nombre: "Boxy-Slim Black Tee", precio: 25990, cantidad: 1, categoria: "poleras" },
    ]),
  ];

  saveOrders(orders);
}
