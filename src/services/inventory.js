// src/services/inventory.js
import api from "../api";

// Normaliza el producto que viene del backend a lo que usa el front
export function normalizeProduct(p) {
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

    destacado: p.destacado ?? false,

    // Variantes (stock por talla)
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          id: v.id ?? null,
          talla: v.talla ?? "",
          stock: Number(v.stock ?? 0),
        }))
      : [],

    stockPorTalla: p.stockPorTalla || null,

    // ⬇️ Volvemos a STRING para no romper product.tallas.split(...)
    tallas: p.tallas ?? "",
    colores: p.colores ?? "",

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

// Variantes de un producto
export async function getProductVariants(productId) {
  const res = await api.get(`/api/products/${productId}/variants`);
  const raw = Array.isArray(res.data) ? res.data : [];
  return raw.map((v) => ({
    id: v.id ?? null,
    talla: v.talla ?? "",
    stock: Number(v.stock ?? 0),
  }));
}

// trae un producto por id (con variantes)
export async function getLiveById(id) {
  const res = await api.get(`/api/products/${id}`);
  const prod = normalizeProduct(res.data);

  try {
    const vars = await getProductVariants(id);
    prod.variants = vars;
  } catch {
    prod.variants = [];
  }

  return prod;
}

// Mantener compatibilidad con DetalleProducto.jsx
export async function getStockPorTalla(id) {
  const variants = await getProductVariants(id);
  if (!variants.length) return null;

  const map = {};
  for (const v of variants) {
    const key = v.talla || "Única";
    map[key] = Number(v.stock || 0);
  }
  return map; // { "S": 40, "M": 60, ... }
}

// stock total usando variantes
export async function getTotalStock(id) {
  const variants = await getProductVariants(id);
  return variants.reduce((acc, v) => acc + Number(v.stock || 0), 0);
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

// Actualizar variantes
export async function updateVariants(productId, variants) {
  const payload = Array.isArray(variants)
    ? variants.map((v) => ({
        id: v.id ?? null,
        talla: v.talla ?? "",
        stock: Number(v.stock ?? 0),
      }))
    : [];

  const res = await api.put(
    `/api/products/${productId}/variants`,
    payload
  );

  const raw = Array.isArray(res.data) ? res.data : [];
  return raw.map((v) => ({
    id: v.id ?? null,
    talla: v.talla ?? "",
    stock: Number(v.stock ?? 0),
  }));
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
