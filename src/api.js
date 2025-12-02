import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptor que agrega el token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ← ESTE ES EL CORRECTO

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
