const express = require('express');
const { requireAuth } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // GET /api/addresses
  router.get('/', requireAuth, (req, res) => {
    const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id ASC').all(req.user.id);
    res.json(addresses);
  });

  // POST /api/addresses
  router.post('/', requireAuth, (req, res) => {
    const { label, first_name, last_name, address1, address2, city, zip, country, phone, is_default } = req.body;
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }
    const info = db.prepare(`
      INSERT INTO addresses (user_id, label, first_name, last_name, address1, address2, city, zip, country, phone, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, label || 'Home', first_name, last_name, address1, address2 || '', city, zip, country || 'United States', phone || '', is_default ? 1 : 0);
    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(address);
  });

  // PUT /api/addresses/:id
  router.put('/:id', requireAuth, (req, res) => {
    const { label, first_name, last_name, address1, address2, city, zip, country, phone, is_default } = req.body;
    const existing = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Address not found' });
    if (is_default) {
      db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }
    db.prepare(`
      UPDATE addresses SET label=?, first_name=?, last_name=?, address1=?, address2=?, city=?, zip=?, country=?, phone=?, is_default=?
      WHERE id = ? AND user_id = ?
    `).run(label, first_name, last_name, address1, address2 || '', city, zip, country, phone || '', is_default ? 1 : 0, req.params.id, req.user.id);
    const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
    res.json(address);
  });

  // DELETE /api/addresses/:id
  router.delete('/:id', requireAuth, (req, res) => {
    db.prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ ok: true });
  });

  return router;
};
