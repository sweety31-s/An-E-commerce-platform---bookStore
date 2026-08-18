import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowRight, Sparkles, Star, BookMarked, Gift, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📚', text: '50,000+ titles in stock' },
  { icon: '🚀', text: 'Free shipping over $30' },
  { icon: '↩️', text: '30-day easy returns' },
  { icon: '🎁', text: 'Earn points on every order' },
];

const REVIEWS = [
  { name: 'Sarah M.', text: '"Best book store I\'ve used. The delivery was lightning fast!"', rating: 5, avatar: 'SM' },
  { name: 'James K.', text: '"Incredible selection and the gift points system is awesome."', rating: 5, avatar: 'JK' },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [showPwd, setShowPwd] = useState(false);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [rName,  setRName]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPwd,   setRPwd]   = useState('');
  const [regErr, setRegErr] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLoginErr(err.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegErr('');
    setRegLoading(true);
    try {
      await register(rName, rEmail, rPwd);
      navigate('/');
    } catch (err) {
      setRegErr(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-66px)] flex">

      {/* ── Left panel (decorative, hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gray-950 overflow-hidden flex-col justify-between p-10">
        {/* Background texture */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/[0.12] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-600/[0.12] rounded-full blur-[100px] pointer-events-none" />

        {/* Logo + tagline */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-blue">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              Book<span className="text-blue-400">Store</span>
            </span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-3">
            Your world of<br />books, one<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">click away.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Join 50,000+ readers who trust BookStore for the best reading experience online.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative space-y-3 my-8">
          {FEATURES.map(f => (
            <div key={f.text} className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 text-base">
                {f.icon}
              </div>
              {f.text}
            </div>
          ))}
        </div>

        {/* Mini reviews */}
        <div className="relative space-y-3">
          {REVIEWS.map(r => (
            <div key={r.name} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-300 text-xs leading-relaxed mb-3 italic">{r.text}</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold">
                  {r.avatar}
                </div>
                <span className="text-gray-500 text-xs font-semibold">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface-50 relative">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-blue-600/[0.06] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/[0.06] rounded-full blur-[80px]" />
        </div>

        <div className="relative w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 shadow-glow-blue">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Book<span className="text-blue-600">Store</span>
            </span>
            <p className="text-gray-400 text-sm mt-1">Your world of books</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-7">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {tab === 'login' ? 'Welcome back 👋' : 'Create an account ✨'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {tab === 'login' ? 'Sign in to access your bookshelf and orders.' : 'Join thousands of happy readers today.'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-card-lg border border-gray-100 overflow-hidden">

            {/* Tab switcher */}
            <div className="flex bg-gray-50/80 border-b border-gray-100">
              {[
                { key: 'login',    label: 'Sign In' },
                { key: 'register', label: 'Create Account' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex-1 py-4 text-sm font-bold transition-all duration-200 relative
                    ${tab === t.key
                      ? 'text-gray-900 bg-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-7">
              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="input-label">Email Address</label>
                    <input className="input-field" type="email" placeholder="you@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Password</label>
                    <div className="relative">
                      <input className="input-field pr-10" type={showPwd ? 'text' : 'password'}
                        placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                      <input type="checkbox" className="rounded accent-blue-600" /> Remember me
                    </label>
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  {loginErr && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-red-500">⚠️</span> {loginErr}
                    </div>
                  )}

                  <button type="submit" disabled={loginLoading}
                    className="btn-primary w-full py-3 font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in…
                      </span>
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  {/* Test credentials hint */}

                  <div className="relative flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <Link to="/"
                    className="flex items-center justify-center w-full border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
                    Continue as Guest
                  </Link>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input className="input-field" type="text" placeholder="Sweety K"
                      value={rName} onChange={e => setRName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input className="input-field" type="email" placeholder="you@email.com"
                      value={rEmail} onChange={e => setREmail(e.target.value)} required />
                  </div>
                  <div>
                    <label className="input-label">Password</label>
                    <input className="input-field" type="password" placeholder="Choose a strong password (min 8 chars)"
                      value={rPwd} onChange={e => setRPwd(e.target.value)} required />
                  </div>

                  {/* Perks */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-3.5 space-y-2">
                    <p className="text-xs font-bold text-gray-600 mb-2">✨ You'll get:</p>
                    {[
                      '450 welcome gift points ($4.50)',
                      'Coupon SUMMER20 (20% off your first order)',
                      'Free shipping on orders over $30',
                    ].map(perk => (
                      <div key={perk} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {perk}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400">
                    By creating an account you agree to our{' '}
                    <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                    <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>.
                  </p>

                  {regErr && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                      <span>⚠️</span> {regErr}
                    </div>
                  )}

                  <button type="submit" disabled={regLoading}
                    className="btn-secondary w-full py-3 font-bold rounded-xl disabled:opacity-60">
                    {regLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account…
                      </span>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-5">
            🔒 Your data is encrypted and never shared.
          </p>
        </div>
      </div>
    </div>
  );
}
