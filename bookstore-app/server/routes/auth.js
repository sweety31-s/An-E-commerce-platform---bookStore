const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { SECRET } = require('../middleware/auth');

module.exports = function(db) {
  const router = express.Router();

  // POST /api/auth/register
  router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, points) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(name, email, hash, 'Silver Member', 0);
    const user = db.prepare('SELECT id, name, email, role, points FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, points: user.points }, SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  });

  // POST /api/auth/login
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points },
      SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points } });
  });

  return router;
};
