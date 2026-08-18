import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Globe, Mail, Rss, X, Phone, MessageSquare, Clock, MapPin,
         RotateCcw, Package, ShieldCheck, Truck, HelpCircle, ChevronDown,
         Gift, Heart, CreditCard, Lock, FileText, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Modal Content Definitions ────────────────────────────────────────────────

const MODALS = {
  contact: {
    icon: Phone,
    title: 'Contact Us',
    color: 'blue',
    content: ContactContent,
  },
  returns: {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    color: 'amber',
    content: ReturnsContent,
  },
  shipping: {
    icon: Truck,
    title: 'Shipping Policy',
    color: 'green',
    content: ShippingContent,
  },
  faq: {
    icon: HelpCircle,
    title: 'Frequently Asked Questions',
    color: 'purple',
    content: FAQContent,
  },
  wishlist: {
    icon: Heart,
    title: 'Wishlist',
    color: 'red',
    content: WishlistContent,
  },
  giftcards: {
    icon: Gift,
    title: 'Gift Cards',
    color: 'yellow',
    content: GiftCardsContent,
  },
  privacy: {
    icon: Lock,
    title: 'Privacy Policy',
    color: 'gray',
    content: PrivacyContent,
  },
  terms: {
    icon: FileText,
    title: 'Terms of Service',
    color: 'gray',
    content: TermsContent,
  },
  cookies: {
    icon: Cookie,
    title: 'Cookie Policy',
    color: 'gray',
    content: CookiesContent,
  },
};

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   border: 'border-blue-200'   },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  border: 'border-amber-200'  },
  green:  { bg: 'bg-green-100',  text: 'text-green-600',  border: 'border-green-200'  },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  red:    { bg: 'bg-red-100',    text: 'text-red-500',    border: 'border-red-200'    },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'   },
};

const SOCIAL = [
  { Icon: Globe, href: '#', label: 'Website' },
  { Icon: Mail,  href: '#', label: 'Email'   },
  { Icon: Rss,   href: '#', label: 'Blog'    },
];

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ modalKey, onClose }) {
  const def = MODALS[modalKey];
  if (!def) return null;
  const { icon: Icon, title, color, content: ContentComponent } = def;
  const c = COLOR_MAP[color] || COLOR_MAP.gray;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog" aria-modal="true" aria-label={title}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-card-lg max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3.5 px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${c.bg} ${c.text} ${c.border}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight flex-1">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Close">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <ContentComponent />
        </div>
      </div>
    </div>
  );
}

// ─── Content Components ───────────────────────────────────────────────────────

