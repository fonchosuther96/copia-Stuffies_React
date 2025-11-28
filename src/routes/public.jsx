// src/routes/public.jsx
import { Navigate } from "react-router-dom";

import Layout from "../components/Layout.jsx";
import Fondo from "../pages/Fondo.jsx";
import Home from "../pages/Home.jsx";
import Productos from "../pages/Productos.jsx";
import DetalleProducto from "../pages/DetalleProducto.jsx";
import Blogs from "../pages/Blogs.jsx";
import Nosotros from "../pages/Nosotros.jsx";
import Contacto from "../pages/Contacto.jsx";
import Login from "../pages/Login.jsx";
import Carrito from "../pages/Carrito.jsx";
import Registro from "../pages/Registro.jsx";
import Checkout from "../pages/Checkout.jsx";
import Exito from "../pages/Exito.jsx";
import Fallo from "../pages/Fallo.jsx";
import Categorias from "../pages/Categorias.jsx";
import Ofertas from "../pages/Ofertas.jsx";

export const publicRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      // Página inicial
      { index: true, element: <Fondo /> },

      // Catálogo
      { path: "home", element: <Home /> },
      { path: "productos", element: <Productos /> },
      { path: "detalle-producto/:id", element: <DetalleProducto /> },
      { path: "categorias", element: <Categorias /> },
      { path: "ofertas", element: <Ofertas /> },

      // Flujo de compra
      { path: "checkout", element: <Checkout /> },
      { path: "exito", element: <Exito /> },
      { path: "fallo", element: <Fallo /> },

      // Rutas antiguas de compra (mantienen compatibilidad)
      { path: "compra/ok/:id", element: <Exito /> },
      { path: "compra/error", element: <Fallo /> },

      // Contenido
      { path: "blogs", element: <Blogs /> },
      { path: "nosotros", element: <Nosotros /> },
      { path: "contacto", element: <Contacto /> },

      // Auth / usuario
      { path: "login", element: <Login /> },
      { path: "registro", element: <Registro /> },
      { path: "carrito", element: <Carrito /> },

      // Alias
      { path: "inicio", element: <Navigate to="/home" replace /> },
    ],
  },

  // Alias directo a la raíz (antes tenías /Fondo)
  {
    path: "/Fondo",
    element: <Navigate to="/" replace />,
  },
];
