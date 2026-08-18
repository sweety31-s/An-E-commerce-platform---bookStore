import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import StepProgress from '../components/StepProgress';
import {
  CreditCard, Building2, Wallet, ShieldCheck,
  Check, ArrowRight, Loader2, AlertCircle, Gift,
  CheckCircle2, Package, MapPin, Star,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirm'];

const METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', Icon: CreditCard, desc: 'Visa, Mastercard, Amex'  },
  { id: 'bank',   label: 'Net Banking',          Icon: Building2,  desc: 'All major banks'         },
  { id: 'wallet', label: 'Wallet',               Icon: Wallet,     desc: 'Balance: $8.50'          },
];

// Format card number with spaces every 4 digits
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
// Format MM/YY
function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length > 2) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
}

// Detect card brand from number
function cardBrand(num) {
  const n = num.replace(/\D/g, '');
  if (/^4/.test(n))          return { name: 'Visa',       color: 'text-blue-600'   };
  if (/^5[1-5]/.test(n))     return { name: 'Mastercard', color: 'text-orange-500' };
  if (/^3[47]/.test(n))      return { name: 'Amex',       color: 'text-blue-500'   };
  if (/^6/.test(n))          return { name: 'Discover',   color: 'text-amber-500'  };
  return null;
}

// ── Receipt component shown on step 3 (confirmed) ────────────────────────────
function OrderReceipt({ confirmation, onDone }) {
  const { txn_ref, amount_paid, card_brand, card_last4, payment_method, order } = confirmation;
  const addr = order?.shipping_address
    ? (typeof order.shipping_address === 'string'
        ? JSON.parse(order.shipping_address)
        : order.shipping_address)
    : {};

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payment Confirmed!</h2>
        <p className="text-gray-500 text-sm mt-1">Your order has been placed and payment received.</p>
      </div>

      {/* Receipt card */}
      <div className="card overflow-hidden mb-5">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium">Order Number</p>
              <p className="text-white font-bold font-mono text-sm">{order?.order_number || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs font-medium">Amount Paid</p>
              <p className="text-white font-extrabold text-xl">${Number(amount_paid).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Transaction ref */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Transaction Reference</p>
              <p className="font-mono text-sm font-bold text-gray-800">{txn_ref}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Payment Method</p>
            <div className="flex items-center gap-2">
              {payment_method === 'card' && (
                <>
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-800">
                    {card_brand || 'Card'} ending in {card_last4}
                  </span>
                  <span className="text-xs text-gray-400">— Charged ${Number(amount_paid).toFixed(2)}</span>
                </>
              )}
              {payment_method === 'bank' && (
                <>
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-800">Net Banking — Confirmed</span>
                </>
              )}
              {payment_method === 'wallet' && (
                <>
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-800">Wallet — Deducted ${Number(amount_paid).toFixed(2)}</span>
                </>
              )}
            </div>
          </div>

          {/* Delivery address */}
          {addr.firstName && (
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Delivering To
              </p>
              <p className="text-sm font-semibold text-gray-800">{addr.firstName} {addr.lastName}</p>
              <p className="text-xs text-gray-500">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}</p>
              <p className="text-xs text-gray-500">{addr.city}, {addr.zip} · {addr.country}</p>
            </div>
          )}

          {/* Order breakdown */}
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2 flex items-center gap-1">
              <Package className="w-3 h-3" /> Order Breakdown
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>${Number(order?.subtotal || 0).toFixed(2)}</span>
              </div>
              {Number(order?.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon discount</span><span>−${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(order?.gift_discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Gift points redeemed</span><span>−${Number(order.gift_discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span><span>${Number(order?.shipping || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span><span>${Number(order?.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                <span>Total</span><span>${Number(amount_paid).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Points earned */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              You earned <strong>{Math.round(Number(amount_paid))}</strong> gift points on this order!
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onDone}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-sm">
          <Package className="w-4 h-4" /> View My Orders
        </button>
        <Link to="/browse"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 rounded-xl text-sm transition-all">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ── Main PaymentPage ──────────────────────────────────────────────────────────
export default function PaymentPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { items, subtotal, discount, giftDiscount, clearCart } = useCart();
  const { user }      = useAuth();

  const orderTotal      = location.state?.orderTotal     ?? 0;
  const shippingAddress = location.state?.shippingAddress ?? {};
  const shippingOption  = location.state?.shippingOption  ?? { id: 'standard', price: 3.99, label: 'Standard Shipping' };
  const shippingMethod  = location.state?.shippingMethod  ?? 'standard';

  const [method,       setMethod]       = useState('card');
  const [card,         setCard]         = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [giftApplied,  setGiftApplied]  = useState(false);
  const [placing,      setPlacing]      = useState(false);
  const [fieldErrors,  setFieldErrors]  = useState({});   // { field: message }
  const [orderError,   setOrderError]   = useState('');

  // Step 3 = receipt shown
  const [confirmed,    setConfirmed]    = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const GIFT_BALANCE = user ? Math.floor((user.points || 0) / 100) : 0;
  const due = giftApplied && GIFT_BALANCE > 0 ? Math.max(0, orderTotal - GIFT_BALANCE) : orderTotal;

  const brand = cardBrand(card.number);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    if (name === 'number') setCard(c => ({ ...c, number: formatCardNumber(value) }));
    else if (name === 'expiry') setCard(c => ({ ...c, expiry: formatExpiry(value) }));
    else setCard(c => ({ ...c, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setOrderError('');
    setFieldErrors({});

    try {
      // Step 1: Create the order record
      const orderPayload = {
        items: items.map(i => ({
          book_id: i.id,
          title:   i.title,
          author:  i.author,
          cover:   i.cover,
          price:   i.price,
          qty:     i.qty,
          format:  i.format || 'Paperback',
        })),
        shipping_address: shippingAddress,
        shipping_method:  shippingMethod,
        payment_method:   method,
        subtotal,
        discount,
        gift_discount: giftApplied ? GIFT_BALANCE : 0,
        shipping:  shippingOption?.price ?? 3.99,
        tax:       orderTotal - subtotal + discount + (giftApplied ? GIFT_BALANCE : 0) - (shippingOption?.price ?? 3.99),
        total:     due,
        gift_applied: giftApplied,
      };

      let orderId, orderNumber;

      if (user) {
        const createdOrder = await api.post('/api/orders', orderPayload);
        orderId     = createdOrder.id;
        orderNumber = createdOrder.order_number;
      }

      // Step 2: Process payment
      if (user && orderId) {
        const paymentPayload = {
          order_id:     orderId,
          payment_method: method,
          card:         method === 'card' ? card : undefined,
          amount:       due,
          gift_applied: giftApplied,
          gift_amount:  giftApplied ? GIFT_BALANCE : 0,
        };

        const payResult = await api.post('/api/payments/process', paymentPayload);

        clearCart();
        setConfirmation({ ...payResult, order: { ...payResult.order, order_number: orderNumber } });
        setConfirmed(true);
        return;
      }

      // Guest flow: just clear cart and navigate
      clearCart();
      navigate('/orders', { state: { newOrder: true, orderNumber } });

    } catch (err) {
      // Field-level errors from payment validation
      if (err.status === 422 && err.data?.field) {
        setFieldErrors({ [err.data.field]: err.data.error });
      } else {
        setOrderError(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setPlacing(false);
    }
  };

  const handleReceiptDone = () => {
    navigate('/orders', { state: { newOrder: true, orderNumber: confirmation?.order?.order_number } });
  };

  // ── Confirmed receipt view ───────────────────────────────────────────────────
  if (confirmed && confirmation) {
    return (
      <div className="page-wrapper animate-fade-in">
        <StepProgress steps={STEPS} current={3} />
        <OrderReceipt confirmation={confirmation} onDone={handleReceiptDone} />
      </div>
    );
  }

  // ── Payment form ─────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper animate-fade-in">
      <StepProgress steps={STEPS} current={2} />

      <form onSubmit={handlePlaceOrder}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: payment form */}
          <div className="flex-1 space-y-5">

            {/* Method tabs */}
            <div className="card p-6">
              <h2 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2.5 text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {METHODS.map(({ id, label, Icon, desc }) => (
                  <button key={id} type="button" onClick={() => setMethod(id)}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all duration-150 text-center
                      ${method === id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50'}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{label}</span>
                    <span className="text-[11px] font-normal text-gray-400">{desc}</span>
                  </button>
                ))}
              </div>

              {/* Card form */}
              {method === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Card Number</label>
                    <div className="relative">
                      <input name="number"
                        className={`input-field font-mono tracking-widest pr-20 ${fieldErrors.number ? 'border-red-400 focus:ring-red-300' : ''}`}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19} value={card.number} onChange={handleCardChange} required />
                      {brand && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${brand.color}`}>
                          {brand.name}
                        </span>
                      )}
                    </div>
                    {fieldErrors.number && <FieldError msg={fieldErrors.number} />}
                    <p className="text-[11px] text-gray-400 mt-1">Test: 4242 4242 4242 4242 (success) · 4000 0000 0000 0002 (decline)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
                      <input name="expiry"
                        className={`input-field ${fieldErrors.expiry ? 'border-red-400 focus:ring-red-300' : ''}`}
                        placeholder="MM/YY"
                        maxLength={5} value={card.expiry} onChange={handleCardChange} required />
                      {fieldErrors.expiry && <FieldError msg={fieldErrors.expiry} />}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CVV</label>
                      <input name="cvv"
                        className={`input-field ${fieldErrors.cvv ? 'border-red-400 focus:ring-red-300' : ''}`}
                        placeholder="•••"
                        maxLength={4} value={card.cvv} onChange={handleCardChange} required />
                      {fieldErrors.cvv && <FieldError msg={fieldErrors.cvv} />}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Name on Card</label>
                    <input name="name"
                      className={`input-field ${fieldErrors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                      placeholder="John Doe"
                      value={card.name} onChange={handleCardChange} required />
                    {fieldErrors.name && <FieldError msg={fieldErrors.name} />}
                  </div>
                </div>
              )}

              {method === 'bank' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                  <Building2 className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                  <p className="font-bold text-blue-800 text-sm">Secure Bank Redirect</p>
                  <p className="text-blue-600 text-xs mt-1 max-w-xs mx-auto">
                    You will be securely redirected to your bank's portal to authorize payment.
                    Funds are only deducted after authorization.
                  </p>
                </div>
              )}

              {method === 'wallet' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-purple-800 text-sm">BookStore Wallet</p>
                        <p className="text-purple-600 text-xs mt-0.5">Instant deduction at checkout</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-purple-700">$8.50</p>
                        <p className="text-xs text-purple-500">Available</p>
                      </div>
                    </div>
                  </div>
                  {due > 8.50 && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        Wallet balance ($8.50) is less than order total (${due.toFixed(2)}). Please use a different payment method.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Gift points */}
            {user && user.points > 0 && (
              <div className="card p-6">
                <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-base">
                  <Gift className="w-5 h-5 text-amber-500" /> Gift Points & Rewards
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {user.points} pts = ${GIFT_BALANCE.toFixed(2)} credit
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">100 points = $1.00 off your order</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setGiftApplied(g => !g)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap
                        ${giftApplied
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-amber-200 text-amber-800 hover:bg-amber-300 border border-amber-300'}`}>
                      {giftApplied
                        ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> −${GIFT_BALANCE.toFixed(2)} Applied</span>
                        : `Redeem $${GIFT_BALANCE.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SSL notice */}
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700 font-medium">
                256-bit SSL · PCI DSS Level 1 · Your card details are never stored on our servers
              </p>
            </div>

            {/* General order error */}
            {orderError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3.5 rounded-2xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="font-extrabold text-gray-900 mb-5 text-base">Payment Summary</h2>

              {/* Items list */}
              <div className="space-y-3 mb-5 max-h-44 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.cover} alt={item.title}
                      className="w-10 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                      onError={e => { e.target.src = 'https://placehold.co/40x56/e5e7eb/9ca3af?text=B'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">×{item.qty}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Order Total</span>
                  <span className="font-semibold text-gray-900">${Number(orderTotal).toFixed(2)}</span>
                </div>
                {giftApplied && GIFT_BALANCE > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-green-500 text-green-500" /> Gift Redeemed
                    </span>
                    <span className="font-semibold">−${GIFT_BALANCE.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Amount Due</span>
                  <span className="text-blue-600 text-lg">${due.toFixed(2)}</span>
                </div>
              </div>

              {/* Place order button */}
              <button type="submit" disabled={placing || (method === 'wallet' && due > 8.50)}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {placing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment…</>
                  : <><Check className="w-4 h-4" /> Pay ${due.toFixed(2)} Securely</>
                }
              </button>
              <p className="text-center text-xs text-gray-400 mt-3 leading-relaxed">
                By placing your order you agree to our{' '}
                <span className="text-blue-500 cursor-pointer hover:underline">Terms of Service</span>
                {' '}and{' '}
                <span className="text-blue-500 cursor-pointer hover:underline">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function FieldError({ msg }) {
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" /> {msg}
    </p>
  );
}
