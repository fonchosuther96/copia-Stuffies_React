// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // luego cambiaremos a la IP de AWS EC2
});

// Interceptor: antes de cada request, adjunta el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
