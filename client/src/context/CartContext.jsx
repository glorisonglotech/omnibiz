import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  // Get unique cart key per customer
  const getCartKey = () => {
    const customerToken = localStorage.getItem('customerToken');
    if (customerToken) {
      // Extract customer ID or email from token (basic decode)
      try {
        const payload = JSON.parse(atob(customerToken.split('.')[1]));
        return `cart_items_${payload.id || payload.email || 'guest'}`;
      } catch {
        return 'cart_items_guest';
      }
    }
    return 'cart_items_guest';
  };

  const [items, setItems] = useState(() => {
    try {
      const cartKey = getCartKey();
      const raw = localStorage.getItem(cartKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Update cart key when customer changes
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items]);

  // Clear old cart and load new cart when customer changes
  useEffect(() => {
    const cartKey = getCartKey();
    try {
      const raw = localStorage.getItem(cartKey);
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
  }, [localStorage.getItem('customerToken')]);

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


