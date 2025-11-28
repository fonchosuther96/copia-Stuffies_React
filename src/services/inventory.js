// src/services/inventory.js
// Inventario persistente en localStorage, basado en tu productos.js inicial

import { productos as seed } from "./productos.js";

const INV_KEY = "stuffies_inventory_v1";
const INV_VER_KEY = "stuffies_inventory_version";
const CURRENT_VERSION = 2; // v2: agrega imagenHover (y futuros campos visuals)

// Catálogo de categorías independiente (para mostrar categorías sin productos)
const CATS_KEY = "stuffies_categories_v1";

// ---- util: emitir evento global para refrescar pantallas ----
function emitUpdated() {
  try { window.dispatchEvent(new Event("inventory:updated")); } catch {}
}

// ---- util: buscar en seed por id ----
function findInSeed(id) {
  return seed.find((s) => String(s.id) === String(id)) || null;
}

// ---- MIGRACIÓN: añade imagenHover y otros campos visuales desde el seed ----
function migrateListToV2(list) {
  let changed = false;
  const upgraded = list.map((p) => {
    const s = findInSeed(p.id);
    if (!s) return p;

    if (!p.imagenHover && s.imagenHover) {
      p = { ...p, imagenHover: s.imagenHover };
      changed = true;
    }
    if (!p.galeria && Array.isArray(s.galeria)) {
      p = { ...p, galeria: s.galeria };
      changed = true;
    }
    if (!p.imagenes && Array.isArray(s.imagenes)) {
      p = { ...p, imagenes: s.imagenes };
      changed = true;
    }
    if (!p.imagen2 && s.imagen2) {
      p = { ...p, imagen2: s.imagen2 };
      changed = true;
    }

    return p;
  });

  if (changed) {
    localStorage.setItem(INV_KEY, JSON.stringify(upgraded));
  }
  localStorage.setItem(INV_VER_KEY, String(CURRENT_VERSION));
  return upgraded;
}

// ---- Inicialización del inventario (si no existe) ----
function initOnce() {
  const raw = localStorage.getItem(INV_KEY);
  if (!raw) {
    const base = seed.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: p.imagen,
      imagenHover: p.imagenHover || null,

      galeria: Array.isArray(p.galeria) ? p.galeria : undefined,
      imagenes: Array.isArray(p.imagenes) ? p.imagenes : undefined,
      imagen2: p.imagen2 || undefined,

      tallas: Array.isArray(p.tallas) ? p.tallas : [],
      colores: Array.isArray(p.colores) ? p.colores : [],
      categoria: p.categoria,
      descripcion: p.descripcion,
      destacado: !!p.destacado,
      stockPorTalla: p.stockPorTalla || null,
    }));
    localStorage.setItem(INV_KEY, JSON.stringify(base));
    localStorage.setItem(INV_VER_KEY, String(CURRENT_VERSION));
  } else {
    const ver = Number(localStorage.getItem(INV_VER_KEY) || 1);
    if (ver < CURRENT_VERSION) {
      const list = JSON.parse(raw);
      migrateListToV2(list);
    } else {
      const list = JSON.parse(raw);
      const needsHover = list.some((p) => !p.imagenHover);
      if (needsHover) migrateListToV2(list);
    }
  }

  // Asegura catálogo de categorías inicial
  loadCats();
}

// ---- helpers base inventario ----
function load() {
  initOnce();
  return JSON.parse(localStorage.getItem(INV_KEY) || "[]");
}

function save(list) {
  localStorage.setItem(INV_KEY, JSON.stringify(list));
  localStorage.setItem(INV_VER_KEY, String(CURRENT_VERSION));
  emitUpdated();
}

// ---- helpers base categorías (catálogo) ----
function loadCats() {
  const rawInv = localStorage.getItem(INV_KEY);
  const rawCats = localStorage.getItem(CATS_KEY);

  if (!rawCats) {
    let base = [];
    if (!rawInv) {
      base = Array.from(new Set(seed.map((p) => p.categoria))).filter(Boolean);
    } else {
      const inv = JSON.parse(rawInv || "[]");
      base = Array.from(new Set(inv.map((p) => p.categoria))).filter(Boolean);
    }
    localStorage.setItem(CATS_KEY, JSON.stringify(base));
    return base;
  }
  return JSON.parse(rawCats || "[]");
}

function saveCats(arr) {
  localStorage.setItem(CATS_KEY, JSON.stringify(arr));
  emitUpdated();
}

// === LECTURAS PÚBLICAS ===
export function getAllLive() {
  return load();
}

export function getLiveById(id) {
  return load().find((p) => String(p.id) === String(id)) || null;
}

export function getStockPorTalla(id) {
  const prod = getLiveById(id);
  return prod && prod.stockPorTalla ? prod.stockPorTalla : null;
}

export function getTotalStock(id) {
  const spt = getStockPorTalla(id);
  if (!spt) return 0;
  return Object.values(spt).reduce((a, n) => a + Number(n || 0), 0);
}

export function canAdd(id, talla, qty) {
  const spt = getStockPorTalla(id);
  if (!spt) return false;
  const disponible = Number(spt[talla] || 0);
  return qty <= disponible;
}

