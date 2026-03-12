import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { signInWithGoogle, auth, db } from './firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { BookOpen, Search, Library, Sparkles, BookMarked, User as UserIcon, LogOut, Bell, Menu, X, Clock, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import BookDetails from './pages/BookDetails';
import PlaceholderPage from './pages/PlaceholderPage';
import SearchModal from './components/SearchModal';
import GlobalChatbot from './components/GlobalChatbot';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import MyBooks from './pages/MyBooks';
import Recommendations from './pages/Recommendations';
import IssuedBooks from './pages/IssuedBooks';
import AdminDashboard from './pages/AdminDashboard';
import LibrarianProfile from './pages/LibrarianProfile';

const getNotificationStyle = (type: string) => {
  switch (type) {
    case 'overdue':
      return { icon: AlertCircle, color: 'text-rose-600', bgColor: 'bg-rose-100' };
    case 'due_date':
      return { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' };
    case 'recommendation':
      return { icon: Sparkles, color: 'text-indigo-600', bgColor: 'bg-indigo-100' };
    default:
      return { icon: Bell, color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
  }
};

function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by createdAt descending
      notifs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setNotifications(notifs);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    notifications.filter(n => !n.read).forEach(n => markAsRead(n.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', icon: BookOpen, path: '/' },
    { name: 'Discover', icon: Search, path: '/discover' },
    { name: 'My Books', icon: Library, path: '/my-books' },
    { name: 'AI Recommendations', icon: Sparkles, path: '/recommendations' },
    { name: 'Issued Books', icon: BookMarked, path: '/issued' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900">
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <GlobalChatbot />
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">BookMind</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group font-medium ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search books, topics, or authors..." 
                className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none cursor-pointer"
                onClick={() => setSearchOpen(true)}
                readOnly
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Mark all as read</button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No notifications yet.</div>
                      ) : (
                        notifications.map((notif) => {
                          const style = getNotificationStyle(notif.type);
                          const Icon = style.icon;
                          return (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bgColor}`}>
                                <Icon className={`w-5 h-5 ${style.color}`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5 leading-snug">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notif.createdAt ? new Date(notif.createdAt.toMillis()).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0"></div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                      <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Link to="/profile" className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-full h-full p-1.5 text-indigo-600" />
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function LibrarianLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by createdAt descending
      notifs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setNotifications(notifs);
    }, (error) => {
      console.error("Error fetching notifications:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    notifications.filter(n => !n.read).forEach(n => markAsRead(n.id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', icon: Shield, path: '/' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Librarian</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="font-medium text-gray-600 hidden sm:block">Library Management System</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Mark all as read</button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No notifications yet.</div>
                      ) : (
                        notifications.map((notif) => {
                          const style = getNotificationStyle(notif.type);
                          const Icon = style.icon;
                          return (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-4 cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bgColor}`}>
                                <Icon className={`w-5 h-5 ${style.color}`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                <p className="text-sm text-gray-600 mt-0.5 leading-snug">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notif.createdAt ? new Date(notif.createdAt.toMillis()).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0"></div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                      <button className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">View all notifications</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Link to="/librarian-profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Librarian'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-gray-200">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-full h-full p-1.5 text-indigo-600" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, isAuthReady, userRole } = useAuth();

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">Loading...</div>;
  }

  if (!user) {
    return <LandingPage />;
  }

  if (userRole === 'admin') {
    return (
      <LibrarianLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/librarian-profile" element={<LibrarianProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LibrarianLayout>
    );
  }

  return (
    <StudentLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/issued" element={<IssuedBooks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StudentLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
