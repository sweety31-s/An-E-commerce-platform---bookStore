import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, MapPin, Loader2, RotateCcw } from 'lucide-react';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

// Derive tracking steps from order status + created_at
function buildTrackingSteps(order) {
  if (!order) return [];
  const created = new Date(order.created_at);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' — ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const statusRank = { Processing: 1, Shipped: 2, 'In Transit': 3, Delivered: 4 };
  const rank = statusRank[order.status] ?? 1;

  return [
    { label: 'Order Confirmed',     time: fmt(created),                                      location: '',              done: rank >= 1 },
    { label: 'Picked Up by Carrier',time: fmt(new Date(created.getTime() + 1 * 86400000)),   location: 'Warehouse',     done: rank >= 2 },
    { label: 'In Transit',          time: fmt(new Date(created.getTime() + 2 * 86400000)),   location: 'En Route',      done: rank >= 3 },
    { label: 'Out for Delivery',    time: fmt(new Date(created.getTime() + 7 * 86400000)),   location: 'Local Hub',     done: rank >= 4 },
  ].reverse();
}

function deliveryDate(order) {
  if (!order) return 'N/A';
  const days = order.shipping_method === 'overnight' ? 1 : order.shipping_method === 'express' ? 3 : 7;
  const d = new Date(order.created_at);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TrackingPage() {
  const { orderId } = useParams();
  const { user } = useAuth();

  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [returning, setReturning] = useState(false);
  const [returnMsg, setReturnMsg] = useState('');

  const handleReturn = async () => {
    if (!window.confirm('Initiate a return for this order? A prepaid return label will be emailed to you.')) return;
    setReturning(true);
    setReturnMsg('');
    try {
      await api.post(`/api/orders/${orderId}/return`);
      setOrder(prev => ({ ...prev, status: 'Returned' }));
      setReturnMsg('Return initiated successfully. Check your email for the prepaid label.');
    } catch (err) {
      setReturnMsg(err.message || 'Could not initiate return. Please try again.');
    } finally {
      setReturning(false);
    }
  };

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get(`/api/orders/${orderId}`)
      .then(data => setOrder(data))
      .catch(err => setError(err.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [orderId, user]);

  const trackingSteps = buildTrackingSteps(order);
  const addr = order?.shipping_address || {};
  const addrStr = addr.firstName
    ? `${addr.firstName} ${addr.lastName}, ${addr.address1}, ${addr.city} ${addr.zip}`
    : 'N/A';
  const methodLabel = order?.shipping_method === 'overnight' ? 'Overnight'
    : order?.shipping_method === 'express' ? 'Express (2–3 days)'
    : 'Standard (5–7 days)';

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/orders" className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> My Orders
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-mono font-semibold text-xs">{orderId}</span>
      </nav>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-7 tracking-tight flex items-center gap-2.5">
        <Truck className="w-6 h-6 text-blue-600" /> Shipment Tracking
      </h1>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-sm">{error}</p>
          <Link to="/orders" className="btn-outline mt-4 inline-block">Back to Orders</Link>
        </div>
      ) : (
        <>
          {/* Info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Order #',       value: order?.order_number || orderId, icon: '📋' },
              { label: 'Status',        value: order?.status || 'Processing',   icon: '📦' },
              { label: 'Ordered',       value: order ? new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A', icon: '📅' },
              { label: 'Est. Delivery', value: deliveryDate(order),             icon: '🎯' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{icon}</span>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                </div>
                <p className="font-bold text-gray-800 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Timeline */}
            <div className="flex-1">
              <div className="card p-6">
                <h2 className="font-extrabold text-gray-900 mb-7 flex items-center gap-2.5 text-base">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  Tracking Timeline
                </h2>
                <div className="space-y-0">
                  {trackingSteps.map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < trackingSteps.length - 1 && (
                        <div className={`absolute left-[14px] top-8 bottom-0 w-0.5 rounded-full
                          ${step.done ? 'bg-blue-300' : 'bg-gray-200'}`} />
                      )}
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center z-10 mt-0.5 shadow-sm
                        ${step.done
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                        {step.done
                          ? <span className="text-[11px] font-bold">✓</span>
                          : <span className="w-2 h-2 bg-gray-300 rounded-full" />
                        }
                      </div>
                      <div className="pb-7 flex-1">
                        <p className={`font-bold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>
                        {step.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3" /> {step.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
              {/* Shipment details */}
              <div className="card p-5">
                <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-600" /> Shipment Details
                </h2>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Ship to', value: addrStr,                            isText: true  },
                    { label: 'Method',  value: methodLabel,                        isText: true  },
                    { label: 'Rate',    value: `$${Number(order?.shipping || 3.99).toFixed(2)}`, isText: true },
                    { label: 'Status',  value: null,                               isText: false },
                  ].map(({ label, value, isText }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      {isText
                        ? <p className="font-semibold text-gray-800 text-xs">{value}</p>
                        : <Badge status={order?.status || 'Processing'} />
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              {order?.items?.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-extrabold text-gray-900 mb-4 text-sm">Items in Shipment</h2>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <img src={item.cover} alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                          onError={e => { e.target.src = 'https://placehold.co/40x56/e5e7eb/9ca3af?text=B'; }} />
                        <div>
                          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">×{item.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Return button */}
              {order?.status === 'Delivered' && (
                <button onClick={handleReturn} disabled={returning}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-sm transition-all disabled:opacity-50">
                  {returning
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><RotateCcw className="w-4 h-4" /> Initiate Return</>
                  }
                </button>
              )}
              {order?.status === 'Returned' && (
                <div className="w-full text-center py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                  ✓ Return Initiated
                </div>
              )}
              {returnMsg && (
                <p className={`text-xs text-center ${returnMsg.startsWith('Return initiated') ? 'text-green-600' : 'text-red-500'}`}>
                  {returnMsg}
                </p>
              )}
              <p className="text-xs text-gray-400 text-center">Return window: 30 days from delivery</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
