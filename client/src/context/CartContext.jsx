import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_items');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    const id = product._id || product.id;
    setItems(prev => {
      const existing = prev.find(p => (p._id || p.id) === id);
      if (existing) {
        return prev.map(p => (p._id || p.id) === id ? { ...p, quantity: p.quantity + qty } : p);
      }
      return [...prev, { ...product, _id: id, id, quantity: qty }];
    });
  };

  const update = (id, qty) => {
    setItems(prev => prev.map(p => (p._id || p.id) === id ? { ...p, quantity: Math.max(0, qty) } : p).filter(p => p.quantity > 0));
  };

  const remove = (id) => setItems(prev => prev.filter(p => (p._id || p.id) !== id));
  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + (i.quantity || 0), 0), [items]);

  const value = { items, add, update, remove, clear, total, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


