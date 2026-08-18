import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [giftApplied, setGiftApplied] = useState(false);
  // coupon discount pct from server (default 20)
  const [couponPct, setCouponPct] = useState(20);

  // ─── Load server cart when user logs in ──────────────────────────────────────
  const fetchServerCart = useCallback(async () => {
    try {
      const serverItems = await api.get('/api/cart');
      // Normalize server items to match frontend shape (id = book_id for lookup)
      setItems(serverItems.map(i => ({
        ...i,
        id: i.book_id,
        _cartId: i.id,   // server cart_items.id
        originalPrice: i.originalPrice,
      })));
    } catch {
      // server unavailable — keep local state
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchServerCart();
    } else {
      // Guest: clear server-synced items on logout
      setItems([]);
      setCoupon(null);
      setGiftApplied(false);
    }
  }, [user, fetchServerCart]);

  // ─── Add to cart ─────────────────────────────────────────────────────────────
  const addToCart = async (book, qty = 1, format = 'Paperback') => {
    // Optimistic local update first
    setItems(prev => {
      const existing = prev.find(i => i.id === book.id && i.format === format);
      if (existing) return prev.map(i => (i.id === book.id && i.format === format) ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...book, qty, format }];
    });

    if (user && getToken()) {
      try {
        await api.post('/api/cart', { book_id: book.id, qty, format });
        await fetchServerCart(); // re-sync to get _cartId
      } catch {
        // ignore sync error, local state still valid
      }
    }
  };

  // ─── Remove from cart ────────────────────────────────────────────────────────
  const removeFromCart = async (id) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (user && item?._cartId) {
      try { await api.delete(`/api/cart/${item._cartId}`); } catch { /* ignore */ }
    }
  };

  // ─── Update qty ──────────────────────────────────────────────────────────────
  const updateQty = async (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    const item = items.find(i => i.id === id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    if (user && item?._cartId) {
      try { await api.put(`/api/cart/${item._cartId}`, { qty }); } catch { /* ignore */ }
    }
  };

  // ─── Clear cart ──────────────────────────────────────────────────────────────
  const clearCart = async () => {
    setItems([]);
    if (user) {
      try { await api.delete('/api/cart'); } catch { /* ignore */ }
    }
  };

  // ─── Coupon ──────────────────────────────────────────────────────────────────
  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/api/coupons/validate', { code });
      setCoupon(code);
      setCouponPct(res.discount_pct);
      return true;
    } catch {
      // fallback local check
      if (code.toUpperCase() === 'SUMMER20') {
        setCoupon(code);
        setCouponPct(20);
        return true;
      }
      return false;
    }
  };

  // ─── Computations ────────────────────────────────────────────────────────────
  const subtotal     = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount     = coupon ? subtotal * (couponPct / 100) : 0;
  const giftDiscount = giftApplied ? Math.min(4.5, subtotal * 0.1) : 0;
  const shipping     = items.length ? 3.99 : 0;
  const tax          = (subtotal - discount - giftDiscount) * 0.08;
  const total        = subtotal - discount - giftDiscount + shipping + tax;
  const itemCount    = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      subtotal, discount, giftDiscount, shipping, tax, total, itemCount,
      coupon, applyCoupon, couponPct,
      giftApplied, setGiftApplied,
      fetchServerCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
