import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, BookOpen, Menu, X, User, LogOut, Package, Search, Sparkles, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      searchRef.current?.blur();
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-profile-menu]')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const navLinks = [
    { label: 'Home',    to: '/'               },
    { label: 'Catalog', to: '/browse'         },
    { label: 'Deals',   to: '/browse?badge=SALE', badge: '🔥' },
  ];

  const isActive = (to) =>
    to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(to.split('?')[0]);

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <nav className="bg-gray-950 text-white sticky top-0 z-50 border-b border-white/[0.06]">
      {/* Top gradient accent bar */}
      <div className="h-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-[62px] gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group mr-1">
            <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-blue group-hover:shadow-glow-purple transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-[17px] h-[17px] text-white" />
              <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-white/15 to-transparent" />
            </div>
            <span className="font-extrabold text-[15px] text-white tracking-tight leading-none">
              Book<span className="text-blue-400">Store</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5 ml-1">
            {navLinks.map(l => (
              <Link key={l.label} to={l.to}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5
                  ${isActive(l.to)
                    ? 'text-white bg-white/[0.1]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.07]'}`}>
                {l.badge && <span className="text-sm leading-none">{l.badge}</span>}
                {l.label}
                {isActive(l.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-400 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm ml-3">
            <div className={`relative w-full transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none transition-colors duration-150" />
              <input
                ref={searchRef}
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search books, authors…"
                className={`w-full rounded-xl pl-9 pr-4 py-[7px] text-sm text-white placeholder-gray-500
                  transition-all duration-200 focus:outline-none
                  ${searchFocused
                    ? 'bg-white/[0.12] border border-blue-500/50 ring-2 ring-blue-500/20'
                    : 'bg-white/[0.07] border border-white/[0.1] hover:bg-white/[0.1]'}`}
              />
              {searchVal && (
                <button type="button" onClick={() => setSearchVal('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Cart button */}
            <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-white transition-all duration-150 rounded-xl hover:bg-white/[0.08] group">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-extrabold rounded-full
                                 w-[18px] h-[18px] flex items-center justify-center shadow-sm
                                 ring-2 ring-gray-950 animate-scale-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="relative hidden md:block" data-profile-menu>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 pl-1.5 pr-2.5 py-[5px] rounded-xl border transition-all duration-150
                    ${profileOpen
                      ? 'bg-white/[0.12] border-white/[0.2]'
                      : 'bg-white/[0.07] border-white/[0.08] hover:bg-white/[0.11] hover:border-white/[0.15]'}`}>
                  <div className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0 shadow-sm">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-white/90 hidden sm:inline max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-card-lg border border-gray-100/80 py-1.5 z-50 animate-slide-up">
                    {/* User info header */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0 shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mx-3 h-px bg-gray-100 mb-1" />
                    {user.points > 0 && (
                      <div className="mx-3 mb-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-amber-700">{user.points} Gift Points</span>
                        <span className="ml-auto text-[11px] text-amber-500 font-semibold">${(user.points / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-lg mx-1">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      My Orders
                    </Link>
                    <div className="mx-3 h-px bg-gray-100 my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors rounded-lg mx-1">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="hidden md:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-150 shadow-sm">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.08] transition-all duration-150"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950/98 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-5 pt-3 space-y-1 animate-fade-in">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search books…"
                className="w-full bg-white/[0.08] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.12] transition-all"
              />
            </div>
          </form>

          {navLinks.map(l => (
            <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150
                ${isActive(l.to)
                  ? 'bg-white/[0.1] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.07]'}`}>
              {l.badge && <span>{l.badge}</span>}
              {l.label}
            </Link>
          ))}

          <div className="border-t border-white/[0.07] pt-3 mt-2 space-y-1">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white/[0.05] rounded-xl mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.07] transition-all">
                  <User className="w-4 h-4" /> My Profile
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.07] transition-all">
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
