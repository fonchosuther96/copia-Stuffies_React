import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function Exito() {
  const q = useQuery();
  const order = q.get("order");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="container my-5 text-center">
      <h2>¡Compra realizada con éxito!</h2>
      <p className="lead">Gracias por tu compra.</p>
      {order && (
        <p>
          Tu número de orden es <strong>{order}</strong>. Puedes ver la boleta en el panel de administración.
        </p>
      )}
      <div className="d-flex gap-2 justify-content-center">
        <Link to="/productos" className="btn btn-primary">Seguir comprando</Link>
        <Link to={order ? `/admin/boleta/${order}` : "/admin/ordenes"} className="btn btn-outline-dark">Ver boleta</Link>
      </div>
    </main>
  );
}
