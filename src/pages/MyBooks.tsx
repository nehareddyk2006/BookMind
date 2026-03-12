import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Library, BookmarkPlus, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../data/mockBooks';
import BookLoader from '../components/BookLoader';

export default function MyBooks() {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'read'>('wishlist');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const wishlistedBooks = MOCK_BOOKS.filter(b => b.status === 'wishlist');
  const readBooks = MOCK_BOOKS.filter(b => b.status === 'read');

  const displayBooks = activeTab === 'wishlist' ? wishlistedBooks : readBooks;

  if (loading) {
    return <BookLoader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Books</h1>
        <p className="text-gray-500">Manage your reading lists and history.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'wishlist'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <BookmarkPlus className="w-4 h-4" />
          Wishlist ({wishlistedBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('read')}
          className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'read'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Read ({readBooks.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {displayBooks.map(book => (
          <Link to={`/book/${book.id}`} key={book.id} className="group flex flex-col">
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{book.title}</h3>
            <p className="text-gray-500 text-xs mt-1">{book.author}</p>
          </Link>
        ))}
      </div>
      
      {displayBooks.length === 0 && (
        <div className="py-20 text-center">
          <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No books found</h3>
          <p className="text-gray-500 mt-1">
            {activeTab === 'wishlist' 
              ? "You haven't added any books to your wishlist yet." 
              : "You haven't marked any books as read yet."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
