// src/services/products.js
// Repositorio CRUD que persiste en LocalStorage y hace seed desde tu catálogo estático.
import { productos as STATIC_PRODUCTS } from "./productos";

const KEY = "products_v2";

function read(key, fallback = []) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Normaliza arrays (tallas/colores) si vinieran como string
const ensureArr = (v) =>
  Array.isArray(v)
    ? v
    : typeof v === "string" && v.trim()
    ? v.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

// --- SEED: copia tu catálogo a LS si no hay datos
export function seedProductsIfEmpty() {
  const current = read(KEY, null);
  if (current && Array.isArray(current) && current.length) return;

  // Asegura tipos y campos
  const seeded = (STATIC_PRODUCTS || []).map((p) => ({
    id: Number(p.id),
    nombre: p.nombre,
    precio: Number(p.precio) || 0,
    categoria: p.categoria || "",
    imagen: p.imagen || "",
    imagenHover: p.imagenHover || "",
    descripcion: p.descripcion || "",
    tallas: ensureArr(p.tallas),
    colores: ensureArr(p.colores),
    destacado: Boolean(p.destacado),
  }));

  write(KEY, seeded);
}

// --- CRUD
export function getProducts() {
  seedProductsIfEmpty();
  return read(KEY, []);
}

export function getProductById(id) {
  const num = Number(id);
  return getProducts().find((p) => Number(p.id) === num) || null;
}

export function createProduct(data) {
  const all = getProducts();
  const newId = all.length ? Math.max(...all.map((p) => Number(p.id))) + 1 : 1;

  const product = {
    id: newId,
    nombre: data.nombre?.trim() || "Producto",
    precio: Number(data.precio) || 0,
    categoria: data.categoria || "",
    imagen: data.imagen || "",
    imagenHover: data.imagenHover || "",
    descripcion: data.descripcion || "",
    tallas: ensureArr(data.tallas),
    colores: ensureArr(data.colores),
    destacado: Boolean(data.destacado),
  };

  all.push(product);
  write(KEY, all);
  return product;
}

export function updateProduct(id, data) {
  const num = Number(id);
  const all = getProducts();
  const idx = all.findIndex((p) => Number(p.id) === num);
  if (idx === -1) return null;

  const merged = {
    ...all[idx],
    ...data,
    id: num,
    precio: Number(data.precio ?? all[idx].precio) || 0,
    tallas: ensureArr(data.tallas ?? all[idx].tallas),
    colores: ensureArr(data.colores ?? all[idx].colores),
    destacado: Boolean(data.destacado ?? all[idx].destacado),
  };

  all[idx] = merged;
  write(KEY, all);
  return merged;
}

export function deleteProduct(id) {
  const num = Number(id);
  const filtered = getProducts().filter((p) => Number(p.id) !== num);
  write(KEY, filtered);
}
