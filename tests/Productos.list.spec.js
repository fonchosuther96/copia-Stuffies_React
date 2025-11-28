import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import Productos from '../src/pages/Productos.jsx';
import { productos } from '../src/services/productos.js';

const tick = () => new Promise(r => setTimeout(r, 0));

describe('Productos (listado con datos reales)', () => {
  let container, root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    flushSync(() => root.unmount());
    container.remove();
  });

  it('muestra nombres reales desde el servicio de productos', async () => {
    flushSync(() => {
      root.render(
        <MemoryRouter>
          <Productos />
        </MemoryRouter>
      );
    });

    await tick();

    const text = (container.textContent || '').replace(/\s+/g, ' ');
    const anyMatch = productos.some(p => text.includes(p.nombre));
    expect(anyMatch).toBeTrue();
  });
});
