// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://174.129.52.156:8080",
});

// 🔴 SIEMPRE leer el token actualizado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔴 Manejo global de 401 / 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // limpiar sesión corrupta
      localStorage.removeItem("token");
      localStorage.removeItem("session");
    }
    return Promise.reject(error);
  }
);

export default api;
