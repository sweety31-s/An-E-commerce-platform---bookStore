require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const db      = require('./db');

const authRouter      = require('./routes/auth')(db);
const booksRouter     = require('./routes/books')(db);
const cartRouter      = require('./routes/cart')(db);
const wishlistRouter  = require('./routes/wishlist')(db);
const ordersRouter    = require('./routes/orders')(db);
const addressesRouter = require('./routes/addresses')(db);
const profileRouter   = require('./routes/profile')(db);
const couponsRouter   = require('./routes/coupons')(db);
const paymentsRouter  = require('./routes/payments')(db);

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/auth',      authRouter);
app.use('/api/books',     booksRouter);
app.use('/api/cart',      cartRouter);
app.use('/api/wishlist',  wishlistRouter);
app.use('/api/orders',    ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/profile',   profileRouter);
app.use('/api/coupons',   couponsRouter);
app.use('/api/payments',  paymentsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`BookStore API running on http://localhost:${PORT}`);
});
