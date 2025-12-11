import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Exito() {
  const q = useQuery();
  const order = q.get("order");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="container my-5 text-center">
      <h2>¡Compra realizada con éxito!</h2>
      <p className="lead">Gracias por tu compra.</p>

      {order && (
        <div className="my-4">
          <p>
            Tu número de orden es <strong>{order}</strong>.
          </p>

          {/* 🔥 BOTÓN PARA VER LA BOLETA */}
          <Link to={`/boleta/${order}`} className="btn btn-success mt-2">
            Ver boleta de compra
          </Link>
        </div>
      )}

      <div className="d-flex gap-2 justify-content-center mt-4">
        <Link to="/productos" className="btn btn-primary">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}
