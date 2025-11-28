// src/main.jsx
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { publicRoutes } from "./routes/public.jsx";
import { adminRoutes } from "./routes/admin.jsx";

import "./assets/css/styles.css";

const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes,
  { path: "*", element: <Navigate to="/" replace /> },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
