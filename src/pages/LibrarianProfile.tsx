import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Shield, Edit3, BookOpen, Users, AlertCircle, BadgeCheck, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

export default function LibrarianProfile() {
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'password' | 'contact' | 'notifications' | null>(null);

  // Form states
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [contactForm, setContactForm] = useState({ email: user?.email || '', phone: '+1 (555) 987-6543' });
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, sms: false, push: true });

  const handleAction = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      handleAction('Passwords do not match');
      return;
    }
    handleAction('Password updated successfully');
    setActiveModal(null);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction('Contact info updated successfully');
    setActiveModal(null);
  };

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction('Notification preferences saved');
    setActiveModal(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-10 relative"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {activeModal === 'password' && 'Change Password'}
                  {activeModal === 'contact' && 'Update Contact Info'}
                  {activeModal === 'notifications' && 'Notification Preferences'}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {activeModal === 'password' && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.current}
                        onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Update Password</button>
                    </div>
                  </form>
                )}

                {activeModal === 'contact' && (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={contactForm.phone}
                        onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Save Changes</button>
                    </div>
                  </form>
                )}

                {activeModal === 'notifications' && (
                  <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive updates via email</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPrefs.email}
                          onChange={e => setNotificationPrefs({...notificationPrefs, email: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">SMS Notifications</p>
                          <p className="text-sm text-gray-500">Receive urgent alerts via SMS</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPrefs.sms}
                          onChange={e => setNotificationPrefs({...notificationPrefs, sms: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                        <div>
                          <p className="font-medium text-gray-900">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive in-app notifications</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationPrefs.push}
                          onChange={e => setNotificationPrefs({...notificationPrefs, push: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">Save Preferences</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header / Personal Details */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-800 to-slate-900"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6 mt-12">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 text-4xl font-bold">
                {user?.email?.[0].toUpperCase() || 'L'}
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{user?.displayName || 'Librarian'}</h1>
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-500 font-medium mt-1">Head Librarian • ID: LIB-2026-001</p>
          </div>
          
          <button 
            onClick={() => handleAction('Profile editor coming soon')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
              <p className="font-medium text-gray-900">{contactForm.email || 'librarian@bookmind.edu'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone Number</p>
              <p className="font-medium text-gray-900">{contactForm.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Roles & Permissions */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">System Roles</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                Administrator
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                Catalog Manager
              </span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                User Support
              </span>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveModal('password')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                Change Password
              </button>
              <button 
                onClick={() => setActiveModal('contact')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                Update Contact Info
              </button>
              <button 
                onClick={() => setActiveModal('notifications')}
                className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                Notification Preferences
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Stats & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Library Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">12,450</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Total Books</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">842</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Active Students</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Overdue Returns</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Added 15 new books to the "Science Fiction" category</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approved library membership for 5 new students</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday at 4:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4 pb-4 border-b border-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-rose-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sent overdue notices to 12 students</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday at 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Updated catalog metadata for "The Lean Startup"</p>
                  <p className="text-xs text-gray-500 mt-1">Mar 10, 2026</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
