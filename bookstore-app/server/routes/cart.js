const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/cart
  router.get('/', requireAuth, (req, res) => {
    const items = db.prepare(`
      SELECT ci.id, ci.book_id, ci.qty, ci.format,
             b.title, b.author, b.price, b.original_price as originalPrice,
             b.cover, b.badge, b.rating, b.category
      FROM cart_items ci
      JOIN books b ON b.id = ci.book_id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `).all(req.user.id);
    res.json(items);
  });

  // POST /api/cart  { book_id, qty, format }
  router.post('/', requireAuth, (req, res) => {
    const { book_id, qty = 1, format = 'Paperback' } = req.body;
    if (!book_id) return res.status(400).json({ error: 'book_id required' });

    const existing = db.prepare(
      'SELECT id, qty FROM cart_items WHERE user_id = ? AND book_id = ? AND format = ?'
    ).get(req.user.id, book_id, format);

    if (existing) {
      db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(existing.qty + qty, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, book_id, qty, format) VALUES (?, ?, ?, ?)'
      ).run(req.user.id, book_id, qty, format);
    }
    res.json({ ok: true });
  });

  // PUT /api/cart/:cartItemId  { qty }
  router.put('/:id', requireAuth, (req, res) => {
    const { qty } = req.body;
    if (!qty || qty < 1) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    } else {
      db.prepare('UPDATE cart_items SET qty = ? WHERE id = ? AND user_id = ?').run(qty, req.params.id, req.user.id);
    }
    res.json({ ok: true });
  });

  // DELETE /api/cart/:cartItemId
  router.delete('/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ ok: true });
  });

  // DELETE /api/cart  (clear all)
  router.delete('/', requireAuth, (req, res) => {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ ok: true });
  });

  return router;
};
