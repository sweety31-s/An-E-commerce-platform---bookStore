import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepProgress from '../components/StepProgress';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { MapPin, Truck, ArrowRight, Check, Loader2, Plus } from 'lucide-react';

const SHIPPING_OPTIONS = [
  { id: 'standard',  label: 'Standard Shipping', sublabel: '5–7 business days', price: 3.99,  icon: '📦' },
  { id: 'express',   label: 'Express Shipping',  sublabel: '2–3 business days', price: 9.99,  icon: '⚡' },
  { id: 'overnight', label: 'Overnight',         sublabel: 'Next business day', price: 19.99, icon: '🚀' },
];

const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirm'];

const BLANK_FORM = {
  firstName: '', lastName: '', address1: '', address2: '',
  city: '', zip: '', country: 'United States', phone: '',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, giftDiscount, tax } = useCart();
  const { user } = useAuth();
  const [shippingMethod, setShippingMethod] = useState('standard');

  const [savedAddresses,   setSavedAddresses]   = useState([]);
  const [selectedAddrId,   setSelectedAddrId]   = useState(null);
  const [showNewForm,      setShowNewForm]      = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [form, setForm] = useState(BLANK_FORM);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    api.get('/api/addresses')
      .then(addrs => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const def = addrs.find(a => a.is_default) || addrs[0];
          setSelectedAddrId(def.id);
          setShowNewForm(false);
        } else {
          setShowNewForm(true);
        }
      })
      .catch(() => setShowNewForm(true))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const chosen = SHIPPING_OPTIONS.find(o => o.id === shippingMethod);
  const orderTotal = subtotal - discount - giftDiscount + (chosen?.price || 0) + tax;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const getShippingAddress = () => {
    if (selectedAddrId && !showNewForm) {
      const addr = savedAddresses.find(a => a.id === selectedAddrId);
      if (addr) return {
        firstName: addr.first_name, lastName: addr.last_name,
        address1: addr.address1,    address2: addr.address2,
        city: addr.city, zip: addr.zip, country: addr.country, phone: addr.phone,
      };
    }
    return form;
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const shippingAddress = getShippingAddress();
    // Save new address for logged-in users
    if (user && showNewForm && form.firstName && form.address1) {
      try {
        await api.post('/api/addresses', {
          first_name: form.firstName, last_name: form.lastName,
          address1: form.address1, address2: form.address2,
          city: form.city, zip: form.zip, country: form.country, phone: form.phone,
          is_default: savedAddresses.length === 0,
        });
      } catch { /* ignore */ }
    }
    navigate('/payment', {
      state: { shippingOption: chosen, orderTotal, shippingAddress, shippingMethod },
    });
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <StepProgress steps={STEPS} current={1} />

      <form onSubmit={handleNext}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column */}
          <div className="flex-1 space-y-5">

            {/* Address */}
            <div className="card p-6">
              <h2 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2.5 text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                Shipping Address
              </h2>

              {/* Saved addresses */}
              {user && loadingAddresses && (
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading saved addresses…
                </div>
              )}

              {user && !loadingAddresses && savedAddresses.length > 0 && (
                <div className="space-y-2 mb-4">
                  {savedAddresses.map(addr => (
                    <label key={addr.id}
                      className={`flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all
                        ${selectedAddrId === addr.id && !showNewForm
                          ? 'border-blue-500 bg-blue-50/60'
                          : 'border-gray-200 hover:border-blue-300'}`}>
                      <input type="radio" name="savedAddr" checked={selectedAddrId === addr.id && !showNewForm}
                        onChange={() => { setSelectedAddrId(addr.id); setShowNewForm(false); }}
                        className="accent-blue-600 mt-0.5 w-4 h-4 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-gray-800">{addr.first_name} {addr.last_name}
                          {addr.is_default ? <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Default</span> : null}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}, {addr.city}, {addr.zip}</p>
                        <p className="text-gray-400 text-xs">{addr.country} · {addr.phone}</p>
                      </div>
                    </label>
                  ))}

                  <button type="button"
                    onClick={() => { setShowNewForm(!showNewForm); setSelectedAddrId(null); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1">
                    <Plus className="w-3.5 h-3.5" />
                    {showNewForm ? 'Use a saved address' : 'Add a new address'}
                  </button>
                </div>
              )}

              {/* New address form */}
              {(showNewForm || !user) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: 'firstName', label: 'First Name',   placeholder: 'John' },
                    { name: 'lastName',  label: 'Last Name',    placeholder: 'Doe'  },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                      <input name={f.name} className="input-field" placeholder={f.placeholder}
                        value={form[f.name]} onChange={handleChange} required />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address Line 1</label>
                    <input name="address1" className="input-field" placeholder="123 Main Street"
                      value={form.address1} onChange={handleChange} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address Line 2 <span className="normal-case text-gray-400 font-normal">(optional)</span></label>
                    <input name="address2" className="input-field" placeholder="Apt, Suite, etc."
                      value={form.address2} onChange={handleChange} />
                  </div>
                  {[
                    { name: 'city', label: 'City',              placeholder: 'New York' },
                    { name: 'zip',  label: 'ZIP / Postal Code', placeholder: '10001'    },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                      <input name={f.name} className="input-field" placeholder={f.placeholder}
                        value={form[f.name]} onChange={handleChange} required />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Country</label>
                    <select name="country" className="input-field" value={form.country} onChange={handleChange}>
                      {['United States', 'United Kingdom', 'Canada', 'Australia', 'India'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <input name="phone" className="input-field" placeholder="+1 212-555-0100"
                      value={form.phone} onChange={handleChange} required />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping method */}
            <div className="card p-6">
              <h2 className="font-extrabold text-gray-900 mb-5 flex items-center gap-2.5 text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-blue-600" />
                </div>
                Shipping Method
              </h2>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map(opt => (
                  <label key={opt.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all duration-150
                      ${shippingMethod === opt.id
                        ? 'border-blue-500 bg-blue-50/60'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={opt.id}
                        checked={shippingMethod === opt.id} onChange={() => setShippingMethod(opt.id)}
                        className="accent-blue-600 w-4 h-4" />
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{opt.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.sublabel}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-blue-600 text-sm">${opt.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h2 className="font-extrabold text-gray-900 mb-5 text-base">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
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
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span className="font-semibold">−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span><span className="font-semibold text-gray-900">${chosen?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span><span className="text-blue-600 text-lg">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <button type="submit"
                className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] shadow-sm">
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
