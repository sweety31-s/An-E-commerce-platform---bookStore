const express = require('express');

module.exports = function(db) {
  const router = express.Router();

  // POST /api/coupons/validate  { code }
  router.post('/validate', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'code required' });
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND active = 1').get(code.toUpperCase());
    if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon' });
    res.json({ code: coupon.code, discount_pct: coupon.discount_pct });
  });

  return router;
};
