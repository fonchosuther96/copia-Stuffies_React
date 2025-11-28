import { productos } from '../src/services/productos.js';

describe('Datos de productos (integridad)', () => {
  it('tienen ids únicos y > 0', () => {
    const ids = productos.map(p => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    expect(ids.every(id => typeof id === 'number' && id > 0)).toBeTrue();
  });

  it('cada producto tiene nombre, precio>0 e imagen', () => {
    const ok = productos.every(p =>
      typeof p.nombre === 'string' && p.nombre.length > 0 &&
      typeof p.precio === 'number' && p.precio > 0 &&
      typeof p.imagen === 'string' && p.imagen.length > 0
    );
    expect(ok).toBeTrue();
  });

  it('stockPorTalla (si existe) es no negativo y numérico', () => {
    const ok = productos.every(p => {
      if (!p.stockPorTalla) return true;
      return Object.values(p.stockPorTalla).every(n =>
        Number.isInteger(n) && n >= 0
      );
    });
    expect(ok).toBeTrue();
  });
});
