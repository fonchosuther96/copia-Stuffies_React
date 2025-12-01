// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado inicial: intentamos leer la sesión desde localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("session");
      if (!raw) return null;               // nada guardado todavía
      const parsed = JSON.parse(raw);
      // Validación mínima
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;                       // { username, role/roles, token }
    } catch (err) {
      console.error("[Auth] Error parseando session desde localStorage", err);
      return null;
    }
  });

  // Helper para guardar sesión
  const saveSession = (session) => {
    try {
      if (!session) {
        localStorage.removeItem("session");
      } else {
        localStorage.setItem("session", JSON.stringify(session));
      }
    } catch (err) {
      console.error("[Auth] Error guardando session en localStorage", err);
    }
  };

  // LOGIN: lo usamos desde Login.jsx
  const login = (data) => {
    // data debería traer: { token, username, roles } o { token, username, role }
    let roles = [];

    if (Array.isArray(data.roles)) {
      roles = data.roles;
    } else if (data.role) {
      roles = [data.role];
    }

    const session = {
      token: data.token,
      username: data.username,
      roles,                      // ← siempre manejamos array de roles
    };

    setUser(session);
    saveSession(session);
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    saveSession(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    roles: user?.roles || [],
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
