import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Fallo() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main className="container my-5 text-center">
      <h2>Pago no realizado</h2>
      <p className="lead">Ocurrió un problema al procesar el pago. Inténtalo nuevamente.</p>
      <div className="d-flex gap-2 justify-content-center">
        <Link to="/checkout" className="btn btn-primary">Reintentar</Link>
        <Link to="/carrito" className="btn btn-outline-dark">Volver al carrito</Link>
      </div>
    </main>
  );
}
