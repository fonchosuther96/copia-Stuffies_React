export default function Perfil() {
  return (
    <div>
      <h2 className="mb-3">Perfil</h2>

      <div className="card bg-dark border-light">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input className="form-control" defaultValue="Administrador Stuffies" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Usuario</label>
              <input className="form-control" defaultValue="adminstuffies" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input className="form-control" defaultValue="adminstuffies@duoc.cl" />
            </div>

            <div className="col-12">
              <button className="btn btn-primary">Actualizar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
