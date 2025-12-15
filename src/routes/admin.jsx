// src/routes/admin.jsx
import { Navigate } from "react-router-dom";
import AdminLayout from "../admin/AdminLayout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Dashboard
import Dashboard from "../admin/pages/Dashboard.jsx";

// Órdenes / boletas
import Ordenes from "../admin/pages/Ordenes.jsx";
import Boleta from "../admin/pages/Boleta.jsx";

// Productos
import ProductosList from "../admin/pages/ProductosList.jsx";
import ProductoNuevo from "../admin/pages/ProductoNuevo.jsx";
import ProductoEditar from "../admin/pages/ProductoEditar.jsx";
import ProductosCriticos from "../admin/pages/ProductosCriticos.jsx";
import Reportes from "../admin/pages/Reportes.jsx";

// Categorías
import CategoriasList from "../admin/pages/CategoriasList.jsx";
import CategoriaNueva from "../admin/pages/CategoriaNueva.jsx";

// Usuarios
import UsuariosList from "../admin/pages/UsuariosList.jsx";
import UsuarioEditar from "../admin/pages/UsuarioEditar.jsx";
import HistorialCompras from "../admin/pages/HistorialCompras.jsx";



export const adminRoutes = [
  {
    path: "/admin",
    // ADMIN y VENDEDOR pueden entrar al panel
    element: (
      <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_VENDEDOR"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { index: true, element: <Dashboard /> },

      // Órdenes (ADMIN y VENDEDOR)
      { path: "ordenes", element: <Ordenes /> },
      { path: "boleta/:id", element: <Boleta /> },

      // Productos (listado)
      { path: "productos", element: <ProductosList /> },

      // SOLO ADMIN
      {
        path: "productos/nuevo",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <ProductoNuevo />
          </ProtectedRoute>
        ),
      },
      {
        path: "productos/editar/:id",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <ProductoEditar />
          </ProtectedRoute>
        ),
      },
      {
        path: "productos/criticos",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <ProductosCriticos />
          </ProtectedRoute>
        ),
      },

      // REPORTES (ADMIN y VENDEDOR)
      {
        path: "reportes",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_VENDEDOR"]}>
            <Reportes />
          </ProtectedRoute>
        ),
      },

      // Categorías (solo ADMIN)
      {
        path: "categorias",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <CategoriasList />
          </ProtectedRoute>
        ),
      },
      {
        path: "categorias/nueva",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <CategoriaNueva />
          </ProtectedRoute>
        ),
      },

      // Usuarios (solo ADMIN)
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <UsuariosList />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios/editar/:id",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <UsuarioEditar />
          </ProtectedRoute>
        ),
      },
      {
        path: "historial/:id",
        element: (
          <ProtectedRoute roles={["ROLE_ADMIN"]}>
            <HistorialCompras />
          </ProtectedRoute>
        ),
      },


      // Fallback
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
];
