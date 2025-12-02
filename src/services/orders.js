import api from "../api";

// ===============================
// 1) Crear orden
// ===============================
export async function createOrder(payload) {
  const token = localStorage.getItem("stuffies_token");

  const res = await api.post("/api/orders", payload, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data;
}

// ===============================
// 2) Obtener TODAS las órdenes
// ===============================
export async function getAllOrders() {
  const token = localStorage.getItem("stuffies_token");

  const res = await api.get("/api/orders", {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data;
}

export const listOrders = getAllOrders;

// ===============================
// 3) Obtener 1 orden por ID
// ===============================
export async function getOrderById(id) {
  const token = localStorage.getItem("stuffies_token");

  const res = await api.get(`/api/orders/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  return res.data;
}
