const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/books
  router.get('/', (req, res) => {
    const { category, badge, q, sort } = req.query;
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (badge)    { sql += ' AND badge = ?';    params.push(badge);    }
    if (q) {
      sql += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    if (sort === 'price_asc')  sql += ' ORDER BY price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
    else if (sort === 'rating')     sql += ' ORDER BY rating DESC';
    else                            sql += ' ORDER BY id ASC';

    const books = db.prepare(sql).all(...params);
    res.json(books);
  });

  // GET /api/books/:id
  router.get('/:id', (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  });

  // GET /api/books/:id/related
  router.get('/:id/related', (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    const related = db.prepare(
      'SELECT * FROM books WHERE category = ? AND id != ? LIMIT 4'
    ).all(book.category, book.id);
    res.json(related);
  });

  return router;
};
