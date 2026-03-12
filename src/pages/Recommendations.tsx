import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../data/mockBooks';
import BookLoader from '../components/BookLoader';

export default function Recommendations() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const recommendedBooks = MOCK_BOOKS.filter(b => b.whyRecommended);

  if (loading) {
    return <BookLoader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
          <Sparkles className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Suggestions
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Curated Just For You</h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Based on your reading history, wishlist, and stated interests in Productivity and Business, our AI has selected these titles for your next read.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendedBooks.map((book) => (
          <Link to={`/book/${book.id}`} key={book.id} className="group block">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-6 h-full">
              <div className="w-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col flex-1 py-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium mb-3 w-fit">
                  <Sparkles className="w-3 h-3" />
                  {book.whyRecommended}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{book.author}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${book.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {book.available ? 'Available Now' : 'Currently Issued'}
                  </span>
                  <div className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                    View Details <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
