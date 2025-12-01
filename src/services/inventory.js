// src/services/inventory.js
import api from "../api";

// Normaliza el producto que viene del backend a lo que usa el front
function normalizeProduct(p) {
  if (!p) return null;

  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    descripcion: p.descripcion,
    categoria: p.categoria,

    // Imagen principal
    imagen:
      p.imageUrl ||
      p.imagen ||
      p.imagen1 ||
      (Array.isArray(p.imagenes) && p.imagenes[0]) ||
      null,

    // Imagen hover
    imagenHover:
      p.imagenHover ||
      p.hover ||
      (Array.isArray(p.imagenes) && p.imagenes[1]) ||
      null,

    // extras
    destacado: p.destacado ?? false,
    stockPorTalla: p.stockPorTalla || null,
    tallas: Array.isArray(p.tallas) ? p.tallas : [],
    colores: Array.isArray(p.colores) ? p.colores : [],
    galeria: Array.isArray(p.galeria) ? p.galeria : [],
    imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
    imagen2: p.imagen2 || null,
    activo: p.activo ?? true,
  };
}

// ======================
//   LECTURAS DESDE API
// ======================

// lista todos los productos
export async function getAllLive() {
  const res = await api.get("/api/products");

  const raw = res.data;
  let arr = [];

  if (Array.isArray(raw)) arr = raw;
  else if (raw?.content && Array.isArray(raw.content)) arr = raw.content;

  return arr.map(normalizeProduct);
}

// trae un producto por id
export async function getLiveById(id) {
  const res = await api.get(`/api/products/${id}`);
  return normalizeProduct(res.data);
}

// stock por talla
export async function getStockPorTalla(id) {
  const prod = await getLiveById(id);
  return prod?.stockPorTalla ?? null;
}

export async function getTotalStock(id) {
  const spt = await getStockPorTalla(id);
  if (!spt) return 0;
  return Object.values(spt).reduce((a, n) => a + Number(n || 0), 0);
}


// ======================
//   CRUD PRODUCTOS
// ======================

export async function addProduct(data) {
  const payload = {
    ...data,
    imageUrl: data.imagen ?? data.imageUrl ?? null,
  };
  delete payload.imagen;

  const res = await api.post("/api/products", payload);
  return normalizeProduct(res.data);
}

export async function updateProduct(id, data) {
  const payload = {
    ...data,
    id,
    imageUrl: data.imagen ?? data.imageUrl ?? null,
  };
  delete payload.imagen;

  const res = await api.put(`/api/products/${id}`, payload);
  return normalizeProduct(res.data);
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}

// ======================
//   CATEGORÍAS
// ======================

export async function getCategories() {
  const prods = await getAllLive();
  if (!Array.isArray(prods)) return [];

  const set = new Set();

  for (const p of prods) {
    if (p?.categoria) set.add(String(p.categoria).trim());
  }

  return [...set].sort((a, b) => a.localeCompare(b));
}

// ======================
//   STUBS (NO USAR)
// ======================

export function addCategory() {
  throw new Error("addCategory debe hacerse contra el backend");
}
export function renameCategory() {
  throw new Error("renameCategory debe hacerse contra el backend");
}
export function deleteCategory() {
  throw new Error("deleteCategory debe hacerse contra el backend");
}

export function canAdd() {
  return true;
}
export function decrementStock() {}
export function incrementStock() {}
export function resetInventoryFromSeed() {
  throw new Error("El inventario ahora viene del backend");
}
