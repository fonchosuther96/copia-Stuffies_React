// src/pages/Fondo.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../assets/css/styles.css";

export default function Fondo() {
  const navigate = useNavigate();

  // Debug: confirmar montaje del Fondo
  useEffect(() => {
    console.log("[FONDO] montado ✅");
  }, []);

  // Click o Enter → ir a /home
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Enter") navigate("/home"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <main className="landing-hero">
      <div className="overlay" onClick={() => navigate("/home")} />

      <div className="content">
        <div className="logo-container">
          <img
            className="logo"
            src="https://i.postimg.cc/R0phZ77L/ESTRELLA-BLANCA.png"
            alt="Stuffies logo"
          />
          <h1 className="brand-name">Stuffies</h1>
        </div>

        <div className="btn-container">
          <Link to="/home" className="btn btn-home">Home</Link>
          <Link to="/productos" className="btn btn-productos">Productos</Link>
        </div>
      </div>
    </main>
  );
}
