import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  // Cargar sesión al montar
  useEffect(() => {
    const storedSession = JSON.parse(localStorage.getItem("stuffies_session") || "null");
    if (!storedSession) {
      navigate("/login");
      return;
    }
    setSession(storedSession);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("stuffies_session");
    navigate("/login");
  };

  if (!session) return null;

  return (
    <main>
      <div className="container">
        <div className="profile-container">
          {/* Cabecera */}
          <div className="profile-header">
            <img
              src={session.avatar || "https://i.postimg.cc/qRdn8fDv/LOGO-ESTRELLA-SIMPLE-CON-ESTRELLITAS.png"}
              alt="Avatar"
            />
            <h2>{session.name || "Usuario"}</h2>
            <p className="text-muted">@{session.user || "usuario"}</p>
          </div>

          {/* Datos */}
          <dl className="row profile-data">
            <dt className="col-sm-4">Correo</dt>
            <dd className="col-sm-8">{session.email || "demo.Stuffies@gmail.com"}</dd>

            <dt className="col-sm-4">Usuario</dt>
            <dd className="col-sm-8">{session.user || "usuario"}</dd>
          </dl>

          {/* Botón cerrar sesión */}
          <div className="mt-4 text-center">
            <button className="btn btn-danger" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
