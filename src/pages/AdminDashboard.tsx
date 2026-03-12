import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, BookOpen, Plus, Search, Edit, Trash2, CheckCircle, XCircle, AlertCircle, BookMarked, Send, X } from 'lucide-react';
import { MOCK_BOOKS } from '../data/mockBooks';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import BookLoader from '../components/BookLoader';

const MOCK_STUDENTS = [
  { id: 's1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-0101', borrowedBook: 'Deep Work', dueDate: '2026-03-24', status: 'active' },
  { id: 's2', name: 'Bob Smith', email: 'bob@example.com', phone: '+1 555-0102', borrowedBook: 'The Lean Startup', dueDate: '2026-03-18', status: 'overdue' },
  { id: 's3', name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1 555-0103', borrowedBook: 'Atomic Habits', dueDate: '2026-03-28', status: 'active' },
  { id: 's4', name: 'Diana Prince', email: 'diana@example.com', phone: '+1 555-0104', borrowedBook: 'Dune', dueDate: '2026-03-15', status: 'overdue' },
  { id: 's5', name: 'Evan Wright', email: 'evan@example.com', phone: '+1 555-0105', borrowedBook: 'Sapiens', dueDate: '2026-04-02', status: 'active' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [sendingNotification, setSendingNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Notification Modal State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Book management state
  const [books, setBooks] = useState([...MOCK_BOOKS]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    coverUrl: '',
    available: true
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'user'));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRealUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenNotificationModal = (student: any) => {
    setSelectedStudent(student);
    setNotificationMessage(`Reminder: Your book "${student.borrowedBook}" is ${student.status === 'overdue' ? 'overdue' : 'due soon'}. Please return it by ${student.dueDate}.`);
    setIsNotificationModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (!selectedStudent || !notificationMessage) return;
    
    // If it's a mock student without a real UID, try to find a real user to test with
    let targetUserId = selectedStudent.id;
    if (selectedStudent.id.startsWith('s')) {
      if (user) {
        targetUserId = user.uid; // Fallback to current admin user for testing
      } else {
        alert("Please log in to send notifications.");
        return;
      }
    }

    setSendingNotification(selectedStudent.id);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        title: selectedStudent.status === 'overdue' ? 'Overdue Book Reminder' : 'Book Due Soon',
        message: notificationMessage,
        type: selectedStudent.status === 'overdue' ? 'overdue' : 'due_date',
        read: false,
        createdAt: serverTimestamp()
      });
      setIsNotificationModalOpen(false);
      // Optional: show a toast instead of alert
    } catch (error) {
      console.error("Error sending notification:", error);
      alert('Failed to send notification.');
    } finally {
      setSendingNotification(null);
    }
  };

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      category: '',
      coverUrl: '',
      available: true
    });
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (book: any) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      category: book.category,
      coverUrl: book.coverUrl,
      available: book.available
    });
    setIsBookModalOpen(true);
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      const index = MOCK_BOOKS.findIndex(b => b.id === bookId);
      if (index !== -1) {
        MOCK_BOOKS.splice(index, 1);
        setBooks([...MOCK_BOOKS]);
      }
    }
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      const index = MOCK_BOOKS.findIndex(b => b.id === editingBook.id);
      if (index !== -1) {
        MOCK_BOOKS[index] = { ...MOCK_BOOKS[index], ...bookForm };
      }
    } else {
      const newBook = {
        id: Math.random().toString(36).substr(2, 9),
        ...bookForm,
        moods: [],
        rating: 0,
        status: 'none'
      };
      MOCK_BOOKS.unshift(newBook);
    }
    setBooks([...MOCK_BOOKS]);
    setIsBookModalOpen(false);
  };

  const stats = [
    { label: 'Total Books', value: books.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => setActiveTab('books') },
    { label: 'Issued Books', value: books.filter(b => !b.available).length, icon: BookMarked, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: () => { setActiveTab('books'); setSearchQuery('issued'); } },
    { label: 'Active Students', value: MOCK_STUDENTS.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => setActiveTab('students') },
    { label: 'Overdue Books', value: MOCK_STUDENTS.filter(s => s.status === 'overdue').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', onClick: () => { setActiveTab('students'); setSearchQuery('overdue'); } },
  ];

  const filteredBooks = books.filter(book => {
    const query = searchQuery.toLowerCase();
    if (query === 'issued') return !book.available;
    if (query === 'available') return book.available;
    return book.title.toLowerCase().includes(query) || 
           book.author.toLowerCase().includes(query);
  });

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const query = searchQuery.toLowerCase();
    if (query === 'overdue') return student.status === 'overdue';
    if (query === 'active') return student.status === 'active';
    return student.name.toLowerCase().includes(query) ||
           student.email.toLowerCase().includes(query) ||
           student.borrowedBook.toLowerCase().includes(query);
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Librarian Dashboard</h1>
          <p className="text-gray-500">Manage books, track availability, and monitor student borrowing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('books')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'books' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Manage Books
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Borrowers
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                onClick={stat.onClick}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Overdue Books</h3>
              <button onClick={() => setActiveTab('students')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</button>
            </div>
            <div className="divide-y divide-gray-100">
              {MOCK_STUDENTS.filter(s => s.status === 'overdue').map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">Borrowed: {student.borrowedBook}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-rose-600">Due: {student.dueDate}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Books Tab */}
      {activeTab === 'books' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm"
              />
            </div>
            <button 
              onClick={handleOpenAddBook}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Book Details</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBooks.map(book => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop'} alt={book.title} className="w-10 h-14 object-cover rounded-md bg-gray-100" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-semibold text-gray-900">{book.title}</p>
                            <p className="text-xs text-gray-500">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{book.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          book.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {book.available ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {book.available ? 'Available' : 'Issued'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditBook(book)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBooks.length === 0 && (
                <div className="p-8 text-center text-gray-500">No books found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Borrowers Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students or books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none shadow-sm"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student</th>
                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                    <th className="px-6 py-4 font-semibold">Borrowed Book</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900">{student.email}</span>
                          <span className="text-gray-500 text-xs">{student.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{student.borrowedBook}</td>
                      <td className="px-6 py-4 text-gray-600">{student.dueDate}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          student.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {student.status === 'active' ? 'Active' : 'Overdue'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleOpenNotificationModal(student)}
                          disabled={sendingNotification === student.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            student.status === 'overdue' 
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          }`}
                        >
                          {sendingNotification === student.id ? (
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {student.status === 'overdue' ? 'Send Warning' : 'Send Reminder'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-gray-500">No students found matching your search.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Notification Modal */}
      <AnimatePresence>
        {isNotificationModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsNotificationModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Send {selectedStudent.status === 'overdue' ? 'Warning' : 'Reminder'}
                </h3>
                <button 
                  onClick={() => setIsNotificationModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">To:</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                      <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>

                {selectedStudent.id.startsWith('s') && (
                  <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Note: This is a mock student. For testing purposes, this notification will be sent to your admin account.</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Preview</label>
                  <textarea 
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                    placeholder="Enter your message here..."
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsNotificationModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendReminder}
                    disabled={sendingNotification === selectedStudent.id || !notificationMessage.trim()}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {sendingNotification === selectedStudent.id ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsBookModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h3>
                <button 
                  onClick={() => setIsBookModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveBook} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={bookForm.title}
                    onChange={e => setBookForm({...bookForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter book title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input 
                    type="text" 
                    required
                    value={bookForm.author}
                    onChange={e => setBookForm({...bookForm, author: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter author name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    required
                    value={bookForm.category}
                    onChange={e => setBookForm({...bookForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. Technology, Fiction, Science"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                  <input 
                    type="url" 
                    value={bookForm.coverUrl}
                    onChange={e => setBookForm({...bookForm, coverUrl: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="available"
                    checked={bookForm.available}
                    onChange={e => setBookForm({...bookForm, available: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="available" className="text-sm font-medium text-gray-700">
                    Currently Available
                  </label>
                </div>
                
                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {editingBook ? 'Save Changes' : 'Add Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
