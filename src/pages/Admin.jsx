// src/pages/Admin.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORDERS_KEY = "orders";
const CLP = new Intl.NumberFormat("es-CL");

// Carga Chart.js por CDN si no existe y devuelve el constructor
const getChartCtor = async () => {
  if (typeof window !== "undefined" && window.Chart) return window.Chart; // ya está cargado
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/chart.js";
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.Chart;
};

export default function Admin() {
  const navigate = useNavigate();

  // Refs de canvas
  const ventasRef = useRef(null);
  const categoriasRef = useRef(null);
  const productosRef = useRef(null);

  // Instancias Chart
  const chartsRef = useRef({ ventas: null, categorias: null, productos: null });

  // KPIs
  const [kpis, setKpis] = useState({ total7: 0, pedidos: 0, ticket: 0, unidades: 0 });

  // ===== Helpers: LocalStorage =====
  const loadOrders = () => {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveOrders = (arr) => localStorage.setItem(ORDERS_KEY, JSON.stringify(arr));

  const seedIfEmpty = () => {
    const now = new Date();
    let orders = loadOrders();
    if (orders.length) return;

    const sample = (d, total, items) => ({
      id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      date: d.toISOString(),
      total,
      items,
    });
    const daysAgo = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 12, 0, 0);

    orders = [
      sample(daysAgo(0), 55990, [{ id: 3, nombre: "Stella Chroma Zip Hoodie", precio: 55990, cantidad: 1, categoria: "polerones" }]),
      sample(daysAgo(1), 39990, [{ id: 1, nombre: "Hoodie White Dice", precio: 39990, cantidad: 1, categoria: "polerones" }]),
      sample(daysAgo(2), 48980, [
        { id: 4, nombre: "Boxy-Slim White Tee", precio: 22990, cantidad: 1, categoria: "poleras" },
        { id: 5, nombre: "Boxy-Slim Black Tee", precio: 25990, cantidad: 1, categoria: "poleras" },
      ]),
      sample(daysAgo(3), 10990, [{ id: 2, nombre: "Star Player Blue", precio: 10990, cantidad: 1, categoria: "poleras" }]),
      sample(daysAgo(4), 68980, [{ id: 6, nombre: "Hoodie Red Dice", precio: 32990, cantidad: 2, categoria: "polerones" }]),
      sample(daysAgo(5), 37990, [{ id: 7, nombre: "Star Player Black", precio: 37990, cantidad: 1, categoria: "poleras" }]),
      sample(daysAgo(6), 35990, [{ id: 8, nombre: "Hoodie Pink Dice", precio: 35990, cantidad: 1, categoria: "polerones" }]),
    ];
    saveOrders(orders);
  };

  // ===== Cálculos =====
  const ymd = (d) => d.toISOString().slice(0, 10);
  const lastNDaysLabels = (n) => {
    const arr = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      arr.push(ymd(d));
    }
    return arr;
  };

  const computeStats = (orders) => {
    const days = lastNDaysLabels(7);
    const ventasPorDia = Object.fromEntries(days.map((k) => [k, 0]));
    let total7 = 0,
      pedidos = 0,
      unidades = 0;
    const porCategoria = {};
    const porProducto = {};

    orders.forEach((o) => {
      const day = ymd(new Date(o.date));
      if (ventasPorDia[day] != null) {
        ventasPorDia[day] += Number(o.total || 0);
        total7 += Number(o.total || 0);
        pedidos += 1;

        (o.items || []).forEach((it) => {
          unidades += Number(it.cantidad || 0);
          const c = it.categoria || "otros";
          porCategoria[c] = (porCategoria[c] || 0) + Number(it.cantidad || 0);
          const key = it.nombre || "ID " + it.id;
          porProducto[key] = (porProducto[key] || 0) + Number(it.cantidad || 0);
        });
      }
    });

    const ticket = pedidos ? Math.round(total7 / pedidos) : 0;
    const entriesCat = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const entriesPro = Object.entries(porProducto).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return {
      days,
      ventasPorDiaArr: days.map((d) => ventasPorDia[d]),
      total7,
      pedidos,
      unidades,
      ticket,
      topCatLabels: entriesCat.map((e) => e[0]),
      topCatValues: entriesCat.map((e) => e[1]),
      topProLabels: entriesPro.map((e) => e[0]),
      topProValues: entriesPro.map((e) => e[1]),
    };
  };

  // ===== Render =====
  const renderKPIs = (stats) => {
    setKpis({
      total7: stats.total7,
      pedidos: stats.pedidos,
      ticket: stats.ticket,
      unidades: stats.unidades,
    });
  };

  const renderCharts = async (stats) => {
    const Chart = await getChartCtor();

    // Destruir previos
    chartsRef.current.ventas?.destroy();
    chartsRef.current.categorias?.destroy();
    chartsRef.current.productos?.destroy();

    chartsRef.current.ventas = new Chart(ventasRef.current, {
      type: "bar",
      data: { labels: stats.days, datasets: [{ label: "Ventas (CLP)", data: stats.ventasPorDiaArr }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    });

    chartsRef.current.categorias = new Chart(categoriasRef.current, {
      type: "doughnut",
      data: { labels: stats.topCatLabels, datasets: [{ data: stats.topCatValues }] },
      options: { responsive: true },
    });

    chartsRef.current.productos = new Chart(productosRef.current, {
      type: "bar",
      data: { labels: stats.topProLabels, datasets: [{ label: "Unidades", data: stats.topProValues }] },
      options: { indexAxis: "y", responsive: true, plugins: { legend: { display: false } } },
    });
  };

  const rerender = async () => {
    const orders = loadOrders();
    const stats = computeStats(orders);
    renderKPIs(stats);
    await renderCharts(stats);
  };

  const addDemoSale = async () => {
    const orders = loadOrders();
    const products = [
      { id: 1, nombre: "Hoodie White Dice", precio: 39990, categoria: "polerones" },
      { id: 2, nombre: "Star Player Blue", precio: 10990, categoria: "poleras" },
      { id: 3, nombre: "Stella Zip Hoodie", precio: 55990, categoria: "polerones" },
      { id: 4, nombre: "Boxy-Slim White", precio: 22990, categoria: "poleras" },
    ];
    const pick = () => products[Math.floor(Math.random() * products.length)];
    const items = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => {
      const p = pick();
      return { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 + Math.floor(Math.random() * 2), categoria: p.categoria };
    });
    const total = items.reduce((a, i) => a + i.precio * i.cantidad, 0);
    orders.push({ id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(), date: new Date().toISOString(), total, items });
    saveOrders(orders);
    await rerender();
  };

  // ===== Efectos =====
  useEffect(() => {
    // Sólo admin
    const s = JSON.parse(localStorage.getItem("stuffies_session") || "null");
    if (!s || s.role !== "admin") {
      navigate("/");
      return;
    }

    seedIfEmpty();
    rerender();

    return () => {
      chartsRef.current.ventas?.destroy();
      chartsRef.current.categorias?.destroy();
      chartsRef.current.productos?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <main className="admin-shell">
      <h2 className="text-light mb-3">Panel de Estadísticas</h2>

      <div className="kpis">
        <div className="kpi">
          <h3>${CLP.format(kpis.total7)}</h3>
          <span>Ventas (últimos 7 días)</span>
        </div>
        <div className="kpi">
          <h3>{kpis.pedidos}</h3>
          <span>Pedidos</span>
        </div>
        <div className="kpi">
          <h3>${CLP.format(kpis.ticket)}</h3>
          <span>Ticket promedio</span>
        </div>
        <div className="kpi">
          <h3>{kpis.unidades}</h3>
          <span>Unidades vendidas</span>
        </div>
      </div>

      <div className="grid">
        <div className="cardx">
          <h5>Ventas por día (7d)</h5>
          <canvas ref={ventasRef} />
        </div>

        <div className="cardx">
          <h5>Top categorías</h5>
          <canvas ref={categoriasRef} />
        </div>

        <div className="cardx">
          <h5>Top productos</h5>
          <canvas ref={productosRef} />
        </div>

        <div className="cardx">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Acciones</h5>
            <button className="btn btn-sm btn-primary" onClick={addDemoSale}>
              Agregar venta demo
            </button>
          </div>
          <p className="mb-0 text-muted">Usa este botón para generar ventas de ejemplo y ver cómo cambian los gráficos.</p>
        </div>
      </div>
    </main>
  );
}
