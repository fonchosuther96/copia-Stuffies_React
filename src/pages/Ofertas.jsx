import ProductCard from "../components/ProductCard.jsx";
import { productos } from "../services/productos.js";

export default function Ofertas() {
  const ofertaItems = productos.filter(p => p.destacado);
  return (
    <main className="container my-5">
      <h2 className="mb-4">Ofertas</h2>
      {!ofertaItems.length ? (
        <p>No hay ofertas disponibles por ahora.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {ofertaItems.map(p => (
            <div key={p.id} className="col">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
