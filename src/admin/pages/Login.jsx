// src/pages/Loginjsx.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authjs";

function Loginjsx() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await login({ username, password });
      // session = { username, nombre, email, role, avatar, token }

      if (session.role === "ADMIN") {
        navigate("/admin"); // ajusta si tu ruta admin es otra
      } else {
        navigate("/"); // o "/home"
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ padding: "2rem" }}>
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: 320 }}>
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            type="text"
            placeholder="adminstuffies"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={{ width: "100%" }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ width: "100%" }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p style={{ marginTop: 16, fontSize: 12 }}>
        Prueba de backend: usuario <b>adminstuffies</b>, clave <b>1234</b>.
      </p>
    </div>
  );
}

export default Loginjsx;
