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
import Reportes from "../admin/pages/Reportes.jsx"; // reportes globales o de productos

// Categorías
import CategoriasList from "../admin/pages/CategoriasList.jsx";
import CategoriaNueva from "../admin/pages/CategoriaNueva.jsx";

// Usuarios
import UsuariosList from "../admin/pages/UsuariosList.jsx";
import UsuarioEditar from "../admin/pages/UsuarioEditar.jsx";
import HistorialCompras from "../admin/pages/HistorialCompras.jsx";

// Perfil
import Perfil from "../admin/pages/Perfil.jsx";

export const adminRoutes = [
  {
    path: "/admin",
    // 👇 Aquí protegemos TODO el layout admin
    element: (
      <ProtectedRoute roles={["ROLE_ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      // Home / Dashboard
      { index: true, element: <Dashboard /> },

      // Órdenes
      { path: "ordenes", element: <Ordenes /> },
      { path: "boleta/:id", element: <Boleta /> },

      // Productos
      { path: "productos", element: <ProductosList /> },
      { path: "productos/nuevo", element: <ProductoNuevo /> },
      { path: "productos/editar/:id", element: <ProductoEditar /> },
      { path: "productos/criticos", element: <ProductosCriticos /> },

      // Reportes
      { path: "reportes", element: <Reportes /> },

      // Categorías
      { path: "categorias", element: <CategoriasList /> },
      { path: "categorias/nueva", element: <CategoriaNueva /> },

      // Usuarios
      { path: "usuarios", element: <UsuariosList /> },
      { path: "usuarios/editar/:id", element: <UsuarioEditar /> },
      { path: "historial/:id", element: <HistorialCompras /> },

      // Perfil
      { path: "perfil", element: <Perfil /> },

      // Fallback opcional
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
];
