import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from '../src/components/ProductCard.jsx';
import { productos } from '../src/services/productos.js';

const tick = () => new Promise(r => setTimeout(r, 0));
const file = (url) => (url || '').split('?')[0]; // parte sin querystring

describe('ProductCard (con datos reales)', () => {
  let container, root;

  const product = productos.find(p => !!p.imagenHover) || productos[0];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  it('renderiza nombre y precio del servicio', () => {
    flushSync(() => {
      root.render(
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      );
    });

    const text = (container.textContent || '').replace(/\s+/g, ' ');
    expect(text).toContain(product.nombre);
    expect(text.replace(/\./g, '')).toContain(String(product.precio));
  });

  it('cambia la imagen en hover si existe imagenHover', async () => {
    flushSync(() => {
      root.render(
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      );
    });

    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    // inicio: imagen base
    expect(file(img.getAttribute('src'))).toBe(file(product.imagen));

    // hover -> espera re-render
    img.dispatchEvent(new Event('mouseover', { bubbles: true }));
    img.dispatchEvent(new Event('mouseenter', { bubbles: true }));
    await tick();

    expect(file(img.getAttribute('src'))).toBe(file(product.imagenHover));

    // salir de hover
    img.dispatchEvent(new Event('mouseout', { bubbles: true }));
    img.dispatchEvent(new Event('mouseleave', { bubbles: true }));
    await tick();

    expect(file(img.getAttribute('src'))).toBe(file(product.imagen));
  });
});
