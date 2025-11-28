const CRITICOS = [
  { id: 2, nombre: "Stella Zip Hoodie", stock: 2 },
  { id: 5, nombre: "Star Player Black", stock: 1 },
  { id: 8, nombre: "Hoodie Brown Dice", stock: 0 },
];

export default function ProductosCriticos() {
  return (
    <div>
      <h2 className="mb-3">Listado de productos críticos</h2>

      <ul className="list-group list-group-flush">
        {CRITICOS.map(p => (
          <li key={p.id} className="list-group-item bg-dark text-light d-flex justify-content-between">
            <span>#{p.id} — {p.nombre}</span>
            <span className={`badge ${p.stock === 0 ? "bg-danger" : "bg-warning text-dark"}`}>
              Stock: {p.stock}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
