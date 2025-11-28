import { Navigate, Outlet } from "react-router-dom";

export default function RequireAdmin() {
  const session = JSON.parse(localStorage.getItem("stuffies_session") || "null");
  if (!session || session.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
