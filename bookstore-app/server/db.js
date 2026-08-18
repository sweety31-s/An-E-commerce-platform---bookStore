const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const DB_PATH = path.join(__dirname, 'bookstore.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ────────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'Silver Member',
    points        INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS books (
    id             INTEGER PRIMARY KEY,
    title          TEXT    NOT NULL,
    author         TEXT    NOT NULL,
    category       TEXT    NOT NULL,
    price          REAL    NOT NULL,
    original_price REAL,
    rating         REAL    NOT NULL DEFAULT 0,
    reviews        INTEGER NOT NULL DEFAULT 0,
    cover          TEXT,
    badge          TEXT,
    description    TEXT
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      TEXT    NOT NULL DEFAULT 'Home',
    first_name TEXT    NOT NULL,
    last_name  TEXT    NOT NULL,
    address1   TEXT    NOT NULL,
    address2   TEXT    NOT NULL DEFAULT '',
    city       TEXT    NOT NULL,
    zip        TEXT    NOT NULL,
    country    TEXT    NOT NULL DEFAULT 'United States',
    phone      TEXT    NOT NULL DEFAULT '',
    is_default INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number         TEXT    NOT NULL UNIQUE,
    user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status               TEXT    NOT NULL DEFAULT 'Processing',
    payment_status       TEXT    NOT NULL DEFAULT 'pending',
    txn_ref              TEXT,
    subtotal             REAL    NOT NULL DEFAULT 0,
    discount             REAL    NOT NULL DEFAULT 0,
    gift_discount        REAL    NOT NULL DEFAULT 0,
    shipping             REAL    NOT NULL DEFAULT 0,
    tax                  REAL    NOT NULL DEFAULT 0,
    total                REAL    NOT NULL DEFAULT 0,
    shipping_address_json TEXT   NOT NULL DEFAULT '{}',
    shipping_method      TEXT    NOT NULL DEFAULT 'standard',
    payment_method       TEXT    NOT NULL DEFAULT 'card',
    created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id  INTEGER NOT NULL,
    title    TEXT    NOT NULL,
    author   TEXT    NOT NULL DEFAULT '',
    cover    TEXT    NOT NULL DEFAULT '',
    price    REAL    NOT NULL,
    qty      INTEGER NOT NULL DEFAULT 1,
    format   TEXT    NOT NULL DEFAULT 'Paperback'
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id  INTEGER NOT NULL,
    qty      INTEGER NOT NULL DEFAULT 1,
    format   TEXT    NOT NULL DEFAULT 'Paperback',
    added_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id  INTEGER NOT NULL,
    added_at TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    code         TEXT    NOT NULL UNIQUE,
    discount_pct INTEGER NOT NULL DEFAULT 20,
    active       INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS gift_transactions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_delta INTEGER NOT NULL,
    reason       TEXT    NOT NULL DEFAULT '',
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Seed Books (idempotent) ───────────────────────────────────────────────────

const BOOKS = [
  { id: 1,  title: 'Atomic Habits',           author: 'James Clear',        category: 'Self-Help',   price: 14.99, original_price: null,  rating: 4.8, reviews: 3241, cover: 'https://covers.openlibrary.org/b/id/10527843-M.jpg', badge: null,   description: 'Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.' },
  { id: 2,  title: 'Dune',                    author: 'Frank Herbert',       category: 'Fiction',     price: 10.39, original_price: 12.99, rating: 4.9, reviews: 5821, cover: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',  badge: 'SALE', description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides—heir to a noble family.' },
  { id: 3,  title: 'Sapiens',                 author: 'Yuval Noah Harari',   category: 'History',     price: 16.99, original_price: null,  rating: 4.7, reviews: 4102, cover: 'https://covers.openlibrary.org/b/id/8571214-M.jpg',  badge: null,   description: 'A brief history of humankind from the Stone Age to the twenty-first century.' },
  { id: 4,  title: 'The Alchemist',           author: 'Paulo Coelho',        category: 'Fiction',     price: 9.34,  original_price: 10.99, rating: 4.6, reviews: 6003, cover: 'https://covers.openlibrary.org/b/id/8258867-M.jpg',  badge: 'SALE', description: 'A fable about following your dream and listening to your heart.' },
  { id: 5,  title: '1984',                    author: 'George Orwell',       category: 'Fiction',     price: 9.99,  original_price: null,  rating: 4.9, reviews: 7200, cover: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',  badge: null,   description: 'A dystopian social science fiction novel about totalitarianism.' },
  { id: 6,  title: 'Brave New World',         author: 'Aldous Huxley',       category: 'Fiction',     price: 7.49,  original_price: 9.99,  rating: 4.4, reviews: 2891, cover: 'https://covers.openlibrary.org/b/id/8258884-M.jpg',  badge: 'SALE', description: 'Set in a futuristic World State, citizens are cultured in hatcheries and conditioned.' },
  { id: 7,  title: 'To Kill a Mockingbird',   author: 'Harper Lee',          category: 'Fiction',     price: 11.99, original_price: null,  rating: 4.8, reviews: 4421, cover: 'https://covers.openlibrary.org/b/id/8739161-M.jpg',  badge: null,   description: 'The story of racial injustice and the loss of innocence in the American South.' },
  { id: 8,  title: 'The Great Gatsby',        author: 'F. Scott Fitzgerald', category: 'Fiction',     price: 8.99,  original_price: null,  rating: 4.3, reviews: 3102, cover: 'https://covers.openlibrary.org/b/id/10090785-M.jpg', badge: null,   description: 'A classic American novel about the mysterious millionaire Jay Gatsby.' },
  { id: 9,  title: 'Deep Work',               author: 'Cal Newport',         category: 'Self-Help',   price: 13.99, original_price: null,  rating: 4.7, reviews: 2801, cover: 'https://covers.openlibrary.org/b/id/9255566-M.jpg',  badge: 'CROSS',description: 'Rules for focused success in a distracted world.' },
  { id: 10, title: 'Thinking, Fast & Slow',   author: 'Daniel Kahneman',     category: 'Non-Fiction', price: 15.99, original_price: null,  rating: 4.7, reviews: 3410, cover: 'https://covers.openlibrary.org/b/id/6398631-M.jpg',  badge: null,   description: 'How two systems of thought drive the way we think and make decisions.' },
  { id: 11, title: 'Fahrenheit 451',          author: 'Ray Bradbury',        category: 'Fiction',     price: 10.99, original_price: null,  rating: 4.7, reviews: 3900, cover: 'https://covers.openlibrary.org/b/id/8228691-M.jpg',  badge: null,   description: 'A fireman whose job is burning books comes to question everything.' },
  { id: 12, title: 'The Power of Now',        author: 'Eckhart Tolle',       category: 'Self-Help',   price: 11.99, original_price: null,  rating: 4.5, reviews: 2200, cover: 'https://covers.openlibrary.org/b/id/8091016-M.jpg',  badge: 'CROSS',description: 'A guide to spiritual enlightenment and living in the present moment.' },
  { id: 13, title: 'A Brief History of Time', author: 'Stephen Hawking',     category: 'Science',     price: 12.99, original_price: null,  rating: 4.6, reviews: 4120, cover: 'https://covers.openlibrary.org/b/id/8228685-M.jpg',  badge: null,   description: 'A landmark volume exploring the cosmos and origin of the universe.' },
  { id: 14, title: 'Animal Farm',             author: 'George Orwell',       category: 'Fiction',     price: 7.99,  original_price: null,  rating: 4.5, reviews: 5100, cover: 'https://covers.openlibrary.org/b/id/8406786-M.jpg',  badge: null,   description: 'An allegorical novella reflecting the events leading up to the Russian Revolution.' },
  { id: 15, title: 'Of Mice and Men',         author: 'John Steinbeck',      category: 'Fiction',     price: 8.49,  original_price: null,  rating: 4.4, reviews: 2800, cover: 'https://covers.openlibrary.org/b/id/12818862-M.jpg', badge: 'CROSS',description: 'The story of two migrant workers dreaming of a place to call their own.' },
  { id: 16, title: 'The Road',                author: 'Cormac McCarthy',     category: 'Fiction',     price: 12.99, original_price: null,  rating: 4.5, reviews: 2950, cover: 'https://covers.openlibrary.org/b/id/8228687-M.jpg',  badge: null,   description: 'A post-apocalyptic novel following a father and son through a burned America.' },
];

const insertBook = db.prepare(`
  INSERT OR IGNORE INTO books (id, title, author, category, price, original_price, rating, reviews, cover, badge, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const b of BOOKS) {
  insertBook.run(b.id, b.title, b.author, b.category, b.price, b.original_price, b.rating, b.reviews, b.cover, b.badge, b.description);
}

// ─── Migrations: add columns if they don't exist (for existing DBs) ──────────
try { db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'"); } catch {}
try { db.exec("ALTER TABLE orders ADD COLUMN txn_ref TEXT"); } catch {}

// ─── Seed Coupon ──────────────────────────────────────────────────────────────

db.prepare("INSERT OR IGNORE INTO coupons (code, discount_pct, active) VALUES ('SUMMER20', 20, 1)").run();

// ─── Seed Test User ───────────────────────────────────────────────────────────

const existingTest = db.prepare("SELECT id FROM users WHERE email = 'test@bookstore.com'").get();
if (!existingTest) {
  const hash = bcrypt.hashSync('password123', 10);
  db.prepare(
    "INSERT INTO users (name, email, password_hash, role, points) VALUES ('Sweety K', 'test@bookstore.com', ?, 'Gold Member', 450)"
  ).run(hash);
} else {
  db.prepare("UPDATE users SET name = 'Sweety K' WHERE email = 'test@bookstore.com' AND name = 'John Doe'").run();
}

module.exports = db;
