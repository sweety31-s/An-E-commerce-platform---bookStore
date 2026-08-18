import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BADGE_CONFIG = {
  SALE:  { bg: 'bg-red-500',    text: 'text-white' },
  CROSS: { bg: 'bg-violet-600', text: 'text-white' },
  UP:    { bg: 'bg-orange-500', text: 'text-white' },
};

const BADGE_LABEL = {
  CROSS: '⭐ Pick',
  UP:    '↑ Trending',
};

export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPct = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(!wishlist);
  };

  const rating = book.rating ?? 4.5;
  const reviews = book.reviews ?? 0;
  const fullStars = Math.round(rating);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-card-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">

      {/* Cover image area */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-gray-50 flex-shrink-0">
        <Link to={`/books/${book.id}`} className="block">
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-52 object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.src = 'https://placehold.co/200x280/e2e8f0/94a3b8?text=Book+Cover';
            }}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Quick view button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-bold px-3.5 py-2 rounded-full shadow-float translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </span>
          </div>
        </Link>

        {/* Badge */}
        {book.badge && (() => {
          const cfg = BADGE_CONFIG[book.badge];
          const label = book.badge === 'SALE' && discountPct ? `−${discountPct}%` : (BADGE_LABEL[book.badge] || book.badge);
          return (
            <span className={`absolute top-2.5 left-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm tracking-wide ${cfg.bg} ${cfg.text}`}>
              {label}
            </span>
          );
        })()}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200
            ${wishlist
              ? 'bg-red-500 text-white scale-100 opacity-100'
              : 'bg-white/95 backdrop-blur-sm text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 hover:scale-110'}`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${wishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 gap-0.5">
        {/* Category chip */}
        {book.category && (
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">{book.category}</span>
        )}

        <Link
          to={`/books/${book.id}`}
          className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
        >
          {book.title}
        </Link>

        <p className="text-[11px] text-gray-400 truncate mt-0.5">{book.author}</p>

        {/* Stars */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex gap-px">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < fullStars ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-700 ml-0.5">{rating}</span>
          {reviews > 0 && (
            <span className="text-[10px] text-gray-400">({reviews > 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews})</span>
          )}
        </div>

        {/* Price + button */}
        <div className="flex items-center justify-between mt-auto pt-3 gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-blue-600 text-base">${book.price.toFixed(2)}</span>
            {book.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through">${book.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex-shrink-0
              ${added
                ? 'bg-green-500 text-white shadow-sm scale-95'
                : 'bg-primary text-white hover:bg-primary-dark shadow-sm active:scale-[0.95]'}`}
          >
            {added ? (
              <>✓ Added</>
            ) : (
              <><ShoppingCart className="w-3 h-3" /> Add</>
            )}
          </button>
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}
