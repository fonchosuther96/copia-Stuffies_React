// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // user = { username, token, roles }

  // Al montar la app, intenta recuperar sesión desde localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const roles = localStorage.getItem("roles");

    if (token && username && roles) {
      setUser({
        token,
        username,
        roles: JSON.parse(roles), // se guardan como string
      });
    }
  }, []);

  const login = (data) => {
    // data viene del backend: { token, username, roles }
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    localStorage.setItem("roles", JSON.stringify(data.roles));

    setUser({
      token: data.token,
      username: data.username,
      roles: data.roles,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("roles");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
