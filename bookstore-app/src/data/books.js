export const CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'Children', 'Biography', 'Self-Help', 'History', 'Thriller'];

export const BOOKS = [
  { id: 1,  title: 'Atomic Habits',          author: 'James Clear',       category: 'Self-Help',   price: 14.99, originalPrice: null,  rating: 4.8, reviews: 3241, cover: 'https://covers.openlibrary.org/b/id/10527843-M.jpg',  badge: null,       description: 'Tiny changes, remarkable results. An easy and proven way to build good habits and break bad ones.' },
  { id: 2,  title: 'Dune',                   author: 'Frank Herbert',      category: 'Fiction',     price: 10.39, originalPrice: 12.99, rating: 4.9, reviews: 5821, cover: 'https://covers.openlibrary.org/b/id/8231856-M.jpg',   badge: 'SALE',     description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides—heir to a noble family.' },
  { id: 3,  title: 'Sapiens',                author: 'Yuval Noah Harari',  category: 'History',     price: 16.99, originalPrice: null,  rating: 4.7, reviews: 4102, cover: 'https://covers.openlibrary.org/b/id/8571214-M.jpg',   badge: null,       description: 'A brief history of humankind from the Stone Age to the twenty-first century.' },
  { id: 4,  title: 'The Alchemist',          author: 'Paulo Coelho',       category: 'Fiction',     price: 9.34,  originalPrice: 10.99, rating: 4.6, reviews: 6003, cover: 'https://covers.openlibrary.org/b/id/8258867-M.jpg',   badge: 'SALE',     description: 'A fable about following your dream and listening to your heart.' },
  { id: 5,  title: '1984',                   author: 'George Orwell',      category: 'Fiction',     price: 9.99,  originalPrice: null,  rating: 4.9, reviews: 7200, cover: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',   badge: null,       description: 'A dystopian social science fiction novel about totalitarianism.' },
  { id: 6,  title: 'Brave New World',        author: 'Aldous Huxley',      category: 'Fiction',     price: 7.49,  originalPrice: 9.99,  rating: 4.4, reviews: 2891, cover: 'https://covers.openlibrary.org/b/id/8258884-M.jpg',   badge: 'SALE',     description: 'Set in a futuristic World State, citizens are cultured in hatcheries and conditioned.' },
  { id: 7,  title: 'To Kill a Mockingbird',  author: 'Harper Lee',         category: 'Fiction',     price: 11.99, originalPrice: null,  rating: 4.8, reviews: 4421, cover: 'https://covers.openlibrary.org/b/id/8739161-M.jpg',   badge: null,       description: 'The story of racial injustice and the loss of innocence in the American South.' },
  { id: 8,  title: 'The Great Gatsby',       author: 'F. Scott Fitzgerald',category: 'Fiction',     price: 8.99,  originalPrice: null,  rating: 4.3, reviews: 3102, cover: 'https://covers.openlibrary.org/b/id/10090785-M.jpg', badge: null,       description: 'A classic American novel about the mysterious millionaire Jay Gatsby.' },
  { id: 9,  title: 'Deep Work',              author: 'Cal Newport',        category: 'Self-Help',   price: 13.99, originalPrice: null,  rating: 4.7, reviews: 2801, cover: 'https://covers.openlibrary.org/b/id/9255566-M.jpg',   badge: 'CROSS',    description: 'Rules for focused success in a distracted world.' },
  { id: 10, title: 'Thinking, Fast & Slow',  author: 'Daniel Kahneman',    category: 'Non-Fiction', price: 15.99, originalPrice: null,  rating: 4.7, reviews: 3410, cover: 'https://covers.openlibrary.org/b/id/6398631-M.jpg',   badge: null,       description: 'How two systems of thought drive the way we think and make decisions.' },
  { id: 11, title: 'Fahrenheit 451',         author: 'Ray Bradbury',       category: 'Fiction',     price: 10.99, originalPrice: null,  rating: 4.7, reviews: 3900, cover: 'https://covers.openlibrary.org/b/id/8228691-M.jpg',   badge: null,       description: 'A fireman whose job is burning books comes to question everything.' },
  { id: 12, title: 'The Power of Now',       author: 'Eckhart Tolle',      category: 'Self-Help',   price: 11.99, originalPrice: null,  rating: 4.5, reviews: 2200, cover: 'https://covers.openlibrary.org/b/id/8091016-M.jpg',   badge: 'CROSS',    description: 'A guide to spiritual enlightenment and living in the present moment.' },
  { id: 13, title: 'A Brief History of Time',author: 'Stephen Hawking',    category: 'Science',     price: 12.99, originalPrice: null,  rating: 4.6, reviews: 4120, cover: 'https://covers.openlibrary.org/b/id/8228685-M.jpg',   badge: null,       description: 'A landmark volume exploring the cosmos and origin of the universe.' },
  { id: 14, title: 'Animal Farm',            author: 'George Orwell',      category: 'Fiction',     price: 7.99,  originalPrice: null,  rating: 4.5, reviews: 5100, cover: 'https://covers.openlibrary.org/b/id/8406786-M.jpg',   badge: null,       description: 'An allegorical novella reflecting the events leading up to the Russian Revolution.' },
  { id: 15, title: 'Of Mice and Men',        author: 'John Steinbeck',     category: 'Fiction',     price: 8.49,  originalPrice: null,  rating: 4.4, reviews: 2800, cover: 'https://covers.openlibrary.org/b/id/12818862-M.jpg',  badge: 'CROSS',    description: 'The story of two migrant workers dreaming of a place to call their own.' },
  { id: 16, title: 'The Road',               author: 'Cormac McCarthy',    category: 'Fiction',     price: 12.99, originalPrice: null,  rating: 4.5, reviews: 2950, cover: 'https://covers.openlibrary.org/b/id/8228687-M.jpg',   badge: null,       description: 'A post-apocalyptic novel following a father and son through a burned America.' },
];

export const ORDERS = [
  { id: 'BS-2024-00847', date: 'Jul 12, 2025', items: 3, total: 33.06, status: 'Processing' },
  { id: 'BS-2024-00791', date: 'Jun 28, 2025', items: 2, total: 24.98, status: 'Delivered'  },
  { id: 'BS-2024-00745', date: 'Jun 15, 2025', items: 1, total:  9.99, status: 'Delivered'  },
  { id: 'BS-2024-00688', date: 'May 30, 2025', items: 5, total: 67.45, status: 'Returned'   },
  { id: 'BS-2024-00631', date: 'May 10, 2025', items: 2, total: 19.98, status: 'Cancelled'  },
];

export const TRACKING_STEPS = [
  { label: 'Out for Delivery',       time: 'Jul 17, 2025 — 08:42 AM', location: 'New York, NY',  done: true  },
  { label: 'In Transit — Sorting',   time: 'Jul 16, 2025 — 11:15 PM', location: 'Newark, NJ',    done: true  },
  { label: 'Departed Warehouse',     time: 'Jul 15, 2025 — 06:30 AM', location: 'Chicago, IL',   done: true  },
  { label: 'Picked Up by Carrier',   time: 'Jul 13, 2025 — 02:00 PM', location: 'Chicago, IL',   done: true  },
  { label: 'Order Confirmed',        time: 'Jul 12, 2025 — 09:15 AM', location: '',              done: false },
];
