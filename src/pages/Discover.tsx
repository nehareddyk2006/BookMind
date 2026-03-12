import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ChevronDown, BookOpen, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_BOOKS, MOODS } from '../data/mockBooks';
import BookLoader from '../components/BookLoader';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMood = searchParams.get('mood') || 'All';
  const initialType = searchParams.get('type');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [showFreeEbooks, setShowFreeEbooks] = useState(initialType === 'free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedMood === 'All') {
      searchParams.delete('mood');
    } else {
      searchParams.set('mood', selectedMood);
    }
    
    if (showFreeEbooks) {
      searchParams.set('type', 'free');
    } else {
      searchParams.delete('type');
    }
    
    setSearchParams(searchParams, { replace: true });
  }, [selectedMood, showFreeEbooks, searchParams, setSearchParams]);

  const categories = ['All', 'Productivity', 'Self-Help', 'Psychology', 'Business', 'History', 'Science Fiction'];

  const filteredBooks = MOCK_BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesMood = selectedMood === 'All' || (book.moods && book.moods.includes(selectedMood));
    const matchesFree = showFreeEbooks ? !!book.readUrl : true;
    return matchesSearch && matchesCategory && matchesMood && matchesFree;
  });

  if (loading) {
    return <BookLoader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Discover</h1>
          <p className="text-gray-500">Explore our entire collection of books.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-4">
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-8 lg:px-8 gap-2 hide-scrollbar">
          <button
            onClick={() => setShowFreeEbooks(!showFreeEbooks)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              showFreeEbooks
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Free eBooks
          </button>
          
          <div className="w-px h-8 bg-gray-200 mx-1 shrink-0 self-center"></div>

          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Moods */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 lg:-mx-8 lg:px-8 gap-2 hide-scrollbar">
          {MOODS.map(mood => (
            <button
              key={mood.name}
              onClick={() => setSelectedMood(mood.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedMood === mood.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{mood.icon}</span>
              {mood.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredBooks.map(book => (
          <Link to={`/book/${book.id}`} key={book.id} className="group flex flex-col">
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300 relative">
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              {!book.available && (
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  Issued
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{book.title}</h3>
            <p className="text-gray-500 text-xs mt-1">{book.author}</p>
          </Link>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
        <div className="py-20 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No books found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or category filter.</p>
        </div>
      )}
    </motion.div>
  );
}
