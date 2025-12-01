// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles }) {
  const { user } = useContext(AuthContext);

  // 👇 DEBUG: ver qué ve realmente este componente
  console.log("[ProtectedRoute] user =", user, "roles requeridos =", roles);

  // Si no hay usuario logueado → mandamos a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles, validamos que el usuario tenga al menos uno
  if (roles && roles.length > 0) {
    // roles en user pueden venir como ["ROLE_ADMIN"] o [{ authority: "ROLE_ADMIN" }]
    const userRoles =
      user.roles?.map((r) => (typeof r === "string" ? r : r.authority)) || [];

    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return (
        <div className="container py-5">
          <h2>No tienes permiso para ver esta página</h2>
          <p>Si crees que esto es un error, contacta al administrador.</p>
        </div>
      );
    }
  }

  // Si pasó todas las validaciones → renderizamos la ruta protegida
  return children;
}
