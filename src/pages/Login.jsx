// src/pages/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await api.post("/auth/login", {
        username,
        password,
      });

      const data = resp.data; // { token, username, role }
      login(data);

      const role = (data.role || "").toUpperCase();

      // ADMIN o VENDEDOR -> panel admin, resto -> home
      if (role === "ROLE_ADMIN" || role === "ROLE_VENDEDOR") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="login-page py-5"
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="container" style={{ maxWidth: "400px" }}>
        <h2 className="text-light mb-4 text-center">Iniciar sesión</h2>

        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-3"
          style={{
            backgroundColor: "#1e1e1e",
            border: "1px solid #444",
          }}
        >
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label text-light">Usuario</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-light">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-info fw-bold">
            Registrarse
          </Link>
        </p>

        <p className="mt-2 text-center">
          <Link to="/" className="text-secondary">
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}
