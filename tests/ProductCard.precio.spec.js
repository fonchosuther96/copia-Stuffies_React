import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../src/components/ProductCard.jsx';
import { productos } from '../src/services/productos.js';

describe('ProductCard (precio formateado)', () => {
  let container, root;
  const product = productos[1] || productos[0];

  beforeEach(() => {
    container = document.createElement('div'); document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => { flushSync(() => root.unmount()); container.remove(); });

  it('muestra nombre y algún formato de precio válido', () => {
    flushSync(() => {
      root.render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
    });
    const text = (container.textContent || '').replace(/\s+/g,' ');
    expect(text).toContain(product.nombre);
    // $39.990, 39.990, CLP 39990, etc.
    expect(/\$?\s?(\d{1,3}(\.\d{3})+|\d+)/.test(text)).toBeTrue();
  });
});
