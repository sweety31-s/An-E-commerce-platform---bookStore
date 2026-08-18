import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BOOKS } from '../data/books';
import Badge from '../components/Badge';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Package, RotateCcw, Eye, RefreshCw, CheckCircle2, ShoppingCart, Loader2, X, AlertTriangle } from 'lucide-react';

export default function OrdersPage() {
  const location  = useLocation();
  const isNewOrder = location.state?.newOrder;
  const newOrderNumber = location.state?.orderNumber;

  const { user } = useAuth();
  const { addToCart } = useCart();

  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get('/api/orders')
      .then(data => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  const [returning, setReturning] = useState(null);

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    try {
      await api.post(`/api/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const handleReturn = async (orderId) => {
    if (!window.confirm('Initiate a return for this order? You will receive a prepaid return label by email.')) return;
    setReturning(orderId);
    try {
      await api.post(`/api/orders/${orderId}/return`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Returned' } : o));
    } catch (err) {
      alert(err.message || 'Could not initiate return');
    } finally {
      setReturning(null);
    }
  };

  const handleBuyAgain = (order) => {
    if (!order.items) return;
    order.items.forEach(item => {
      // Try to find book from local data for full info
      const book = BOOKS.find(b => b.id === item.book_id) || {
        id:     item.book_id,
        title:  item.title,
        author: item.author,
        cover:  item.cover,
        price:  item.price,
      };
      addToCart(book, item.qty, item.format);
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Success banner */}
      {isNewOrder && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-7 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-extrabold text-green-800 text-base">Order Placed Successfully!</p>
            <p className="text-green-700 text-sm mt-0.5">
              {newOrderNumber
                ? <>Order <strong className="font-bold">#{newOrderNumber}</strong> confirmed. A confirmation email has been sent to your inbox.</>
                : 'Your order has been confirmed. A confirmation email has been sent to your inbox.'
              }
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-600" /> My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} orders total</p>
        </div>
      </div>

      {!user ? (
        <div className="text-center py-16 card p-8">
          <p className="text-gray-500 mb-4">Sign in to view your orders.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-3">Sign In</Link>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-bold text-gray-700 text-lg mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-5">Your orders will appear here once you place one.</p>
          <Link to="/browse" className="btn-primary inline-flex items-center gap-2 px-6 py-3">Browse Books</Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['Order #', 'Date', 'Items', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, idx) => (
                  <tr key={order.id} className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4 font-bold text-gray-800 font-mono text-xs">{order.order_number}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-4 text-gray-600 text-sm">
                      {order.items?.reduce((s, i) => s + i.qty, 0) || 0} book{(order.items?.reduce((s, i) => s + i.qty, 0) || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-gray-900 text-sm">${Number(order.total).toFixed(2)}</td>
                    <td className="px-5 py-4"><Badge status={order.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/track/${order.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-all">
                          <Eye className="w-3 h-3" /> View
                        </Link>
                        {order.status === 'Processing' && (
                          <button onClick={() => handleCancel(order.id)} disabled={cancelling === order.id}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50">
                            <X className="w-3 h-3" /> {cancelling === order.id ? '…' : 'Cancel'}
                          </button>
                        )}
                        {(order.status === 'Delivered' || order.status === 'Cancelled') && order.items?.length > 0 && (
                          <button onClick={() => handleBuyAgain(order)}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-semibold bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1.5 rounded-lg transition-all">
                            <ShoppingCart className="w-3 h-3" /> Buy Again
                          </button>
                        )}
                        {order.status === 'Delivered' && (
                          <button onClick={() => handleReturn(order.id)} disabled={returning === order.id}
                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-xs font-semibold bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50">
                            <RotateCcw className="w-3 h-3" /> {returning === order.id ? '…' : 'Return'}
                          </button>
                        )}
                        {order.status === 'Cancelled' && !order.items?.length && (
                          <button className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs font-semibold transition-colors">
                            <RefreshCw className="w-3 h-3" /> Reorder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800 text-sm font-mono">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge status={order.status} />
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-500">{order.items?.reduce((s, i) => s + i.qty, 0) || 0} item(s)</span>
                  <span className="font-extrabold text-gray-900">${Number(order.total).toFixed(2)}</span>
                </div>
                <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-3">
                  <Link to={`/track/${order.id}`}
                    className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                    <Eye className="w-3 h-3" /> View
                  </Link>
                  {order.status === 'Processing' && (
                    <button onClick={() => handleCancel(order.id)} disabled={cancelling === order.id}
                      className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 disabled:opacity-50">
                      <X className="w-3 h-3" /> {cancelling === order.id ? '…' : 'Cancel'}
                    </button>
                  )}
                  {(order.status === 'Delivered' || order.status === 'Cancelled') && order.items?.length > 0 && (
                    <button onClick={() => handleBuyAgain(order)}
                      className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg">
                      <ShoppingCart className="w-3 h-3" /> Buy Again
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <button onClick={() => handleReturn(order.id)} disabled={returning === order.id}
                      className="text-amber-600 text-xs font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 disabled:opacity-50">
                      <RotateCcw className="w-3 h-3" /> {returning === order.id ? '…' : 'Return'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
