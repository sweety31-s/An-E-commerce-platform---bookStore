import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Heart, Check, ArrowLeft, BookOpen, Globe, Package, Loader2 } from 'lucide-react';
import { BOOKS } from '../data/books';
import BookCard from '../components/BookCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useState, useEffect } from 'react';

const FORMATS = ['Paperback', 'Hardcover', 'eBook', 'Audiobook'];

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [format, setFormat] = useState('Paperback');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const [book,    setBook]    = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/books/${id}`),
      api.get(`/api/books/${id}/related`),
    ])
      .then(([b, rel]) => {
        setBook(b);
        setRelated(rel);
      })
      .catch(() => {
        // Fallback to local data
        const fallback = BOOKS.find(b => b.id === Number(id));
        setBook(fallback || null);
        if (fallback) {
          setRelated(BOOKS.filter(b => b.id !== fallback.id && b.category === fallback.category).slice(0, 4));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Sync wishlist state for logged-in users
  useEffect(() => {
    if (!user || !book) return;
    api.get('/api/wishlist')
      .then(items => setWishlist(items.some(i => i.book_id === book.id)))
      .catch(() => {});
  }, [user, book]);

  const handleAddToCart = () => {
    addToCart(book, qty, format);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    const next = !wishlist;
    setWishlist(next);
    try {
      if (next) await api.post('/api/wishlist', { book_id: book.id });
      else      await api.delete(`/api/wishlist/${book.id}`);
    } catch {
      setWishlist(!next);
    }
  };

  if (loading) return (
    <div className="page-wrapper flex items-center justify-center py-32">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  if (!book) return (
    <div className="page-wrapper text-center py-24">
      <div className="text-6xl mb-5">📚</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Book not found</h2>
      <p className="text-gray-400 mb-6">This book may have been removed or the link is incorrect.</p>
      <Link to="/browse" className="btn-primary inline-block">Back to Catalog</Link>
    </div>
  );

  const discountPct = book.originalPrice || book.original_price
    ? Math.round((1 - book.price / (book.originalPrice || book.original_price)) * 100)
    : null;

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-gray-300">›</span>
        <Link to="/browse" className="hover:text-blue-600 transition-colors">Catalog</Link>
        <span className="text-gray-300">›</span>
        <Link to={`/browse?category=${book.category}`} className="hover:text-blue-600 transition-colors">{book.category}</Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-700 font-medium truncate max-w-[200px]">{book.title}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[330px_1fr] gap-10 mb-16">
        {/* Cover column */}
        <div className="flex flex-col items-center md:items-start gap-5">
          <div className="relative w-full max-w-[300px] group">
            {book.badge === 'SALE' && discountPct && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm">
                −{discountPct}% OFF
              </span>
            )}
            <img
              src={book.cover}
              alt={book.title}
              className="rounded-2xl shadow-card-xl w-full aspect-[2/3] object-cover group-hover:scale-[1.01] transition-transform duration-500"
              onError={e => { e.target.src = 'https://placehold.co/256x384/e2e8f0/94a3b8?text=Book+Cover'; }}
            />
          </div>
          {/* Format selector */}
          <div className="w-full max-w-[300px]">
            <p className="section-label">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-150
                    ${format === f
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white hover:-translate-y-0.5'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="w-full max-w-[300px] bg-green-50 border border-green-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span className="text-base">🚚</span>
              <div>
                <p className="font-bold text-xs">Free Delivery on orders over $30</p>
                <p className="text-xs text-green-600 mt-0.5">Ships within 1 business day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full mb-3">
            {book.category}
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mt-0 mb-2 leading-tight">{book.title}</h1>
          <p className="text-gray-500 text-base mb-4">
            by <Link to={`/browse?q=${encodeURIComponent(book.author)}`} className="text-gray-800 font-bold hover:text-blue-600 transition-colors">{book.author}</Link>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="flex gap-0.5">
              {stars.map(s => (
                <Star key={s} className={`w-[18px] h-[18px] ${s <= Math.round(book.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
              ))}
            </div>
            <span className="font-extrabold text-gray-900 text-sm bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">{book.rating}</span>
            <span className="text-gray-400 text-sm">({book.reviews.toLocaleString()} ratings)</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6 text-base">{book.description}</p>

          {/* Book meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
            {[
              { Icon: BookOpen, label: 'Format',       value: format        },
              { Icon: Package,  label: 'Genre',        value: book.category },
              { Icon: Globe,    label: 'Language',     value: 'English'     },
              { Icon: Check,    label: 'Availability', value: 'In Stock ✓'  },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="bg-gray-50/80 border border-gray-100 rounded-xl px-3.5 py-3 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-150">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400 text-xs font-medium">{label}</span>
                </div>
                <p className="font-bold text-gray-800 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Price + qty */}
          <div className="flex items-center gap-5 mb-7 pb-7 border-b border-gray-100">
            <div>
              <span className="text-4xl font-black text-gray-900">${book.price.toFixed(2)}</span>
              {(book.originalPrice || book.original_price) && (
                <span className="ml-2.5 text-gray-400 line-through text-lg">${(book.originalPrice || book.original_price).toFixed(2)}</span>
              )}
              {discountPct && (
                <span className="ml-2 text-sm font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg">Save {discountPct}%</span>
              )}
            </div>
            {/* Qty stepper */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner-sm">
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold transition-colors">−</button>
              <span className="px-4 py-2.5 text-sm font-extrabold border-x border-gray-200 min-w-[44px] text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)}
                className="px-3.5 py-2.5 text-gray-600 hover:bg-gray-100 font-bold transition-colors">+</button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all duration-200
                ${added
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm active:scale-[0.97]'}`}>
              {added
                ? <><Check className="w-4 h-4" /> Added to Cart!</>
                : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
            </button>
            <Link to="/checkout"
              onClick={() => addToCart(book, qty, format)}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-sm active:scale-[0.97] transition-all duration-200">
              <Zap className="w-4 h-4" /> Buy Now
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleWishlist}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-all px-3 py-1.5 rounded-xl border
                ${wishlist
                  ? 'text-red-500 bg-red-50 border-red-200'
                  : 'text-gray-500 bg-gray-50 border-gray-200 hover:text-red-400 hover:bg-red-50 hover:border-red-200'}`}>
              <Heart className={`w-4 h-4 ${wishlist ? 'fill-current' : ''}`} />
              {wishlist ? 'Saved' : 'Save to Wishlist'}
            </button>
          </div>

          {/* Gift note */}
          <div className="mt-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">🎁</span>
            <div>
              <p className="font-bold text-sm">Gift Options Available</p>
              <p className="text-amber-700 text-xs mt-0.5">Add gift wrapping or a personalised message at checkout — surprise someone you love!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related books */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Customers Also Bought</h2>
              <p className="text-xs text-gray-400 mt-0.5">Based on readers who purchased this title</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((b, i) => (
              <div key={b.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
