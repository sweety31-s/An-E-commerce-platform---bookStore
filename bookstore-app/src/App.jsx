import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider }  from './context/CartContext';
import { AuthProvider }  from './context/AuthContext';
import Navbar            from './components/Navbar';
import Footer            from './components/Footer';
import HomePage          from './pages/HomePage';
import LoginPage         from './pages/LoginPage';
import BrowsePage        from './pages/BrowsePage';
import BookDetailPage    from './pages/BookDetailPage';
import CartPage          from './pages/CartPage';
import CheckoutPage      from './pages/CheckoutPage';
import PaymentPage       from './pages/PaymentPage';
import OrdersPage        from './pages/OrdersPage';
import TrackingPage      from './pages/TrackingPage';
import ProfilePage       from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"             element={<HomePage />} />
                <Route path="/login"        element={<LoginPage />} />
                <Route path="/browse"       element={<BrowsePage />} />
                <Route path="/books/:id"    element={<BookDetailPage />} />
                <Route path="/cart"         element={<CartPage />} />
                <Route path="/checkout"     element={<CheckoutPage />} />
                <Route path="/payment"      element={<PaymentPage />} />
                <Route path="/orders"       element={<OrdersPage />} />
                <Route path="/track/:orderId" element={<TrackingPage />} />
                <Route path="/profile"      element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
