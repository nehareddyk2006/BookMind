import { useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { BookOpen, Sparkles, Library, ArrowRight, BookMarked } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

const FloatingBook = ({ delay = 0, left, top, right, bottom, baseRotateY = -30, scale = 1, color = "bg-indigo-600", blur = "blur-none", coverUrl }: any) => {
  return (
    <motion.div
      className={`absolute z-0 pointer-events-none ${blur}`}
      style={{ left, top, right, bottom, scale, perspective: '1000px' }}
      animate={{
        y: [0, -40, 0],
        rotateX: [10, 25, 10],
        rotateZ: [-5, 5, -5]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.div
        className="relative w-28 h-40 sm:w-36 sm:h-52"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: [baseRotateY, baseRotateY + 20, baseRotateY] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: delay * 1.5 }}
      >
        {/* Back Cover */}
        <div 
          className={`absolute inset-0 ${color} rounded-r-md shadow-2xl`}
          style={{ transform: 'translateZ(-10px)' }}
        />
        
        {/* Pages (Block) */}
        <div 
          className="absolute inset-y-1 left-1 right-1 bg-[#f4f4f0] rounded-r-sm"
          style={{ transform: 'translateZ(-5px)' }}
        >
          <div className="absolute inset-y-0 right-0 w-full flex flex-col justify-evenly py-2 px-1 opacity-30">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-gray-400" />
            ))}
          </div>
        </div>

        {/* Front Cover */}
        <motion.div 
          className={`absolute inset-0 ${color} rounded-r-md shadow-xl origin-left border-l border-black/20 flex items-center justify-center overflow-hidden`}
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: [0, -80, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Book Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <>
              <div className="absolute inset-2 border border-white/20 rounded-sm" style={{ transform: 'translateZ(1px)' }}></div>
              <BookOpen className="w-6 h-6 text-white/30" style={{ transform: 'translateZ(1px)' }} />
            </>
          )}
          {/* 3D Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-white/20 pointer-events-none mix-blend-overlay" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-1000 ${className}`}
    >
      <div
        style={{
          transform: "translateZ(50px)",
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </motion.div>
  );
};

export default function LandingPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (role: 'user' | 'admin') => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    localStorage.setItem('pendingRole', role);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight font-serif italic text-gray-900">BookMind</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSignIn('admin')}
              disabled={isSigningIn}
              className="hidden md:flex text-gray-600 hover:text-indigo-600 font-medium py-2.5 px-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Librarian Login
            </button>
            <button 
              onClick={() => handleSignIn('user')}
              disabled={isSigningIn}
              className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSigningIn ? 'Signing in...' : 'Student Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden min-h-[85vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-[#F9FAFB] to-[#F9FAFB]"></div>
        
        {/* Animated Background Books */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingBook left="5%" top="15%" delay={0} scale={0.8} color="bg-slate-800" baseRotateY={-20} blur="blur-[2px]" coverUrl="https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg" />
          <FloatingBook right="10%" top="20%" delay={2} scale={0.6} color="bg-gray-900" baseRotateY={-40} blur="blur-[4px]" coverUrl="https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg" />
          <FloatingBook left="15%" bottom="15%" delay={1.5} scale={1.1} color="bg-zinc-800" baseRotateY={-15} coverUrl="https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg" />
          <FloatingBook right="20%" bottom="25%" delay={3} scale={0.9} color="bg-neutral-800" baseRotateY={-50} blur="blur-[1px]" coverUrl="https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg" />
          <FloatingBook left="45%" top="5%" delay={4} scale={0.5} color="bg-stone-800" baseRotateY={-30} blur="blur-[3px]" coverUrl="https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg" />
          <FloatingBook right="40%" bottom="10%" delay={2.5} scale={0.7} color="bg-slate-900" baseRotateY={-25} blur="blur-[2px]" coverUrl="https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/40 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-2xl shadow-indigo-900/5"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Read <span className="italic text-indigo-600 font-serif">smarter</span>,<br /> not harder.
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-sans font-light leading-relaxed">
              Your intelligent library management system powered by AI. Discover, borrow, and understand books like never before.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => handleSignIn('user')}
                disabled={isSigningIn}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 px-10 rounded-full text-lg transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {isSigningIn ? 'Signing in...' : 'Student Sign In'}
              </button>
              <button 
                onClick={() => handleSignIn('admin')}
                disabled={isSigningIn}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium py-4 px-10 rounded-full text-lg transition-all hover:shadow-xl hover:shadow-gray-200 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                Librarian Access
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with 3D Cards */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why choose <span className="italic text-indigo-600">BookMind?</span></h2>
            <p className="text-lg text-gray-500 font-sans">Everything you need to manage your reading life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <TiltCard>
              <div className="bg-[#F9FAFB] rounded-3xl p-8 h-full border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Summaries</h3>
                <p className="text-gray-500 font-sans leading-relaxed">
                  Get instant, intelligent summaries of any book. Ask questions and explore themes with our built-in Gemini AI assistant.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="bg-[#F9FAFB] rounded-3xl p-8 h-full border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <Library className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Organization</h3>
                <p className="text-gray-500 font-sans leading-relaxed">
                  Keep track of what you've read, what you're reading, and what you want to read next with beautiful, intuitive shelves.
                </p>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="bg-[#F9FAFB] rounded-3xl p-8 h-full border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                  <BookMarked className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Borrowing</h3>
                <p className="text-gray-500 font-sans leading-relaxed">
                  Check availability instantly and borrow books with a single click. Never lose track of due dates again.
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 bg-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/library/1920/1080')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 font-serif italic">Ready to dive in?</h2>
          <p className="text-xl text-gray-400 mb-10 font-sans">Join thousands of readers who are already using BookMind to enhance their reading journey.</p>
          <button 
            onClick={() => handleSignIn('user')}
            disabled={isSigningIn}
            className="bg-white text-gray-900 hover:bg-indigo-50 font-bold py-4 px-12 rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSigningIn ? 'Signing in...' : 'Sign In with Google'}
          </button>
        </div>
      </section>
    </div>
  );
}
