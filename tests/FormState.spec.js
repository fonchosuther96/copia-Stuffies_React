import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

function MiniForm() {
  const [nombre, setNombre] = useState('');
  return (
    <div>
      <input aria-label="nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} />
      <p data-testid="mirror">{nombre}</p>
    </div>
  );
}

function setNativeValue(input, value) {
  const proto = Object.getPrototypeOf(input);
  const desc = Object.getOwnPropertyDescriptor(proto, 'value');
  const setter = desc && desc.set ? desc.set : null;
  if (setter) setter.call(input, value);
  else input.value = value;
}

const tick = () => new Promise(r => setTimeout(r, 0));

describe('Formulario (estado)', () => {
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

  it('actualiza el estado al escribir', async () => {
    flushSync(() => { root.render(<MiniForm />); });

    const input = container.querySelector('input[aria-label="nombre"]');
    expect(input).not.toBeNull();

    setNativeValue(input, 'Leonel');
    input.dispatchEvent(new Event('input', { bubbles: true }));

    await tick();

    const mirror = container.querySelector('[data-testid="mirror"]');
    expect(mirror.textContent).toBe('Leonel');
  });
});
