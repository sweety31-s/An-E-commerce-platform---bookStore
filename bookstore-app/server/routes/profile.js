const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/profile
  router.get('/', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role, points, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  // PUT /api/profile
  router.put('/', requireAuth, (req, res) => {
    const { name, email } = req.body;
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, req.user.id);
    const user = db.prepare('SELECT id, name, email, role, points, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  // GET /api/profile/stats
  router.get('/stats', requireAuth, (req, res) => {
    const totalOrders   = db.prepare('SELECT COUNT(*) as cnt FROM orders WHERE user_id = ?').get(req.user.id).cnt;
    const booksCount    = db.prepare('SELECT SUM(qty) as cnt FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?').get(req.user.id).cnt || 0;
    const wishlistCount = db.prepare('SELECT COUNT(*) as cnt FROM wishlist WHERE user_id = ?').get(req.user.id).cnt;
    const user          = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.id);
    res.json({
      totalOrders,
      booksPurchased: booksCount,
      wishlistCount,
      points: user?.points || 0,
    });
  });

  // GET /api/profile/recommendations
  router.get('/recommendations', requireAuth, (req, res) => {
    // Find the top category from order history
    const topCategory = db.prepare(`
      SELECT b.category, COUNT(*) as cnt
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN books b ON b.id = oi.book_id
      WHERE o.user_id = ?
      GROUP BY b.category
      ORDER BY cnt DESC
      LIMIT 1
    `).get(req.user.id);

    // Ordered book ids to exclude
    const orderedIds = db.prepare(`
      SELECT DISTINCT oi.book_id
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = ?
    `).all(req.user.id).map(r => r.book_id);

    let books;
    if (topCategory) {
      const excludePlaceholders = orderedIds.length ? orderedIds.map(() => '?').join(',') : '0';
      books = db.prepare(`
        SELECT * FROM books
        WHERE category = ? AND id NOT IN (${excludePlaceholders})
        ORDER BY rating DESC
        LIMIT 4
      `).all(topCategory.category, ...orderedIds);

      // If not enough, fill from same category regardless
      if (books.length < 4) {
        books = db.prepare(
          'SELECT * FROM books WHERE category = ? ORDER BY rating DESC LIMIT 4'
        ).all(topCategory.category);
      }
    } else {
      // No order history — return top-rated books
      books = db.prepare('SELECT * FROM books ORDER BY rating DESC LIMIT 4').all();
    }

    res.json(books);
  });

  return router;
};
