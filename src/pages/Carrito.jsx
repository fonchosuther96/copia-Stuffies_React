// src/pages/Carrito.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCart,
  clearCart,
  removeFromCart,
  updateQuantity,
  getCartTotals,
} from "../services/cart.js";

export default function Carrito() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getCart());

  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cart:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cart:updated", sync);
    };
  }, []);

  const totals = useMemo(() => getCartTotals(), [items]);

  const onQtyChange = useCallback((item, value) => {
    updateQuantity(item, value);
    setItems(getCart());
  }, []);

  const onRemove = useCallback((item) => {
    removeFromCart(item);
    setItems(getCart());
  }, []);

  const onClear = useCallback(() => {
    clearCart();
    setItems([]);
  }, []);

  const onCheckout = useCallback(() => {
    if (!Array.isArray(items) || items.length === 0) return;
    navigate("/checkout");
  }, [navigate, items]);

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <main className="container py-4">
      <h2 className="mb-3">Carrito</h2>

      {safeItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/productos" className="btn btn-primary">Ver productos</Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-dark table-striped align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ width: 120 }}>Cantidad</th>
                  <th style={{ width: 120 }}>Precio</th>
                  <th style={{ width: 120 }}>Subtotal</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {safeItems.map((it, i) => {
                  const precio = Number(it.precio) || 0;
                  const cantidad = Number(it.cantidad) || 0;
                  const subtotal = precio * cantidad;

                  return (
                    <tr key={`${it.id}-${it.talla ?? ""}-${it.color ?? ""}-${i}`}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {it.imagen ? (
                            <img
                              src={it.imagen}
                              alt={it.nombre}
                              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56, height: 56, borderRadius: 8,
                                background: "#2b2f33", display: "grid",
                                placeItems: "center", fontSize: 10, opacity: .7
                              }}
                            >
                              Sin imagen
                            </div>
                          )}

                          <div>
                            <div className="fw-semibold">{it.nombre}</div>

                            {/* Variante comprada */}
                            <div className="d-flex flex-wrap gap-2 mt-1">
                              <span className="badge bg-secondary">
                                Talla: {it.talla ?? "—"}
                              </span>
                              {it.color && (
                                <span className="badge bg-dark">
                                  Color: {it.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={cantidad}
                          onChange={(e) => onQtyChange(it, e.target.value)}
                        />
                      </td>

                      <td>${precio.toLocaleString("es-CL")}</td>
                      <td>${subtotal.toLocaleString("es-CL")}</td>
                      <td>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => onRemove(it)}
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-end fw-semibold">Total ítems:</td>
                  <td colSpan={3} className="fw-bold">{totals.cantidad}</td>
                </tr>
                <tr>
                  <td colSpan={2} className="text-end fw-semibold">Total a pagar:</td>
                  <td colSpan={3} className="fw-bold">
                    ${totals.subtotal.toLocaleString("es-CL")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={onClear}>
              Vaciar carrito
            </button>
            <button className="btn btn-primary" onClick={onCheckout}>
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </main>
  );
}
