// src/services/auth.js
import api from "../api";

// MISMAS CLAVES QUE AuthContext.jsx
const SESSION_KEY = "session";
const TOKEN_KEY = "token";

// Leer sesión
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

// Guardar sesión unificada
export function setSession(data) {
  if (!data) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    localStorage.setItem(TOKEN_KEY, data.token);
  }

  // notificar actualización
  window.dispatchEvent(new Event("session:updated"));
}

// Borrar sesión
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("session:updated"));
}

// === LOGIN contra backend ===
export async function login({ username, password }) {
  const resp = await api.post("/auth/login", { username, password });

  const { token, username: u, role, roles } = resp.data;

  // normalizar roles
  const normalizedRoles = Array.isArray(roles)
    ? roles
    : role
    ? [role]
    : [];

  const sessionData = {
    username: u,
    roles: normalizedRoles,
    token,
  };

  setSession(sessionData);
  return sessionData;
}

// Helpers
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getCurrentUser() {
  return getSession();
}

export function isAdmin() {
  const s = getSession();
  return s?.roles?.includes("ROLE_ADMIN") || false;
}
