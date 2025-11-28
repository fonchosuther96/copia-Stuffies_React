import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../src/components/Header.jsx';

describe('Header (navegación)', () => {
  let container, root;

  beforeEach(() => {
    container = document.createElement('div'); document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => { flushSync(() => root.unmount()); container.remove(); });

  it('muestra links a Home/Inicio y Productos', () => {
    flushSync(() => {
      root.render(<MemoryRouter><Header /></MemoryRouter>);
    });

    const links = Array.from(container.querySelectorAll('a')).map(a => ({
      href: a.getAttribute('href'), text: (a.textContent||'').trim()
    }));
    const hasHome = links.some(l => /home|inicio/i.test(l.text) || l.href === '/');
    const hasProductos = links.some(l => /producto/i.test(l.text));
    expect(hasHome).toBeTrue();
    expect(hasProductos).toBeTrue();
  });
});
