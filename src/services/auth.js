// src/services/authjs.js
import { apiClient } from "./apiClient";

const SESSION_KEY = "stuffies_session";

// Leer sesión desde localStorage
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// Guardar sesión y notificar cambios
export function setSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  try {
    window.dispatchEvent(new Event("session:updated"));
  } catch {
    // ignorar
  }
}

// Borrar sesión
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  try {
    window.dispatchEvent(new Event("session:updated"));
  } catch {
    // ignorar
  }
}

// === LOGIN contra el backend Spring Boot ===
// Llama a POST http://localhost:8080/api/auth/login
export async function login({ username, password }) {
  const resp = await apiClient.post("/api/auth/login", {
    username,
    password,
  });

  // resp: { token, user: { ... } }
  const sessionData = {
    ...resp.user,
    token: resp.token,
  };

  setSession(sessionData);
  return sessionData;
}
