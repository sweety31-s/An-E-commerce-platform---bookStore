import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, Loader2, LayoutGrid, LayoutList, Star, ShoppingCart } from 'lucide-react';
import BookCard from '../components/BookCard';
import { BOOKS, CATEGORIES } from '../data/books';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance'  },
  { label: 'Price ↑',   value: 'price_asc'  },
  { label: 'Price ↓',   value: 'price_desc' },
  { label: 'Top Rated', value: 'rating'     },
  { label: 'Newest',    value: 'new'        },
];

const PRICE_RANGES = [
  { label: 'Under $10',  min: 0,  max: 10   },
  { label: '$10 – $15',  min: 10, max: 15   },
  { label: '$15 – $20',  min: 15, max: 20   },
  { label: 'Over $20',   min: 20, max: 9999 },
];

const BADGE_OFFERS = [
  { label: '🔥 On Sale',     value: 'SALE'  },
  { label: '⭐ Staff Picks',  value: 'CROSS' },
  { label: '↑ Trending',     value: 'UP'    },
];

// ── List-view book row ───────────────────────────────────────────────────────
function ListBookCard({ book }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const discountPct = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : null;

  return (
    <div className="card p-4 flex gap-4 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 group">
      <Link to={`/books/${book.id}`} className="flex-shrink-0">
        <img
          src={book.cover} alt={book.title}
          className="w-16 h-[88px] object-cover rounded-xl border border-gray-100 shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
          onError={e => { e.target.src = 'https://placehold.co/64x88/e2e8f0/94a3b8?text=B'; }}
        />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {book.category && (
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{book.category}</span>
            )}
            <Link to={`/books/${book.id}`}
              className="block font-bold text-gray-900 hover:text-blue-600 transition-colors text-sm leading-snug mt-0.5 line-clamp-2">
              {book.title}
            </Link>
            <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
          </div>
          {book.badge === 'SALE' && discountPct && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
              −{discountPct}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-auto">
          <div className="flex gap-px">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.round(book.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{book.rating}</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
        <div className="text-right">
          <p className="font-extrabold text-blue-600 text-lg">${book.price.toFixed(2)}</p>
          {book.originalPrice && (
            <p className="text-xs text-gray-400 line-through">${book.originalPrice.toFixed(2)}</p>
          )}
        </div>
        <button onClick={handleAdd}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-200
            ${added ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}>
          {added ? '✓ Added' : <><ShoppingCart className="w-3 h-3" /> Add</>}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BrowsePage() {
  const [params] = useSearchParams();
  const [search,        setSearch]        = useState(params.get('q')        || '');
  const [selectedCat,   setSelectedCat]   = useState(params.get('category') || '');
  const [selectedBadge, setSelectedBadge] = useState(params.get('badge')    || '');
  const [priceRange,    setPriceRange]    = useState(null);
  const [sort,          setSort]          = useState('relevance');
  const [viewMode,      setViewMode]      = useState('grid');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (selectedCat)   qs.set('category', selectedCat);
      if (selectedBadge) qs.set('badge',    selectedBadge);
      if (search)        qs.set('q',        search);
      if (sort !== 'relevance' && sort !== 'new') qs.set('sort', sort);

      const data = await api.get(`/api/books?${qs.toString()}`);
      let result = data;
      if (priceRange) result = result.filter(b => b.price >= priceRange.min && b.price < priceRange.max);
      setBooks(result);
    } catch {
      let list = [...BOOKS];
      if (search)        list = list.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
      if (selectedCat)   list = list.filter(b => b.category === selectedCat);
      if (selectedBadge) list = list.filter(b => b.badge === selectedBadge);
      if (priceRange)    list = list.filter(b => b.price >= priceRange.min && b.price < priceRange.max);
      if (sort === 'price_asc')  list.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
      setBooks(list);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCat, selectedBadge, priceRange, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const clearFilters = () => {
    setSearch(''); setSelectedCat(''); setSelectedBadge(''); setPriceRange(null); setSort('relevance');
  };

  const activeFilterCount = [selectedCat, selectedBadge, priceRange].filter(Boolean).length;
  const hasFilters = search || selectedCat || selectedBadge || priceRange;

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="section-label">Category</h3>
        <div className="space-y-0.5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCat(selectedCat === cat ? '' : cat)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between
                ${selectedCat === cat
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <span>{cat}</span>
              {selectedCat === cat && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Price */}
      <div>
        <h3 className="section-label">Price Range</h3>
        <div className="space-y-0.5">
          {PRICE_RANGES.map(r => (
            <button key={r.label} onClick={() => setPriceRange(priceRange?.label === r.label ? null : r)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between
                ${priceRange?.label === r.label
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              {r.label}
              {priceRange?.label === r.label && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Offers */}
      <div>
        <h3 className="section-label">Offers & Badges</h3>
        <div className="space-y-0.5">
          {BADGE_OFFERS.map(b => (
            <button key={b.value} onClick={() => setSelectedBadge(selectedBadge === b.value ? '' : b.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-150 flex items-center justify-between
                ${selectedBadge === b.value
                  ? 'bg-red-50 text-red-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              {b.label}
              {selectedBadge === b.value && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearFilters}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2.5 rounded-xl transition-all">
          <X className="w-3.5 h-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-in">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
        <span className="cursor-default hover:text-gray-600">Home</span>
        <span className="text-gray-300">›</span>
        <span className="font-semibold text-gray-700">
          Catalog{selectedCat ? ` › ${selectedCat}` : ''}
        </span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Browse Books</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {loading
              ? 'Loading titles…'
              : <><span className="font-semibold text-gray-700">{books.length}</span> titles {hasFilters ? 'match your filters' : 'available'}</>
            }
          </p>
        </div>
        {/* View toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all duration-150 ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
            aria-label="Grid view">
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all duration-150 ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
            aria-label="List view">
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCat && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {selectedCat}
              <button onClick={() => setSelectedCat('')}><X className="w-3 h-3 hover:text-blue-900" /></button>
            </span>
          )}
          {selectedBadge && (
            <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {BADGE_OFFERS.find(b => b.value === selectedBadge)?.label || selectedBadge}
              <button onClick={() => setSelectedBadge('')}><X className="w-3 h-3 hover:text-red-900" /></button>
            </span>
          )}
          {priceRange && (
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {priceRange.label}
              <button onClick={() => setPriceRange(null)}><X className="w-3 h-3 hover:text-green-900" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              "{search}"
              <button onClick={() => setSearch('')}><X className="w-3 h-3 hover:text-purple-900" /></button>
            </span>
          )}
        </div>
      )}

      {/* Search + Sort toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input className="input-field pl-10" type="text" placeholder="Search by title or author…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-150
                ${sort === o.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
              {o.label}
            </button>
          ))}

          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all
              ${activeFilterCount > 0
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-blue-600 text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="bg-white w-72 h-full p-5 overflow-y-auto shadow-xl animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-extrabold text-gray-900 text-base">Filter Books</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                viewMode === 'grid' ? (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-52 bg-gray-100" />
                    <div className="p-3.5 space-y-2.5">
                      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 animate-pulse">
                    <div className="w-16 h-24 bg-gray-100 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2.5 pt-1">
                      <div className="h-4 bg-gray-100 rounded-full w-2/3" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 card p-8">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button onClick={fetchBooks} className="btn-outline">Retry</button>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-20 card p-8">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No books found</h3>
              <p className="text-gray-400 text-sm mb-5">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="btn-outline">Clear All Filters</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((book, i) => (
                <div key={book.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 7) * 40}ms`, animationFillMode: 'both' }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {books.map(book => <ListBookCard key={book.id} book={book} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
