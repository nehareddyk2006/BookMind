import { motion } from 'motion/react';
import { Search, Sparkles, BookMarked, User as UserIcon, Library } from 'lucide-react';

export default function PlaceholderPage({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[80vh] flex flex-col items-center justify-center text-center"
    >
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-indigo-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-500 max-w-md">
        This section is currently under development. Check back soon for exciting new features!
      </p>
    </motion.div>
  );
}
