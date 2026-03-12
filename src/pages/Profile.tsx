import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { Mail, Phone, BookOpen, BookmarkPlus, Settings, Edit3, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_BORROWED = [
  { id: '1', title: 'Deep Work', author: 'Cal Newport', coverUrl: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg', dueDate: '2026-03-24' },
  { id: '4', title: 'The Lean Startup', author: 'Eric Ries', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg', dueDate: '2026-03-18' },
];

const MOCK_WISHLIST = [
  { id: '2', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' },
  { id: '5', title: 'Zero to One', author: 'Peter Thiel', coverUrl: 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg' },
];

const MOCK_INTERESTS = ['Productivity', 'Technology', 'Psychology', 'Startups', 'Science Fiction'];

export default function Profile() {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-10"
    >
      {/* Header / Personal Details */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 mt-12">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-gray-900">{user?.displayName || 'Library User'}</h1>
            <p className="text-gray-500 font-medium mt-1">Avid Reader • Member since 2026</p>
          </div>
          
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email Address</p>
              <p className="font-medium text-gray-900">{user?.email || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone Number</p>
              <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interests & Stats */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-gray-900">Your Interests</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOCK_INTERESTS.map(interest => (
                <span key={interest} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                  {interest}
                </span>
              ))}
              <button className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 border border-dashed border-gray-300">
                + Add More
              </button>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Reading Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Books Read</span>
                <span className="text-xl font-bold text-indigo-600">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-600 font-medium">Current Streak</span>
                <span className="text-xl font-bold text-emerald-600">12 Days</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Books */}
        <div className="lg:col-span-2 space-y-8">
          {/* Borrowed Books */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Currently Borrowed</h2>
              </div>
              <span className="text-sm font-medium text-gray-500">{MOCK_BORROWED.length} Books</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_BORROWED.map(book => (
                <Link to={`/book/${book.id}`} key={book.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 group">
                  <div className="w-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                    <div className="mt-3 inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium w-fit">
                      Due: {new Date(book.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Wishlist */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-bold text-gray-900">Your Wishlist</h2>
              </div>
              <span className="text-sm font-medium text-gray-500">{MOCK_WISHLIST.length} Books</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_WISHLIST.map(book => (
                <Link to={`/book/${book.id}`} key={book.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex gap-4 group">
                  <div className="w-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
