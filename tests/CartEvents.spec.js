import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

function Button({ label, onClick }) {
  return <button data-testid="btn" onClick={onClick}>{label}</button>;
}

describe('Eventos (clic)', () => {
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

  it('ejecuta onClick al hacer clic', () => {
    const spy = jasmine.createSpy('onClick');

    flushSync(() => {
      root.render(<Button label="Agregar" onClick={spy} />);
    });

    const btn = container.querySelector('[data-testid="btn"]');
    expect(btn).not.toBeNull();

    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(spy).toHaveBeenCalled();
  });
});
