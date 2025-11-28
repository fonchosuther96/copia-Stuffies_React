import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCart, setCart, getCartTotals, addToCart } from "../services/cart";
import { INVENTORY_KEY } from "../services/inventory";

const CartContext = createContext(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error("useCart debe usarse dentro de <CartProvider>.");
  }
  return ctx;
};

export default function CartProvider({ children }) {
  const [cart, setCartState] = useState(() => getCart());

  useEffect(() => {
    const onStorage = (ev) => {
      if (ev.key === "carrito") setCartState(getCart());
      if (ev.key === INVENTORY_KEY) setCartState((c) => [...c]); 
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => getCartTotals(), [cart]);
  const cartCount = totals.cantidad;

  const addItem = (payload) => {
    const res = addToCart(payload); 
    setCartState(getCart());
    return res;
  };

  const clear = () => {
    setCartState([]);
    setCart([]);
  };

  const value = { cart, cartCount, totals, addItem, clear };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
