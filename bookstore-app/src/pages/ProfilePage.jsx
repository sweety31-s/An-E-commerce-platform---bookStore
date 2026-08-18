import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { api } from '../api/client';
import { useState, useEffect } from 'react';
import {
  Package, MapPin, CreditCard, Gift, Heart,
  Bell, Settings, LogOut, Star, User, ArrowRight,
  TrendingUp, BookOpen, Sparkles, Award
} from 'lucide-react';

const TILES = [
  { label: 'My Orders',        desc: 'View, track, return orders',         Icon: Package,    to: '/orders', color: 'blue'   },
  { label: 'Saved Addresses',  desc: 'Manage shipping addresses',          Icon: MapPin,     to: '#',       color: 'green'  },
  { label: 'Payment Methods',  desc: 'Cards, bank accounts, wallet',       Icon: CreditCard, to: '#',       color: 'purple' },
  { label: 'Gift & Wallet',    desc: 'Gift balance & transaction history', Icon: Gift,       to: '#',       color: 'yellow' },
  { label: 'Wishlist',         desc: 'Saved books & price-drop alerts',    Icon: Heart,      to: '#',       color: 'red'    },
  { label: 'Notifications',    desc: 'Order updates, offers & alerts',     Icon: Bell,       to: '#',       color: 'indigo' },
  { label: 'Account Settings', desc: 'Password, email & privacy',         Icon: Settings,   to: '#',       color: 'gray'   },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-200/60'   },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'ring-green-200/60'  },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-200/60' },
  yellow: { bg: 'bg-amber-50',  icon: 'text-amber-600',  ring: 'ring-amber-200/60'  },
  red:    { bg: 'bg-red-50',    icon: 'text-red-500',    ring: 'ring-red-200/60'    },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-200/60' },
  gray:   { bg: 'bg-gray-100',  icon: 'text-gray-600',   ring: 'ring-gray-200/60'   },
};

const ACHIEVEMENTS = [
  { icon: '📚', label: 'Bookworm',   desc: '10+ books purchased',  earned: true  },
  { icon: '⭐', label: 'Top Rater',  desc: 'Rate 5 books',         earned: true  },
  { icon: '🎁', label: 'Gift Giver', desc: 'Send a gift card',     earned: false },
  { icon: '🚀', label: 'Trendsetter',desc: 'Buy 3 new releases',   earned: false },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, booksPurchased: 0, wishlistCount: 0 });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) return;
    api.get('/api/profile/stats')
      .then(data => setStats(data))
      .catch(() => {});
  }, [user]);

  if (!user) return (
    <div className="page-wrapper text-center py-24 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <User className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2">You're not signed in</h2>
      <p className="text-gray-400 mb-7 max-w-sm mx-auto">Sign in to manage your account, orders, and wishlist.</p>
      <Link to="/login" className="btn-primary py-3 px-7 font-bold">
        Sign In <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  const handleLogout = () => { logout(); navigate('/'); };
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const points = user.points ?? 450;

  return (
    <div className="animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gray-950">
        {/* Background texture */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-blue-600/[0.1] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-purple-600/[0.1] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-glow-blue">
                {initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-green-400 border-2 border-gray-950 shadow-sm" />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
              </div>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start flex-wrap">
                <Badge status={user.role?.split(' ')[0] || 'Silver'} />
                <span className="text-xs text-gray-500">Member since Jan 2023</span>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                {[
                  { Icon: Package,   val: stats.totalOrders,    label: 'Orders',   color: 'text-blue-400'   },
                  { Icon: BookOpen,  val: stats.booksPurchased, label: 'Books',    color: 'text-purple-400' },
                  { Icon: Heart,     val: stats.wishlistCount,  label: 'Wishlist', color: 'text-pink-400'   },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <s.Icon className={`w-4 h-4 ${s.color}`} />
                    <span className="text-white font-extrabold text-sm">{s.val}</span>
                    <span className="text-gray-500 text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Points card */}
            <div className="flex-shrink-0 bg-gradient-to-br from-amber-500/[0.15] to-amber-600/[0.1] border border-amber-500/[0.2] rounded-2xl px-6 py-5 text-center min-w-[140px]">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-3xl font-black text-white">{points}</span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium">Gift Points</p>
              <p className="text-xs font-extrabold text-amber-400 mt-1">≈ ${(points / 100).toFixed(2)} value</p>
              <div className="mt-3 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-lg font-semibold">
                Use at checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrapper">

        {/* ── Achievements ── */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-gray-900 text-sm">Achievements</h2>
            <span className="ml-auto text-xs text-gray-400">{ACHIEVEMENTS.filter(a => a.earned).length}/{ACHIEVEMENTS.length} earned</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map(ach => (
              <div key={ach.label}
                className={`rounded-xl p-3 text-center transition-all duration-200 border
                  ${ach.earned
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/80'
                    : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                <span className={`text-2xl block mb-1.5 ${!ach.earned ? 'grayscale' : ''}`}>{ach.icon}</span>
                <p className="text-xs font-bold text-gray-800">{ach.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{ach.desc}</p>
                {ach.earned && (
                  <span className="inline-block mt-1.5 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    Earned ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Orders',    value: stats.totalOrders,    color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Package   },
            { label: 'Books Purchased', value: stats.booksPurchased, color: 'text-purple-600', bg: 'bg-purple-50', icon: BookOpen  },
            { label: 'Wishlist Items',  value: stats.wishlistCount,  color: 'text-green-600',  bg: 'bg-green-50',  icon: Heart     },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${s.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tiles grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {TILES.map(({ label, desc, Icon, to, color }) => {
            const c = COLOR_MAP[color];
            return (
              <Link key={label} to={to}
                className="card p-4 flex items-center gap-4 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${c.bg} ${c.icon} ${c.ring}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* ── Sign out ── */}
        <div className="card p-4 flex items-center justify-between border-red-100/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <LogOut className="w-[18px] h-[18px] text-red-500" />
            </div>
            <div>
              <p className="font-bold text-red-600 text-sm">Sign Out</p>
              <p className="text-xs text-gray-400">End your current session</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-danger px-4 py-2 text-xs">
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
