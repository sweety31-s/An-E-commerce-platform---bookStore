import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Tag, Gift, ShoppingBag, ArrowRight, Truck, Shield, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const {
    items, removeFromCart, updateQty,
    subtotal, discount, giftDiscount, shipping, tax, total,
    coupon, applyCoupon, giftApplied, setGiftApplied,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg,   setCouponMsg]   = useState('');
  const [couponErr,   setCouponErr]   = useState('');

  const handleCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponMsg('Coupon applied — 20% off!');
      setCouponErr('');
    } else {
      setCouponErr('Invalid coupon code. Try SUMMER20');
      setCouponMsg('');
    }
  };

  const freeShippingThreshold = 30;
  const progressPct = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining   = Math.max(freeShippingThreshold - subtotal, 0);

  if (items.length === 0) return (
    <div className="page-wrapper text-center py-28 animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your cart is empty</h2>
      <p className="text-gray-400 mb-7 max-w-sm mx-auto">Add some books you love and they'll show up here.</p>
      <Link to="/browse" className="btn-primary py-3 px-7 text-sm font-bold">
        Browse Books <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="page-wrapper animate-fade-in">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
          <ShoppingBag className="w-4.5 h-4.5 w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>
      </div>

      {/* Free shipping progress bar */}
      <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center gap-4 transition-all duration-300 ${shipping === 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${shipping === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Truck className={`w-4.5 h-4.5 w-[18px] h-[18px] ${shipping === 0 ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-bold ${shipping === 0 ? 'text-green-700' : 'text-blue-700'}`}>
            {shipping === 0
              ? '🎉 You\'ve unlocked free shipping!'
              : `Add $${remaining.toFixed(2)} more for free shipping`
            }
          </p>
          <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${shipping === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        {shipping === 0 && <span className="text-green-600 font-extrabold text-sm">Free!</span>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4 hover:shadow-card-md transition-all duration-200 group">
              <Link to={`/books/${item.id}`} className="flex-shrink-0">
                <img src={item.cover} alt={item.title}
                  className="w-[68px] h-[96px] object-cover rounded-xl border border-gray-100 shadow-sm group-hover:scale-[1.03] transition-transform duration-300"
                  onError={e => { e.target.src = 'https://placehold.co/68x96/e2e8f0/94a3b8?text=Book'; }} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.id}`}
                  className="font-bold text-gray-900 hover:text-blue-600 line-clamp-2 text-sm transition-colors">
                  {item.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.author}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-block text-[11px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Paperback</span>
                  {item.badge === 'SALE' && (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Sale</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  {/* Qty stepper */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-inner-sm">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors text-gray-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-extrabold border-x border-gray-200 min-w-[36px] text-center text-gray-800">
                      {item.qty}
                    </span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors text-gray-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors font-medium group/btn">
                    <Trash2 className="w-3 h-3 group-hover/btn:scale-110 transition-transform" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-extrabold text-gray-900 text-xl">${(item.price * item.qty).toFixed(2)}</p>
                {item.qty > 1 && <p className="text-xs text-gray-400 mt-0.5">${item.price.toFixed(2)} each</p>}
              </div>
            </div>
          ))}

          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-blue-500" />
              </div>
              Promo / Coupon Code
            </h3>
            <div className="flex gap-2">
              <input className="input-field" placeholder="e.g. SUMMER20" value={couponInput}
                onChange={e => setCouponInput(e.target.value)} disabled={!!coupon} />
              <button onClick={handleCoupon} disabled={!!coupon}
                className="btn-primary px-5 py-2.5 whitespace-nowrap disabled:opacity-50">
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className="flex items-center gap-1.5 text-green-700 text-xs mt-2.5 bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                ✅ {couponMsg}
              </p>
            )}
            {couponErr && (
              <p className="flex items-center gap-1.5 text-red-600 text-xs mt-2.5 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                ❌ {couponErr}
              </p>
            )}
          </div>

          {/* Gift points */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Gift Points: 450 pts</p>
                  <p className="text-xs text-gray-400">Worth $4.50 — earned from past purchases</p>
                </div>
              </div>
              <button onClick={() => setGiftApplied(!giftApplied)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap border
                  ${giftApplied
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'}`}>
                {giftApplied ? '✅ Applied' : 'Use Points'}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="font-extrabold text-gray-900 mb-5 text-base flex items-center gap-2">
              Order Summary
              <span className="ml-auto text-xs font-medium text-gray-400">{items.length} items</span>
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Coupon (20% off)</span>
                  <span className="font-semibold">−${discount.toFixed(2)}</span>
                </div>
              )}
              {giftDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> Gift Points</span>
                  <span className="font-semibold">−${giftDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? <span className="text-green-600 font-bold">Free!</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (8%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-1">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-900 text-base">Total</span>
                  <span className="font-extrabold text-blue-600 text-2xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout"
              className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-sm">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure SSL Encrypted Checkout</span>
            </div>

            {/* Accepted payments note */}
            <div className="mt-3 flex items-center justify-center gap-2 text-gray-300">
              {['💳', '🏦', '🎁'].map(icon => (
                <span key={icon} className="text-base">{icon}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
