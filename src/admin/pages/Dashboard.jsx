import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h2 className="mb-3">Home / Dashboard</h2>

      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Ventas (7d)</small>
              <h3 className="m-0">$ 1.254.990</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Pedidos</small>
              <h3 className="m-0">42</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Ticket Promedio</small>
              <h3 className="m-0">$ 29.880</h3>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card bg-dark border-light">
            <div className="card-body">
              <small className="text-secondary">Productos Críticos</small>
              <h3 className="m-0">5</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 d-flex gap-2 flex-wrap">
        <Link className="btn btn-primary" to="../ordenes">Órdenes / Boletas</Link>
        <Link className="btn btn-outline-light" to="../productos">Productos</Link>
        <Link className="btn btn-outline-light" to="../usuarios">Usuarios</Link>
        <Link className="btn btn-outline-light" to="../categorias">Categorías</Link>
        <Link className="btn btn-outline-light" to="../reportes">Reportes</Link>
      </div>
    </div>
  );
}
