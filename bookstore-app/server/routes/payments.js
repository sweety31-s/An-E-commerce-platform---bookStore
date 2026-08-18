const express = require('express');
const { requireAuth } = require('../middleware/auth');

// Simple card validation helpers
function luhnCheck(num) {
  const digits = num.replace(/\D/g, '').split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function detectCardBrand(num) {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n))          return 'Visa';
  if (/^5[1-5]/.test(n))     return 'Mastercard';
  if (/^3[47]/.test(n))      return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return 'Unknown';
}

function parseExpiry(exp) {
  const clean = exp.replace(/\s/g, '');
  const [mm, yy] = clean.split('/');
  if (!mm || !yy) return null;
  const month = parseInt(mm, 10);
  const year  = parseInt(yy.length === 2 ? '20' + yy : yy, 10);
  return { month, year };
}

module.exports = function (db) {
  const router = express.Router();

  /**
   * POST /api/payments/process
   * Body: {
   *   order_id,           // created order id
   *   payment_method,     // 'card' | 'bank' | 'wallet'
   *   card: { number, expiry, cvv, name },   // only for method=card
   *   amount,
   *   gift_applied,
   *   gift_amount
   * }
   */
  router.post('/process', requireAuth, (req, res) => {
    const {
      order_id,
      payment_method,
      card = {},
      amount,
      gift_applied = false,
      gift_amount  = 0,
    } = req.body;

    if (!order_id || amount == null) {
      return res.status(400).json({ error: 'order_id and amount are required' });
    }

    // Verify order belongs to user
    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // ── Card validation ──────────────────────────────────────────────────
    if (payment_method === 'card') {
      const rawNum = (card.number || '').replace(/\D/g, '');

      if (rawNum.length < 13 || rawNum.length > 19) {
        return res.status(422).json({ error: 'Invalid card number length', field: 'number' });
      }
      if (!luhnCheck(rawNum)) {
        return res.status(422).json({ error: 'Card number is invalid (failed Luhn check)', field: 'number' });
      }

      const expiry = parseExpiry(card.expiry || '');
      if (!expiry) {
        return res.status(422).json({ error: 'Invalid expiry format — use MM/YY', field: 'expiry' });
      }
      const now = new Date();
      if (expiry.year < now.getFullYear() ||
         (expiry.year === now.getFullYear() && expiry.month < now.getMonth() + 1)) {
        return res.status(422).json({ error: 'Card has expired', field: 'expiry' });
      }

      const cvv = (card.cvv || '').replace(/\D/g, '');
      if (cvv.length < 3 || cvv.length > 4) {
        return res.status(422).json({ error: 'CVV must be 3–4 digits', field: 'cvv' });
      }
      if (!card.name || card.name.trim().length < 2) {
        return res.status(422).json({ error: 'Name on card is required', field: 'name' });
      }
    }

    // ── Wallet validation ────────────────────────────────────────────────
    if (payment_method === 'wallet') {
      const WALLET_BALANCE = 8.50;
      if (amount > WALLET_BALANCE) {
        return res.status(422).json({ error: `Insufficient wallet balance ($${WALLET_BALANCE.toFixed(2)})` });
      }
    }

    // ── Gift points deduction ────────────────────────────────────────────
    if (gift_applied && gift_amount > 0) {
      const user = db.prepare('SELECT points FROM users WHERE id = ?').get(req.user.id);
      const pointsNeeded = Math.ceil(gift_amount * 100);  // 100 pts = $1

      if (user.points < pointsNeeded) {
        return res.status(422).json({ error: 'Insufficient gift points', field: 'gift' });
      }

      // Deduct points
      db.prepare('UPDATE users SET points = points - ? WHERE id = ?').run(pointsNeeded, req.user.id);
      db.prepare('INSERT INTO gift_transactions (user_id, points_delta, reason) VALUES (?, ?, ?)').run(
        req.user.id, -pointsNeeded, `Gift redemption on order #${order.order_number}`
      );
    }

    // ── Simulate payment gateway ─────────────────────────────────────────
    // In production this would call Stripe / PayPal etc.
    // We simulate: test card 4242 4242 4242 4242 always succeeds;
    //              4000 0000 0000 0002 always declines.
    const testNum = (card.number || '').replace(/\D/g, '');
    if (testNum === '4000000000000002') {
      return res.status(402).json({ error: 'Your card was declined. Please try a different card.' });
    }

    // Generate a transaction reference
    const txnRef = 'TXN-' + Date.now().toString(36).toUpperCase();

    // Mark order as paid and update payment info
    db.prepare(`
      UPDATE orders
      SET payment_status = 'paid',
          payment_method  = ?,
          txn_ref         = ?,
          gift_discount   = ?,
          updated_at      = datetime('now')
      WHERE id = ?
    `).run(payment_method, txnRef, gift_applied ? gift_amount : 0, order_id);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
    const brand = payment_method === 'card' ? detectCardBrand(card.number || '') : null;

    res.json({
      success:     true,
      txn_ref:     txnRef,
      amount_paid: amount,
      payment_method,
      card_brand:  brand,
      card_last4:  payment_method === 'card' ? (card.number || '').replace(/\D/g, '').slice(-4) : null,
      order:       updatedOrder,
    });
  });

  /**
   * GET /api/payments/:txnRef  — receipt lookup
   */
  router.get('/:txnRef', requireAuth, (req, res) => {
    const order = db.prepare(
      'SELECT * FROM orders WHERE txn_ref = ? AND user_id = ?'
    ).get(req.params.txnRef, req.user.id);

    if (!order) return res.status(404).json({ error: 'Transaction not found' });

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    res.json({
      ...order,
      items,
      shipping_address: JSON.parse(order.shipping_address_json || '{}'),
    });
  });

  return router;
};