function ContactContent() {
  const channels = [
    { icon: MessageSquare, label: 'Live Chat',    value: 'Chat with us',          note: 'Avg. response: 2 min',    color: 'blue'   },
    { icon: Mail,          label: 'Email',         value: 'support@bookstore.com', note: 'Response within 24 hrs',  color: 'purple' },
    { icon: Phone,         label: 'Phone',         value: '+1 (800) 555-0192',     note: 'Mon–Fri, 9 AM – 6 PM ET', color: 'green'  },
  ];
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm leading-relaxed">
        Our support team is here to help you with orders, returns, account issues, and anything else. Choose the channel that works best for you.
      </p>

      <div className="space-y-3">
        {channels.map(({ icon: Icon, label, value, note, color }) => {
          const c = COLOR_MAP[color];
          return (
            <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${c.border} bg-white hover:shadow-card-md transition-all duration-150 cursor-pointer`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text} border ${c.border}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{label}</p>
                <p className="text-gray-700 text-sm font-medium truncate">{value}</p>
              </div>
              <span className="text-xs text-gray-400 text-right shrink-0">{note}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Business Hours</p>
          <p className="text-xs text-blue-600 mt-0.5">Monday – Friday: 9:00 AM – 6:00 PM ET</p>
          <p className="text-xs text-blue-600">Saturday: 10:00 AM – 4:00 PM ET</p>
          <p className="text-xs text-blue-600">Sunday: Closed</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-800">Corporate Address</p>
          <p className="text-xs text-gray-500 mt-0.5">BookStore, Inc.</p>
          <p className="text-xs text-gray-500">350 Fifth Avenue, Suite 4100</p>
          <p className="text-xs text-gray-500">New York, NY 10118, United States</p>
        </div>
      </div>
    </div>
  );
}

function ReturnsContent() {
  const steps = [
    { num: '1', title: 'Initiate your return',       desc: 'Go to My Orders, click "Return" on a delivered order within 30 days.' },
    { num: '2', title: 'Print prepaid label',         desc: 'We email you a free prepaid shipping label — no cost to you.' },
    { num: '3', title: 'Pack & drop off',             desc: 'Pack the item(s) securely and drop them at any FedEx or UPS location.' },
    { num: '4', title: 'Refund processed',            desc: 'Once received, refunds are processed within 3–5 business days.' },
  ];
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm leading-relaxed">
        We want you to love every book you buy. If something isn't right, our hassle-free returns process makes it easy to get a full refund.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Return Window',  value: '30 Days',     icon: '📅' },
          { label: 'Refund Method',  value: 'Original Payment', icon: '💳' },
          { label: 'Shipping Cost',  value: 'Free',        icon: '🚚' },
          { label: 'Processing Time',value: '3–5 Bus. Days', icon: '⏱' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-xs font-extrabold text-gray-800 mt-1">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800 mb-3">How it works</p>
        <div className="space-y-3">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</div>
              <div>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-bold text-amber-800 mb-1">Non-returnable items</p>
        <ul className="text-xs text-amber-700 space-y-0.5 list-disc list-inside">
          <li>eBooks and digital downloads (once accessed)</li>
          <li>Items marked "Final Sale" at time of purchase</li>
          <li>Personalised or gift-wrapped items once opened</li>
        </ul>
      </div>
    </div>
  );
}

function ShippingContent() {
  const methods = [
    { method: 'Standard',  time: '5–7 Business Days',  price: '$3.99',  icon: '📦', threshold: 'Free over $30' },
    { method: 'Express',   time: '2–3 Business Days',  price: '$9.99',  icon: '⚡', threshold: null             },
    { method: 'Overnight', time: 'Next Business Day',  price: '$19.99', icon: '🚀', threshold: null             },
    { method: 'Free',      time: '5–7 Business Days',  price: 'Free',   icon: '🎁', threshold: 'Orders over $30' },
  ];
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm leading-relaxed">
        We ship to all 50 US states, Canada, UK, Australia, and India. All orders are processed within 1 business day and include a tracking number.
      </p>

      <div className="space-y-2">
        {methods.map(({ method, time, price, icon, threshold }) => (
          <div key={method} className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl bg-white">
            <span className="text-xl">{icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{method} Shipping</p>
              <p className="text-xs text-gray-500">{time}{threshold ? ` · ${threshold}` : ''}</p>
            </div>
            <span className={`text-sm font-extrabold ${price === 'Free' ? 'text-green-600' : 'text-blue-600'}`}>{price}</span>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-1">
        <p className="text-sm font-bold text-green-800">📦 Order Tracking</p>
        <p className="text-xs text-green-700">You'll receive a tracking email within 24 hours of dispatch with a live tracking link via FedEx or UPS.</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-bold text-gray-800">International Shipping</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ['🇬🇧 United Kingdom', '7–14 days · $12.99'],
            ['🇨🇦 Canada',         '7–10 days · $8.99' ],
            ['🇦🇺 Australia',      '10–18 days · $14.99'],
            ['🇮🇳 India',          '10–15 days · $10.99'],
          ].map(([country, info]) => (
            <div key={country} className="bg-white border border-gray-200 rounded-lg px-2.5 py-2">
              <p className="font-semibold text-gray-700">{country}</p>
              <p className="text-gray-400">{info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQContent() {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      q: 'How do I track my order?',
      a: 'Go to My Orders → View to see live tracking. You will also receive a tracking email within 24 hours of dispatch with a direct FedEx/UPS link.',
    },
    {
      q: 'Can I change or cancel my order?',
      a: 'Yes — you can cancel any "Processing" order within 48 hours from My Orders page. After 48 hours the order cannot be cancelled as it may have already been dispatched.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards (Visa, Mastercard, Amex, Discover), net banking, and your BookStore Wallet balance. Gift points can also be redeemed at checkout.',
    },
    {
      q: 'How do gift points work?',
      a: 'You earn 1 point for every $1 spent. Every 100 points = $1.00 in credit. Points are automatically awarded when your order is confirmed and can be redeemed on the Payment page.',
    },
    {
      q: 'Do you offer free shipping?',
      a: 'Yes! Standard shipping is free on all orders over $30. Orders below $30 have a flat $3.99 standard shipping fee.',
    },
    {
      q: 'What formats are books available in?',
      a: 'Most titles are available in Paperback, Hardcover, eBook (PDF/ePub), and Audiobook (MP3). Format options are shown on each book\'s detail page.',
    },
    {
      q: 'How do I return a book?',
      a: 'Go to My Orders, click "Return" on any delivered order within 30 days. We\'ll email you a free prepaid return label. Refunds are processed in 3–5 business days after we receive the item.',
    },
    {
      q: 'Is my payment information secure?',
      a: 'Absolutely. We use 256-bit SSL encryption and are PCI DSS Level 1 certified. We never store your full card number on our servers.',
    },
  ];

  return (
    <div className="space-y-2">
      {faqs.map(({ q, a }, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-gray-50 transition-colors gap-3">
            <span className="text-sm font-semibold text-gray-800">{q}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && (
            <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed pt-3">{a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function WishlistContent() {
  const sampleBooks = [
    { title: 'Atomic Habits',        author: 'James Clear',    price: '$14.99', cover: 'https://covers.openlibrary.org/b/id/10527843-M.jpg' },
    { title: 'Dune',                 author: 'Frank Herbert',  price: '$10.39', cover: 'https://covers.openlibrary.org/b/id/8231856-M.jpg'  },
    { title: 'Sapiens',              author: 'Y.N. Harari',    price: '$16.99', cover: 'https://covers.openlibrary.org/b/id/8571214-M.jpg'  },
  ];
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm leading-relaxed">
        Save books you love and get notified when prices drop. Your wishlist is private and saved to your account.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
        <Heart className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800">Price Drop Alerts</p>
          <p className="text-xs text-red-600 mt-0.5">We'll notify you by email when any book on your wishlist goes on sale or drops in price.</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800 mb-3">Example Wishlist Preview</p>
        <div className="space-y-3">
          {sampleBooks.map(book => (
            <div key={book.title} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
              <img src={book.cover} alt={book.title}
                className="w-10 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/40x56/e5e7eb/9ca3af?text=B'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{book.title}</p>
                <p className="text-xs text-gray-400">{book.author}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-extrabold text-blue-600">{book.price}</p>
                <button className="text-xs text-red-400 hover:text-red-600 transition-colors mt-0.5">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-gray-400 mb-3">Sign in to manage your real wishlist</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-6">
          Sign In to View Wishlist
        </Link>
      </div>
    </div>
  );
}

function GiftCardsContent() {
  const amounts = ['$10', '$25', '$50', '$100', '$200'];
  const [selected, setSelected] = useState('$25');
  return (
    <div className="space-y-5">
      <p className="text-gray-500 text-sm leading-relaxed">
        Give the gift of reading. BookStore gift cards are delivered instantly by email and never expire.
      </p>

      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-white" />
            <span className="font-bold text-sm">BookStore Gift Card</span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">{selected}</p>
          <p className="text-white/70 text-xs mt-1">Valid for all books · Never expires</p>
          <p className="text-white/50 text-xs mt-3 font-mono">XXXX-XXXX-XXXX</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800 mb-2.5">Select Amount</p>
        <div className="flex flex-wrap gap-2">
          {amounts.map(amt => (
            <button key={amt} onClick={() => setSelected(amt)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                ${selected === amt ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {amt}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {[
          { icon: '📧', title: 'Instant Email Delivery',  desc: 'Delivered to recipient\'s inbox within minutes.' },
          { icon: '♾️', title: 'Never Expires',            desc: 'Gift card balance never expires, ever.'          },
          { icon: '🔀', title: 'Partial Redemption',      desc: 'Use part of the balance across multiple orders.'  },
          { icon: '📱', title: 'Easy to Redeem',          desc: 'Enter the code at checkout — no app needed.'     },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-[0.98]">
        Purchase {selected} Gift Card
      </button>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
        Last updated: <strong>January 15, 2025</strong>
      </div>
      <p>BookStore, Inc. ("we", "us") is committed to protecting your personal information. This policy explains what we collect, how we use it, and your rights.</p>

      {[
        {
          title: '1. Information We Collect',
          body: 'We collect information you provide directly (name, email, address, payment details), information generated by your activity (order history, browsing, wishlist), and technical information (IP address, device type, browser).',
        },
        {
          title: '2. How We Use Your Data',
          body: 'We use your information to process orders and payments, personalise your experience and recommendations, send order confirmations and shipping updates, improve our service, and comply with legal obligations.',
        },
        {
          title: '3. Payment Data',
          body: 'We never store full card numbers. All payment processing is handled via PCI DSS Level 1 certified systems. Only the last 4 digits and card brand are stored for reference.',
        },
        {
          title: '4. Data Sharing',
          body: 'We do not sell your personal data. We share information only with shipping carriers (FedEx, UPS) to fulfil your orders, payment processors, and as required by law.',
        },
        {
          title: '5. Your Rights',
          body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting support@bookstore.com. We will respond within 30 days.',
        },
        {
          title: '6. Data Retention',
          body: 'Order records are retained for 7 years for accounting purposes. Account data is deleted within 30 days of account closure upon request.',
        },
      ].map(({ title, body }) => (
        <div key={title}>
          <p className="font-bold text-gray-800 mb-1">{title}</p>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
        Last updated: <strong>January 15, 2025</strong> · Governing Law: New York, USA
      </div>
      <p>By using BookStore, you agree to these terms. Please read them carefully.</p>

      {[
        {
          title: '1. Account Responsibility',
          body: 'You are responsible for maintaining the security of your account and all activity under it. Use a strong password and do not share your credentials.',
        },
        {
          title: '2. Ordering & Pricing',
          body: 'All prices are in USD and subject to change without notice. We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.',
        },
        {
          title: '3. Intellectual Property',
          body: 'All content on BookStore (logos, design, text) is owned by BookStore, Inc. or its licensors. eBooks purchased are for personal use only and may not be redistributed.',
        },
        {
          title: '4. Prohibited Use',
          body: 'You may not use BookStore to scrape data, create fake accounts, resell gift cards fraudulently, or engage in any activity that harms other users or our platform.',
        },
        {
          title: '5. Cancellations & Refunds',
          body: 'You may cancel Processing orders within 48 hours. Returned physical items in original condition within 30 days qualify for a full refund. Digital items are non-refundable once accessed.',
        },
        {
          title: '6. Limitation of Liability',
          body: 'BookStore is not liable for indirect, incidental, or consequential damages arising from your use of the service. Our liability is limited to the value of your most recent order.',
        },
        {
          title: '7. Changes to Terms',
          body: 'We may update these terms with 14 days\' notice. Continued use of the service after changes constitutes acceptance.',
        },
      ].map(({ title, body }) => (
        <div key={title}>
          <p className="font-bold text-gray-800 mb-1">{title}</p>
          <p>{body}</p>
        </div>
      ))}
    </div>
  );
}

function CookiesContent() {
  const types = [
    { name: 'Essential Cookies',    desc: 'Required for the site to function — login sessions, cart, security tokens. Cannot be disabled.', badge: 'Always On', badgeColor: 'bg-green-100 text-green-700' },
    { name: 'Preference Cookies',   desc: 'Remember your settings such as currency, language, and display preferences across sessions.', badge: 'Optional', badgeColor: 'bg-blue-100 text-blue-700' },
    { name: 'Analytics Cookies',    desc: 'Help us understand how visitors use the site (pages visited, time on site). Data is anonymised.', badge: 'Optional', badgeColor: 'bg-blue-100 text-blue-700' },
    { name: 'Marketing Cookies',    desc: 'Used to show you relevant ads and personalised recommendations on third-party platforms.', badge: 'Optional', badgeColor: 'bg-blue-100 text-blue-700' },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        Last updated: <strong>January 15, 2025</strong>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">
        Cookies are small text files stored on your device. We use them to keep you logged in, remember your cart, and understand how you use BookStore.
      </p>

      <div className="space-y-3">
        {types.map(({ name, desc, badge, badgeColor }) => (
          <div key={name} className="p-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-sm font-bold text-gray-800">{name}</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>{badge}</span>
            </div>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p className="font-bold text-gray-700">How to manage cookies</p>
        <p>You can clear or block cookies in your browser settings at any time. Note that blocking essential cookies will prevent login and checkout from working.</p>
        <p className="mt-1">Most browsers: <span className="font-medium text-gray-600">Settings → Privacy & Security → Cookies</span></p>
      </div>
    </div>
  );
}

// ─── Main Footer Component ─────────────────────────────────────────────────────
export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);
  const openModal  = useCallback((key) => setActiveModal(key), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const helpLinks = [
    { label: 'Contact Us',      modal: 'contact'  },
    { label: 'Returns',         modal: 'returns'  },
    { label: 'Shipping Policy', modal: 'shipping' },
    { label: 'FAQ',             modal: 'faq'      },
  ];

  const accountLinks = [
    { label: 'My Orders',  to: '/orders'  },
    { label: 'My Profile', to: '/profile' },
    { label: 'Wishlist',   modal: 'wishlist'  },
    { label: 'Gift Cards', modal: 'giftcards' },
  ];

  const bottomLinks = [
    { label: 'Privacy Policy',  modal: 'privacy' },
    { label: 'Terms of Service',modal: 'terms'   },
    { label: 'Cookie Policy',   modal: 'cookies' },
  ];

  return (
    <>
      <footer className="bg-gray-950 text-gray-400 mt-20">
        {/* Top gradient accent */}
        <div className="h-[2px] bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">

          {/* Newsletter strip */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/[0.1] to-purple-600/[0.1] border border-white/[0.06] rounded-2xl px-6 py-5 mb-12 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-bold text-sm">📬 Stay in the loop</p>
              <p className="text-gray-500 text-xs mt-0.5">Get new arrivals, deals and reading picks delivered to your inbox.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="email" placeholder="your@email.com"
                className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-all flex-1 sm:w-52" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all active:scale-[0.97] whitespace-nowrap flex-shrink-0">
                Subscribe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="relative w-8 h-8 rounded-[10px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-glow-blue group-hover:scale-105 transition-transform duration-200">
                  <BookOpen className="w-[17px] h-[17px] text-white" />
                  <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-white/15 to-transparent" />
                </div>
                <span className="font-extrabold text-[15px] text-white tracking-tight">Book<span className="text-blue-400">Store</span></span>
              </Link>
              <p className="text-sm leading-relaxed text-gray-500 mb-5 max-w-[200px]">
                Your trusted destination for books of every genre, delivered fast and with care.
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL.map(({ Icon, href, label }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.2] flex items-center justify-center text-gray-500 hover:text-white transition-all duration-150 group">
                    <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Shop</h3>
              <ul className="space-y-2.5">
                {[
                  { label: '📖 Fiction',     to: '/browse?category=Fiction'     },
                  { label: '📰 Non-Fiction', to: '/browse?category=Non-Fiction' },
                  { label: '🔬 Science',     to: '/browse?category=Science'     },
                  { label: '🧸 Children',    to: '/browse?category=Children'    },
                  { label: '🌱 Self-Help',   to: '/browse?category=Self-Help'   },
                ].map(l => (
                  <li key={l.label}>
                    <Link to={l.to}
                      className="text-sm text-gray-500 hover:text-gray-100 transition-colors duration-150 hover:translate-x-0.5 inline-flex items-center gap-1 group">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Account</h3>
              <ul className="space-y-2.5">
                {accountLinks.map(l => (
                  <li key={l.label}>
                    {l.to ? (
                      <Link to={l.to} className="text-sm text-gray-500 hover:text-gray-100 transition-colors duration-150">
                        {l.label}
                      </Link>
                    ) : (
                      <button onClick={() => openModal(l.modal)}
                        className="text-sm text-gray-500 hover:text-gray-100 transition-colors duration-150 text-left">
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Help & Legal</h3>
              <ul className="space-y-2.5">
                {helpLinks.map(l => (
                  <li key={l.label}>
                    <button onClick={() => openModal(l.modal)}
                      className="text-sm text-gray-500 hover:text-gray-100 transition-colors duration-150 text-left">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2.5 mb-8 justify-center sm:justify-start">
            {[
              { icon: '🔒', label: 'SSL Encrypted'     },
              { icon: '💳', label: 'PCI DSS Certified' },
              { icon: '📦', label: 'Free Returns'      },
              { icon: '⚡', label: 'Fast Dispatch'     },
              { icon: '🌍', label: 'Ships Worldwide'   },
            ].map(({ icon, label }) => (
              <span key={label}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] px-3 py-1.5 rounded-full transition-all duration-150 cursor-default">
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.07] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-600">© 2025 BookStore, Inc. All rights reserved. Made with ❤️ for book lovers.</p>
            <div className="flex items-center gap-5 text-xs text-gray-600">
              {bottomLinks.map(l => (
                <button key={l.label} onClick={() => openModal(l.modal)}
                  className="hover:text-gray-300 transition-colors duration-150">
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal portal */}
      {activeModal && <Modal modalKey={activeModal} onClose={closeModal} />}
    </>
  );
}
