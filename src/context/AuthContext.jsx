// src/context/AuthContext.jsx
import { createContext, useState } from "react";

export const AuthContext = createContext(null);

const SESSION_KEY = "session";
const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  // Estado inicial: intentamos leer la sesión desde localStorage
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null; // nada guardado todavía
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      // parsed debería ser { token, username, roles }
      return parsed;
    } catch (err) {
      console.error("[Auth] Error parseando session desde localStorage", err);
      return null;
    }
  });

  // Helper para guardar sesión en localStorage
  const saveSession = (session) => {
    try {
      if (!session) {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
      } else {
        // guardamos toda la sesión
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // y además solo el token en otra clave, para api.js
        if (session.token) {
          localStorage.setItem(TOKEN_KEY, session.token);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (err) {
      console.error("[Auth] Error guardando session en localStorage", err);
    }
  };

  // LOGIN: lo usamos desde Login.jsx
  // data viene del backend: { token, username, role } o { token, username, roles: [...] }
  const login = (data) => {
    let roles = [];

    if (Array.isArray(data.roles)) {
      roles = data.roles;
    } else if (data.role) {
      roles = [data.role];
    }

    const session = {
      token: data.token,
      username: data.username,
      roles, // siempre array
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
    isAdmin: user?.roles?.includes("ROLE_ADMIN") || false,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
