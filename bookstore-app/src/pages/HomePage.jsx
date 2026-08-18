import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, Gift, Sparkles, BookMarked, Truck, RotateCcw, Loader2, Star } from 'lucide-react';
import BookCard from '../components/BookCard';
import { BOOKS, CATEGORIES } from '../data/books';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useState, useEffect } from 'react';

const TRUST_ITEMS = [
  { Icon: BookMarked, value: '50K+', label: 'Titles',          color: 'text-blue-400'   },
  { Icon: Sparkles,   value: '4.8',  label: 'Avg. Rating',    color: 'text-amber-400'  },
  { Icon: Truck,      value: 'Free', label: 'Ship over $30',  color: 'text-green-400'  },
  { Icon: RotateCcw,  value: '30d',  label: 'Easy Returns',   color: 'text-purple-400' },
];

const CATEGORY_ICONS = {
  'Fiction': '📖', 'Non-Fiction': '📰', 'Science': '🔬',
  'History': '🏛️', 'Biography': '👤', 'Technology': '💻',
  'Self-Help': '🌱', 'Children': '🧸', 'Mystery': '🔍', 'Fantasy': '🧙',
};

export default function HomePage() {
  const { user } = useAuth();
  const [featured,        setFeatured]        = useState([]);
  const [recommended,     setRecommended]     = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRec,      setLoadingRec]      = useState(false);

  useEffect(() => {
    api.get('/api/books?sort=rating')
      .then(books => setFeatured(books.slice(0, 8)))
      .catch(() => setFeatured(BOOKS.slice(0, 8)))
      .finally(() => setLoadingFeatured(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setRecommended(BOOKS.filter(b => b.badge === 'CROSS' || b.badge === null).slice(4, 8));
      return;
    }
    setLoadingRec(true);
    api.get('/api/profile/recommendations')
      .then(books => setRecommended(books))
      .catch(() => setRecommended(BOOKS.filter(b => b.badge === 'CROSS' || b.badge === null).slice(4, 8)))
      .finally(() => setLoadingRec(false));
  }, [user]);

  return (
    <div className="animate-fade-in">

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gray-950 text-white">
        {/* Background layers */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-600/[0.12] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] bg-purple-600/[0.12] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* ── Text Column ── */}
            <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">

              {/* Chip */}
              {user ? (
                <div className="inline-flex items-center gap-2 bg-blue-500/[0.12] text-blue-300 border border-blue-500/[0.2] text-xs font-bold px-3.5 py-1.5 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-soft" />
                  Welcome back, {user.name.split(' ')[0]}! Your books await.
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-amber-500/[0.1] text-amber-300 border border-amber-500/[0.2] text-xs font-bold px-3.5 py-1.5 rounded-full mb-6">
                  <Zap className="w-3 h-3" />
                  Summer Sale — Up to 40% Off
                </div>
              )}

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-5">
                Discover Your<br />
                Next Great<br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                    Read Today
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60" />
                </span>
              </h1>

              <p className="text-gray-400 text-lg mb-9 leading-relaxed">
                Explore thousands of books across every genre.<br className="hidden sm:block" />
                <span className="text-gray-300 font-medium">Free shipping</span> on orders over $30.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/browse"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-glow-blue transition-all duration-150">
                  Browse Catalog <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/browse?badge=SALE"
                  className="inline-flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] text-white border border-white/[0.12] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-150">
                  <Zap className="w-4 h-4 text-amber-400" /> View Deals
                </Link>
              </div>

              {/* Review strip */}
              <div className="flex items-center gap-3 mt-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500'].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-bold`}>
                      {['JD', 'AS', 'MK', 'LR'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">50,000+ happy readers</p>
                </div>
              </div>
            </div>

            {/* ── Stats Grid Column ── */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {TRUST_ITEMS.map(({ Icon, value, label, color }) => (
                <div key={label}
                  className="group bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-5 text-center transition-all duration-200 min-w-[130px] cursor-default">
                  <div className={`w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${color}`} />
                  </div>
                  <div className="text-2xl font-black text-white leading-none mb-1.5">{value}</div>
                  <div className="text-[11px] text-gray-500 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface-50 to-transparent pointer-events-none" />
      </section>

      {/* Personalised notice */}
      {user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/80 px-4 py-2.5">
          <p className="max-w-7xl mx-auto text-blue-700 text-sm text-center font-medium flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Recommendations below are tailored to your order history
          </p>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══════════════════════════════════════════════════ */}
      <div className="page-wrapper">

        {/* ── Categories ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <BookMarked className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Browse by Genre</h2>
              <p className="text-xs text-gray-400">Find your next favourite in any category</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/browse?category=${cat}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium
                           hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-card-md hover:-translate-y-0.5
                           transition-all duration-200 shadow-card">
                <span className="text-base leading-none">{CATEGORY_ICONS[cat] || '📚'}</span>
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured Books ── */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Featured Books</h2>
                <p className="text-xs text-gray-400 mt-0.5">Bestsellers and staff picks this week</p>
              </div>
            </div>
            <Link to="/browse" className="btn-outline text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-3.5 space-y-2.5">
                    <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                    <div className="h-8 bg-gray-100 rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featured.map((book, i) => (
                <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recommended ── */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Gift className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Recommended For You</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {user ? 'Based on your order history' : 'Curated picks you might love'}
                </p>
              </div>
            </div>
          </div>
          {loadingRec ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {recommended.map((book, i) => (
                <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Why Choose Us strip ── */}
        <section className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🚀', bg: 'bg-blue-50', border: 'border-blue-100',
                title: 'Fast Delivery', desc: 'Same-day dispatch for orders placed before 2 PM. Track your shipment in real time.',
              },
              {
                icon: '🛡️', bg: 'bg-green-50', border: 'border-green-100',
                title: 'Secure & Trusted', desc: 'SSL-encrypted checkout. Your payment info is always safe with us.',
              },
              {
                icon: '↩️', bg: 'bg-purple-50', border: 'border-purple-100',
                title: 'Easy Returns', desc: '30-day hassle-free returns. Just click "Return" on your order — we handle the rest.',
              },
            ].map(({ icon, bg, border, title, desc }) => (
              <div key={title} className={`${bg} ${border} border rounded-2xl p-6 flex gap-4`}>
                <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Promo CTA ── */}
        <section className="relative overflow-hidden rounded-3xl text-white">
          {/* Layered background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a5f]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.04) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

          {/* Floating book emoji decorations */}
          <div className="absolute top-6 right-24 text-3xl opacity-20 animate-float-slow" style={{ animationDelay: '0s' }}>📚</div>
          <div className="absolute bottom-6 right-12 text-2xl opacity-15 animate-float-slow" style={{ animationDelay: '2s' }}>📖</div>
          <div className="absolute top-10 right-60 text-xl opacity-15 animate-float-slow" style={{ animationDelay: '1s' }}>✨</div>

          <div className="relative px-8 py-12 sm:px-12 sm:py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3 h-3" /> Members earn 2× points on every order
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
              Join Our Reading Club
            </h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto leading-relaxed text-base">
              Get exclusive deals, early access to new releases, and earn gift points redeemable on any purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-extrabold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-sm active:scale-[0.97]">
                Sign Up Free — It's Fast <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/browse"
                className="inline-flex items-center justify-center gap-2 bg-white/[0.1] text-white border border-white/[0.15] font-semibold px-8 py-3.5 rounded-xl hover:bg-white/[0.17] transition-colors text-sm active:scale-[0.97]">
                Browse Deals
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
