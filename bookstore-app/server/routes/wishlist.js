const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/wishlist
  router.get('/', requireAuth, (req, res) => {
    const items = db.prepare(`
      SELECT w.id, w.book_id, w.added_at,
             b.title, b.author, b.price, b.original_price as originalPrice,
             b.cover, b.badge, b.rating, b.category
      FROM wishlist w
      JOIN books b ON b.id = w.book_id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `).all(req.user.id);
    res.json(items);
  });

  // POST /api/wishlist  { book_id }
  router.post('/', requireAuth, (req, res) => {
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ error: 'book_id required' });
    const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND book_id = ?').get(req.user.id, book_id);
    if (!existing) {
      db.prepare('INSERT INTO wishlist (user_id, book_id) VALUES (?, ?)').run(req.user.id, book_id);
    }
    res.json({ ok: true });
  });

  // DELETE /api/wishlist/:bookId
  router.delete('/:bookId', requireAuth, (req, res) => {
    db.prepare('DELETE FROM wishlist WHERE user_id = ? AND book_id = ?').run(req.user.id, req.params.bookId);
    res.json({ ok: true });
  });

  return router;
};
