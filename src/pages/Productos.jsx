// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../api"; // 👈 ahora usamos la API REST
import ProductCard from "../components/ProductCard.jsx";

const CLP = new Intl.NumberFormat("es-CL");

export default function Productos() {
  const [categoria, setCategoria] = useState("todos");
  const [precioMax, setPrecioMax] = useState(60000);

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

        // 👇 Ajusta la ruta según tu backend (/api/productos, /api/products, etc.)
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

  // Opciones de categoría = categorías presentes en productos (sin duplicados)
  const categoriaOptions = useMemo(() => {
    const set = new Set();

    for (const p of items) {
      // 👇 Ajusta esta lógica según cómo venga la categoría del backend
      // Ejemplo 1: p.categoria (string simple)
      if (p.categoria) set.add(p.categoria);

      // Ejemplo 2 (alternativo si tu backend manda objeto):
      // if (p.category && p.category.nombre) set.add(p.category.nombre);
    }

    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // Filtrado por categoría y precio
  const dataFiltrada = useMemo(() => {
    return items.filter((p) => {
      // 👇 Ajusta los campos según tu backend
      const cat = p.categoria; // o p.category?.nombre

      const precio = Number(p.precio); // o p.price si viene como "price"

      const okCat = categoria === "todos" ? true : cat === categoria;
      const okPrecio = precio <= Number(precioMax);
      return okCat && okPrecio;
    });
  }, [categoria, precioMax, items]);

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
