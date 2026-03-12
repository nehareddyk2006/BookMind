import { motion } from 'motion/react';

export default function BookLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[300px]">
      <div className="relative w-32 h-24" style={{ perspective: '1000px' }}>
        {/* Book spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-indigo-800 -translate-x-1/2 rounded-sm z-0"></div>
        
        {/* Left cover */}
        <div className="absolute right-1/2 top-0 bottom-0 w-16 bg-indigo-600 rounded-l-md border-r border-indigo-800 shadow-lg origin-right"></div>
        
        {/* Right cover */}
        <div className="absolute left-1/2 top-0 bottom-0 w-16 bg-indigo-600 rounded-r-md border-l border-indigo-800 shadow-lg origin-left"></div>
        
        {/* Pages turning from right to left */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1 bottom-1 w-[60px] bg-white rounded-r-sm border border-gray-200 origin-left shadow-sm"
            animate={{
              rotateY: [0, -180],
              zIndex: [10, 20, 10]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            style={{ 
              backfaceVisibility: 'visible',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Page lines to make it look like text */}
            <div className="absolute inset-2 flex flex-col gap-1.5 opacity-30">
              <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              <div className="h-1 bg-gray-300 rounded w-full"></div>
              <div className="h-1 bg-gray-300 rounded w-5/6"></div>
              <div className="h-1 bg-gray-300 rounded w-full"></div>
              <div className="h-1 bg-gray-300 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-sm font-medium text-indigo-600 animate-pulse tracking-wide uppercase">Fetching library data...</p>
    </div>
  );
}
