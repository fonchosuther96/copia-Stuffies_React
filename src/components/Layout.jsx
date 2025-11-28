// src/components/Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  const { pathname } = useLocation();

  // Oculta header/footer solo en la portada (Fondo)
  const hideChrome = pathname === "/" || pathname === "/fondo";

  return (
    <>
      {!hideChrome && <Header />}
      <Outlet />
      {!hideChrome && <Footer />}
    </>
  );
}
