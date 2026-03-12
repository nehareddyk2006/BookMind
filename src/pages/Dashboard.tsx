import { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, BookOpen, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MOCK_BOOKS, MOODS } from '../data/mockBooks';
import BookLoader from '../components/BookLoader';

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const MOCK_RECOMMENDED = MOCK_BOOKS.filter(b => b.whyRecommended);
  const MOCK_TRENDING = MOCK_BOOKS.filter(b => !b.whyRecommended && !b.readUrl);
  const MOCK_FREE_EBOOKS = MOCK_BOOKS.filter(b => b.readUrl);

  const filteredRecommended = selectedMood === 'All' 
    ? MOCK_RECOMMENDED 
    : MOCK_RECOMMENDED.filter(book => book.moods.includes(selectedMood));

  const filteredTrending = selectedMood === 'All'
    ? MOCK_TRENDING
    : MOCK_TRENDING.filter(book => book.moods.includes(selectedMood));

  const filteredFreeEbooks = selectedMood === 'All'
    ? MOCK_FREE_EBOOKS
    : MOCK_FREE_EBOOKS.filter(book => book.moods.includes(selectedMood));

  if (loading) {
    return <BookLoader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Good morning</h1>
        <p className="text-gray-500">Here's what's happening in your library today.</p>
      </div>

      {/* Mood Reading */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">What are you in the mood for?</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {MOODS.map((mood) => (
            <button 
              key={mood.name}
              onClick={() => setSelectedMood(mood.name)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                selectedMood === mood.name 
                  ? 'bg-indigo-600 text-white shadow-md scale-105' 
                  : mood.color
              }`}
            >
              <span>{mood.icon}</span>
              {mood.name}
            </button>
          ))}
        </div>
      </section>

      {/* AI Recommended */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedMood === 'All' ? 'AI Recommended for You' : `Recommended in ${selectedMood}`}
            </h2>
          </div>
          <Link to={`/discover?mood=${selectedMood}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommended.length > 0 ? filteredRecommended.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} className="group block">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-5 h-full">
                <div className="w-32 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium mb-3 w-fit">
                    <Sparkles className="w-3 h-3" />
                    {book.whyRecommended}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{book.author}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${book.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {book.available ? 'Available' : 'Issued'}
                    </span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded-full bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 flex items-center justify-center transition-colors" title="AI Summary">
                        <BookOpen className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">No recommended books found for this mood.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Books */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedMood === 'All' ? 'Trending Books' : `Trending in ${selectedMood}`}
          </h2>
          <Link to={`/discover?mood=${selectedMood}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Explore <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 lg:-mx-8 lg:px-8 gap-6 snap-x hide-scrollbar">
          {filteredTrending.length > 0 ? filteredTrending.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} className="group shrink-0 w-40 snap-start">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{book.title}</h3>
              <p className="text-gray-500 text-xs truncate mt-0.5">{book.author}</p>
            </Link>
          )) : (
            <div className="w-full py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">No trending books found for this mood.</p>
            </div>
          )}
        </div>
      </section>

      {/* Free Public Domain eBooks */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedMood === 'All' ? 'Free Public Domain eBooks' : `Free eBooks in ${selectedMood}`}
            </h2>
          </div>
          <Link to={`/discover?type=free`} className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Explore Free eBooks <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 lg:-mx-8 lg:px-8 gap-6 snap-x hide-scrollbar">
          {filteredFreeEbooks.length > 0 ? filteredFreeEbooks.map((book) => (
            <Link to={`/book/${book.id}`} key={book.id} className="group shrink-0 w-40 snap-start">
              <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300 relative">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  Free
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-purple-600 transition-colors">{book.title}</h3>
              <p className="text-gray-500 text-xs truncate mt-0.5">{book.author}</p>
            </Link>
          )) : (
            <div className="w-full py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">No free eBooks found for this mood.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
