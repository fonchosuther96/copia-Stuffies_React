import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../src/components/ProductCard.jsx';
import { productos } from '../src/services/productos.js';

describe('ProductCard (sin imagenHover)', () => {
  let container, root;

  // clone de un producto real pero SIN imagenHover
  const base = productos[0];
  const product = { ...base, imagenHover: null };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  it('no cambia la imagen en mouseover/mouseout si no hay imagenHover', () => {
    flushSync(() => {
      root.render(
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      );
    });

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    const src0 = img.src;

    img.dispatchEvent(new Event('mouseover', { bubbles: true }));
    img.dispatchEvent(new Event('mouseenter', { bubbles: true }));
    expect(img.src).toBe(src0);

    img.dispatchEvent(new Event('mouseout', { bubbles: true }));
    img.dispatchEvent(new Event('mouseleave', { bubbles: true }));
    expect(img.src).toBe(src0);
  });
});
