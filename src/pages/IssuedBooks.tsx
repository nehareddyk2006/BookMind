import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookMarked, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKS } from '../data/mockBooks';
import BookLoader from '../components/BookLoader';

export default function IssuedBooks() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const borrowedBooks = MOCK_BOOKS.filter(b => b.status === 'borrowed');

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
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Issued Books</h1>
        <p className="text-gray-500">Track your currently borrowed books and due dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {borrowedBooks.map((book) => {
          const dueDate = new Date(book.dueDate!);
          const today = new Date();
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = daysLeft < 0;
          const isDueSoon = daysLeft >= 0 && daysLeft <= 3;

          return (
            <Link to={`/book/${book.id}`} key={book.id} className="group block">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-6 h-full relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isOverdue ? 'bg-rose-500' : isDueSoon ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                
                <div className="w-24 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex flex-col flex-1 py-1">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{book.author}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Due: <span className="font-medium text-gray-900">{dueDate.toLocaleDateString()}</span></span>
                    </div>
                    
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium w-fit ${
                      isOverdue 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : isDueSoon 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isOverdue ? (
                        <><AlertCircle className="w-3.5 h-3.5" /> Overdue by {Math.abs(daysLeft)} days</>
                      ) : isDueSoon ? (
                        <><Clock className="w-3.5 h-3.5" /> Due in {daysLeft} days</>
                      ) : (
                        <><BookMarked className="w-3.5 h-3.5" /> {daysLeft} days remaining</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {borrowedBooks.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No books issued</h3>
          <p className="text-gray-500 mt-1">You don't have any books currently borrowed.</p>
          <Link to="/discover" className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            Browse Library
          </Link>
        </div>
      )}
    </motion.div>
  );
}
