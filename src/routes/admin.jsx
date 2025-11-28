// src/routes/admin.jsx (o .js)
import { Navigate } from "react-router-dom";
import AdminLayout from "../admin/AdminLayout.jsx";

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
import Reportes from "../admin/pages/Reportes.jsx"; // (reportes globales o de productos)

// Categorías
import CategoriasList from "../admin/pages/CategoriasList.jsx";
import CategoriaNueva from "../admin/pages/CategoriaNueva.jsx";
import CategoriaEditar from "../admin/pages/CategoriaEditar.jsx";

// Usuarios
import UsuariosList from "../admin/pages/UsuariosList.jsx";
import UsuarioNuevo from "../admin/pages/UsuarioNuevo.jsx";
import UsuarioEditar from "../admin/pages/UsuarioEditar.jsx";
import HistorialCompras from "../admin/pages/HistorialCompras.jsx";

// Perfil
import Perfil from "../admin/pages/Perfil.jsx";

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
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
      { path: "categorias/editar/:id", element: <CategoriaEditar /> },

      // Usuarios
      { path: "usuarios", element: <UsuariosList /> },
      { path: "usuarios/nuevo", element: <UsuarioNuevo /> },
      { path: "usuarios/editar/:id", element: <UsuarioEditar /> },
      { path: "historial/:id", element: <HistorialCompras /> },

      // Perfil
      { path: "perfil", element: <Perfil /> },

      // Fallback opcional interno de /admin
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
];
