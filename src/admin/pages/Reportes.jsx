export default function Reportes() {
  return (
    <div>
      <h2 className="mb-3">Reportes</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Ventas por día</h5>
              <div className="text-secondary">[Gráfico de barras aquí]</div>
              <hr />
              <p className="mb-0 small text-secondary">* Visual demo</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-dark border-light h-100">
            <div className="card-body">
              <h5>Top categorías</h5>
              <div className="text-secondary">[Gráfico doughnut aquí]</div>
              <hr />
              <p className="mb-0 small text-secondary">* Visual demo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