export function decrementStock(id, talla, qty) {
  const list = load();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) throw new Error("Producto no existe en inventario");
  const spt = list[idx].stockPorTalla || {};
  const disponible = Number(spt[talla] || 0);
  if (qty > disponible) throw new Error("Stock insuficiente");
  spt[talla] = disponible - qty;
  list[idx].stockPorTalla = spt;
  save(list);
}

export function incrementStock(id, talla, qty) {
  const list = load();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) throw new Error("Producto no existe en inventario");
  const spt = list[idx].stockPorTalla || {};
  spt[talla] = Number(spt[talla] || 0) + qty;
  list[idx].stockPorTalla = spt;
  save(list);
}

// Útil para pruebas: restaurar inventario desde productos.js
export function resetInventoryFromSeed() {
  localStorage.removeItem(INV_KEY);
  localStorage.setItem(INV_VER_KEY, String(CURRENT_VERSION));
  initOnce();
}

// === CRUD helpers para productos (Admin) ===
export function addProduct(data) {
  const list = load();
  const nuevoId = String(Math.max(0, ...list.map((i) => +i.id || 0)) + 1);

  const nuevo = {
    id: nuevoId,
    nombre: (data.nombre || "").trim(),
    categoria: data.categoria || "",
    precio: Number(data.precio || 0),
    descripcion: (data.descripcion || "").trim(),
    imagen: (data.imagen || "").trim(),
    imagenHover: (data.imagenHover || null) ? String(data.imagenHover).trim() : null,
    destacado: !!data.destacado,
    tallas: Array.isArray(data.tallas) ? data.tallas : [],
    colores: Array.isArray(data.colores) ? data.colores : [],
    stockPorTalla: data.stockPorTalla || null,

    // campos visuales opcionales
    galeria: data.galeria,
    imagenes: data.imagenes,
    imagen2: data.imagen2,
  };

  list.push(nuevo);
  save(list);

  // Garantiza que la categoría exista en el catálogo
  if (nuevo.categoria) {
    const cats = loadCats();
    if (!cats.some((c) => c.trim().toLowerCase() === nuevo.categoria.trim().toLowerCase())) {
      cats.push(nuevo.categoria.trim());
      saveCats(cats);
    }
  }

  return nuevo; // incluye id
}

export function updateProduct(id, patch) {
  const list = load();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) throw new Error("Producto no existe en inventario");

  const prev = list[idx];
  const next = {
    ...prev,
    ...patch,
    nombre: patch.nombre != null ? String(patch.nombre).trim() : prev.nombre,
    descripcion: patch.descripcion != null ? String(patch.descripcion).trim() : prev.descripcion,
    imagen: patch.imagen != null ? String(patch.imagen).trim() : prev.imagen,
    imagenHover:
      patch.imagenHover != null && patch.imagenHover !== ""
        ? String(patch.imagenHover).trim()
        : patch.imagenHover === "" ? null : prev.imagenHover,
    precio: patch.precio != null ? Number(patch.precio) : prev.precio,
  };

  list[idx] = next;
  save(list);

  // Si cambió la categoría, asegúrala en catálogo
  if (next.categoria) {
    const cats = loadCats();
    if (!cats.some((c) => c.trim().toLowerCase() === next.categoria.trim().toLowerCase())) {
      cats.push(next.categoria.trim());
      saveCats(cats);
    }
  }

  return next;
}

export function deleteProduct(id) {
  const list = load();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) throw new Error("Producto no existe en inventario");
  list.splice(idx, 1);
  save(list);
}

// === Categorías (catálogo persistente) ===
export function getCategories() {
  return loadCats();
}

export function addCategory(name) {
  const n = String(name || "").trim();
  if (!n) throw new Error("Nombre vacío");
  const cats = loadCats();
  const exists = cats.some((c) => c.trim().toLowerCase() === n.toLowerCase());
  if (exists) throw new Error("La categoría ya existe");
  cats.push(n);
  saveCats(cats);
  return n;
}

// Renombra en catálogo y en todos los productos
export function renameCategory(oldName, newName) {
  const o = String(oldName || "").trim();
  const n = String(newName || "").trim();
  if (!o || !n) return;

  // Catálogo
  const cats = loadCats();
  const idx = cats.findIndex((c) => c.trim().toLowerCase() === o.toLowerCase());
  if (idx !== -1) {
    if (cats.some((c, i) => i !== idx && c.trim().toLowerCase() === n.toLowerCase())) {
      throw new Error("La categoría ya existe");
    }
    cats[idx] = n;
    saveCats(cats);
  } else {
    if (!cats.some((c) => c.trim().toLowerCase() === n.toLowerCase())) {
      cats.push(n);
      saveCats(cats);
    }
  }

  // Productos
  const list = load();
  let changed = false;
  for (const p of list) {
    if (String(p.categoria || "").trim().toLowerCase() === o.toLowerCase()) {
      p.categoria = n;
      changed = true;
    }
  }
  if (changed) save(list);
}

export function deleteCategory(name) {
  const n = String(name || "").trim().toLowerCase();
  const list = load();
  const used = list.some((p) => String(p.categoria || "").trim().toLowerCase() === n);
  if (used) throw new Error("No se puede eliminar: hay productos en esta categoría");

  const cats = loadCats().filter((c) => c.trim().toLowerCase() !== n);
  saveCats(cats);
}
