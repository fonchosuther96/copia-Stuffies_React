// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import { getAllLive, getCategories } from "../services/inventory.js";
import ProductCard from "../components/ProductCard.jsx";

const CLP = new Intl.NumberFormat("es-CL");

export default function Productos() {
  const [categoria, setCategoria] = useState("todos");
  const [precioMax, setPrecioMax] = useState(60000);

  const [items, setItems] = useState([]); // productos vivos
  const [cats, setCats] = useState([]);   // catálogo de categorías

  // Carga inicial + mantenerse sincronizado con cambios globales
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const load = () => {
      setItems(getAllLive());
      setCats(getCategories());
    };
    load();

    const onStorage = (e) => {
      if (e.key === "stuffies_inventory_v1" || e.key === "stuffies_categories_v1") load();
    };
    const onUpdated = () => load();

    window.addEventListener("storage", onStorage);
    window.addEventListener("inventory:updated", onUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("inventory:updated", onUpdated);
    };
  }, []);

  // Opciones de categoría = catálogo ∪ categorías presentes en productos (sin duplicados)
  const categoriaOptions = useMemo(() => {
    const set = new Set(cats);
    for (const p of items) {
      if (p.categoria) set.add(p.categoria);
    }
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [cats, items]);

  // Filtrado por categoría y precio
  const dataFiltrada = useMemo(() => {
    return items.filter((p) => {
      const okCat = categoria === "todos" ? true : p.categoria === categoria;
      const okPrecio = Number(p.precio) <= Number(precioMax);
      return okCat && okPrecio;
    });
  }, [categoria, precioMax, items]);

  return (
    <main className="productos-page py-5">
      <div className="container">
        <h2 className="text-light mb-4">Todos los productos</h2>

        {/* Filtros */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label text-light">Categoría</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="todos">Todas</option>
              {categoriaOptions.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label text-light d-flex justify-content-between">
              <span>Precio máximo</span>
              <strong>${CLP.format(precioMax)}</strong>
            </label>
            <input
              type="range"
              className="form-range"
              min="10000"
              max="60000"
              step="5000"
              value={precioMax}
              onChange={(e) => setPrecioMax(parseInt(e.target.value, 10))}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="row g-4">
          {dataFiltrada.map((p) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
          {dataFiltrada.length === 0 && (
            <div className="text-center text-secondary py-5">
              No encontramos productos con los filtros seleccionados.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
