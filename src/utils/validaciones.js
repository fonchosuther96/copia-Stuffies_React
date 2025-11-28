// src/utils/validaciones.js

// === Reglas atómicas ===
export const requerido = (v) =>
  (typeof v === "string" ? v.trim() : v) ? null : "Este campo es obligatorio";

export const email = (v) =>
  !v || /^\S+@\S+\.\S+$/.test(String(v).trim()) ? null : "Correo inválido";

export const url = (v) =>
  !v || /^(https?:\/\/)[^\s]+$/i.test(String(v).trim()) ? null : "URL inválida (usa http/https)";

export const enteroPositivo = (v) =>
  v === 0 || v === "0" || (Number.isFinite(+v) && +v > 0)
    ? null
    : "Debe ser un entero positivo";

export const precio = (v) =>
  Number.isFinite(+v) && +v >= 0 ? null : "Precio inválido (usa números ≥ 0)";

export const longitud = (v, { min = 0, max = Infinity } = {}) => {
  const s = String(v ?? "").trim();
  if (s.length < min) return `Mínimo ${min} caracteres`;
  if (s.length > max) return `Máximo ${max} caracteres`;
  return null;
};

export const coinciden = (v, otro, msg = "Los valores no coinciden") =>
  v === otro ? null : msg;

// RUN/RUT simple sin dígito verificador (ajústalo si quieres DV)
export const runSimple = (v) =>
  /^\d{7,9}$/.test(String(v).trim()) ? null : "Ingresa un RUN válido (7–9 dígitos)";

// === Helper para aplicar múltiples reglas a varios campos ===
// rules: { campo: [ (val)=>error|null, ... ] }
export function aplicarValidaciones(form, rules) {
  const errores = {};
  for (const [campo, validators] of Object.entries(rules)) {
    for (const fn of validators) {
      const err = fn(form[campo], form);
      if (err) {
        errores[campo] = err;
        break;
      }
    }
  }
  return errores; // {} si no hay errores
}