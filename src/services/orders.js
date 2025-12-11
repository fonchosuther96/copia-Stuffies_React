// src/services/orders.js
import api from "../api";

// Crear orden (checkout)
export async function createOrder(payload) {
  const res = await api.post("/api/orders", payload);
  return res.data;
}

// Obtener todas las órdenes (admin)
export async function getAllOrders() {
  const res = await api.get("/api/orders");
  return res.data;
}

export const listOrders = getAllOrders;

// Obtener una orden por ID
export async function getOrderById(id) {
  const res = await api.get(`/api/orders/${id}`);
  return res.data;
}
