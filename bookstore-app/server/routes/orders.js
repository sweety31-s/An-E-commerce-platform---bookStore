const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/orders
  router.get('/', requireAuth, (req, res) => {
    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    const result = orders.map(o => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      return { ...o, items, shipping_address: JSON.parse(o.shipping_address_json || '{}') };
    });
    res.json(result);
  });

  // POST /api/orders
  router.post('/', requireAuth, (req, res) => {
    const {
      items, shipping_address, shipping_method, payment_method,
      subtotal, discount, gift_discount, shipping, tax, total, coupon_code, gift_applied
    } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: 'No items' });

    // Generate order number
    const orderNumber = 'BS-' + Date.now().toString().slice(-10);

    const stmt = db.prepare(`
      INSERT INTO orders
        (order_number, user_id, status, subtotal, discount, gift_discount, shipping, tax, total,
         shipping_address_json, shipping_method, payment_method)
      VALUES (?, ?, 'Processing', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      orderNumber, req.user.id,
      subtotal || 0, discount || 0, gift_discount || 0, shipping || 0, tax || 0, total || 0,
      JSON.stringify(shipping_address || {}),
      shipping_method || 'standard',
      payment_method || 'card'
    );
    const orderId = info.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, book_id, title, author, cover, price, qty, format)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(orderId, item.book_id || item.id, item.title, item.author, item.cover, item.price, item.qty, item.format || 'Paperback');
    }

    // Clear user cart
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);

    // Award gift points (1 pt per $1 spent)
    const pointsEarned = Math.round(total || 0);
    if (pointsEarned > 0) {
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsEarned, req.user.id);
      db.prepare('INSERT INTO gift_transactions (user_id, points_delta, reason) VALUES (?, ?, ?)').run(
        req.user.id, pointsEarned, `Order ${orderNumber}`
      );
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
    res.status(201).json({ ...order, items: orderItems, order_number: orderNumber });
  });

  // GET /api/orders/:id
  router.get('/:id', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({ ...order, items, shipping_address: JSON.parse(order.shipping_address_json || '{}') });
  });

  // POST /api/orders/:id/cancel
  router.post('/:id/cancel', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'Processing') {
      return res.status(400).json({ error: 'Only Processing orders can be cancelled' });
    }
    const hoursSince = (Date.now() - new Date(order.created_at).getTime()) / 3600000;
    if (hoursSince > 48) {
      return res.status(400).json({ error: 'Cancellation window (48 hours) has passed' });
    }
    db.prepare("UPDATE orders SET status = 'Cancelled', updated_at = datetime('now') WHERE id = ?").run(order.id);
    res.json({ ok: true });
  });

  // POST /api/orders/:id/return
  router.post('/:id/return', requireAuth, (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'Delivered') {
      return res.status(400).json({ error: 'Only Delivered orders can be returned' });
    }
    const daysSince = (Date.now() - new Date(order.created_at).getTime()) / (3600000 * 24);
    if (daysSince > 30) {
      return res.status(400).json({ error: 'Return window (30 days) has passed' });
    }
    db.prepare("UPDATE orders SET status = 'Returned', updated_at = datetime('now') WHERE id = ?").run(order.id);
    res.json({ ok: true });
  });

  return router;
};
