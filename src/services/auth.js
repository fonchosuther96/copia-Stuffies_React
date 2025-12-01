// src/services/auth.js
import api from "../api";

const SESSION_KEY = "stuffies_session";
const TOKEN_KEY = "token";

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
  // guardamos toda la info de la sesión
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));

  // además guardamos solo el token en una clave aparte
  // para que api.js pueda leerlo y ponerlo en Authorization
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  try {
    window.dispatchEvent(new Event("session:updated"));
  } catch {
    // ignorar
  }
}

// Borrar sesión
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);

  try {
    window.dispatchEvent(new Event("session:updated"));
  } catch {
    // ignorar
  }
}

// === LOGIN contra el backend Spring Boot ===
// Llama a POST http://localhost:8080/auth/login
export async function login({ username, password }) {
  const resp = await api.post("/auth/login", {
    username,
    password,
  });

  // El backend puede devolver:
  // { token, username, role }  o  { token, username, roles: ["ROLE_ADMIN", ...] }
  const { token, username: user, role, roles } = resp.data;

  // Normalizamos a un array 'roles'
  const normalizedRoles = Array.isArray(roles)
    ? roles
    : role
    ? [role]
    : [];

  const sessionData = {
    username: user,
    roles: normalizedRoles, // siempre array
    token,
  };

  setSession(sessionData);
  return sessionData;
}

// ---- Helpers extra útiles ----
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return { username: session.username, roles: session.roles || [] };
}

// ¿Es admin?
export function isAdmin() {
  const session = getSession();
  return Array.isArray(session?.roles) && session.roles.includes("ROLE_ADMIN");
}
