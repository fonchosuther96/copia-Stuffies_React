// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api"; // 👈 ahora usamos la API REST
import ProductCard from "../components/ProductCard.jsx";

const CLP = new Intl.NumberFormat("es-CL");

export default function Productos() {
  const [categoria, setCategoria] = useState("todos");
  const [precioMax, setPrecioMax] = useState(0); // 👈 se inicializa en 0, luego se ajusta

  const [items, setItems] = useState([]);   // productos desde backend
  const [error, setError] = useState("");   // para mostrar error si falla la API
  const [loading, setLoading] = useState(true);

  // Carga inicial desde la API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/api/products");

        // Si el backend devuelve un array directo:
        setItems(res.data || []);

        // Si fuera paginado tipo { content: [...] }, sería:
        // setItems(res.data.content || []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los productos. Intenta más tarde.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔹 Calcular precio mínimo y máximo reales
  const { minPrecio, maxPrecio } = useMemo(() => {
    if (!items.length) return { minPrecio: 0, maxPrecio: 0 };

    let min = Infinity;
    let max = 0;

    for (const p of items) {
      const precioNum = Number(p.precio) || 0;
      if (precioNum < min) min = precioNum;
      if (precioNum > max) max = precioNum;
    }

    if (min === Infinity) min = 0;

    return { minPrecio: min, maxPrecio: max };
  }, [items]);

  // 🔹 Cuando sepamos el máximo real, ponemos el slider en ese valor
  useEffect(() => {
    if (maxPrecio > 0) {
      setPrecioMax(maxPrecio);
    }
  }, [maxPrecio]);

  // Opciones de categoría = categorías presentes en productos (sin duplicados)
  const categoriaOptions = useMemo(() => {
    const set = new Set();

    for (const p of items) {
      if (p.categoria) set.add(p.categoria);
    }

    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // Filtrado por categoría y precio
  const dataFiltrada = useMemo(() => {
    return items.filter((p) => {
      const cat = p.categoria;
      const precio = Number(p.precio);

      const okCat = categoria === "todos" ? true : cat === categoria;

      // Si aún no tenemos maxPrecio calculado, no filtramos por precio
      if (maxPrecio === 0) {
        return okCat;
      }

      const limite = Number(precioMax || maxPrecio);
      const okPrecio = precio <= limite;

      return okCat && okPrecio;
    });
  }, [categoria, precioMax, items, maxPrecio]);

  if (loading) {
    return (
      <main className="productos-page py-5">
        <div className="container">
          <p className="text-light">Cargando productos...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="productos-page py-5">
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </main>
    );
  }

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
              <span>
                Precio máximo{" "}
                {minPrecio > 0 && maxPrecio > 0 && (
                  <small className="text-secondary ms-2">
                    ({CLP.format(minPrecio)} – {CLP.format(maxPrecio)})
                  </small>
                )}
              </span>
              <strong>
                {maxPrecio > 0 ? `$${CLP.format(precioMax)}` : "Sin filtro"}
              </strong>
            </label>
            <input
              type="range"
              className="form-range"
              min={minPrecio || 0}      // 👈 mínimo real
              max={maxPrecio || 0}      // 👈 máximo real
              step={5000}
              value={maxPrecio === 0 ? 0 : precioMax}
              disabled={maxPrecio === 0}
              onChange={(e) =>
                setPrecioMax(parseInt(e.target.value, 10) || maxPrecio)
              }
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
