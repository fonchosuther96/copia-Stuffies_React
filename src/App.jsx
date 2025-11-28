/* inicio comentario

//// src/App.jsx
import { useRoutes, useLocation, Navigate } from "react-router-dom";
import { publicRoutes } from "./routes/public";
import { adminRoutes } from "./routes/admin";

function PathDebug() {
  const { pathname } = useLocation();
  console.log("[PATH]", pathname);
  return (
    <div style={{ position: "fixed", opacity: 0, pointerEvents: "none" }}>
      {pathname}
    </div>
  );
}

export default function App() {
  // combinamos las rutas públicas y admin
  const routes = [
    ...publicRoutes,
    ...adminRoutes,
    { path: "*", element: <Navigate to="/" replace /> }, // fallback global
  ];

  const element = useRoutes(routes);

  return (
    <>
      <PathDebug />
      {element}
    </>
  );
}


fin comentario*/