import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResult('');
      setSources([]);
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult('');
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are BookMind's intelligent search assistant. The user is searching for: "${query}". 
      Provide a helpful, concise summary or answer based on real-world information about books, authors, or literary topics.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      if (response.text) {
        setResult(response.text);
      }
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        setSources(chunks.map(chunk => chunk.web).filter(Boolean));
      }
    } catch (error) {
      console.error("Search error:", error);
      setResult("I'm sorry, I couldn't complete the search right now. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100 flex flex-col max-h-[80vh]"
          >
            <form onSubmit={handleSearch} className="relative border-b border-gray-100 shrink-0">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AI about books, authors, or topics..."
                className="w-full bg-transparent py-4 pl-12 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {!isSearching && !result && (
                <div className="flex flex-col items-center justify-center text-gray-400 py-12">
                  <Sparkles className="w-10 h-10 mb-4 opacity-50" />
                  <p>Powered by Gemini with Google Search</p>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center justify-center py-12 text-indigo-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}

              {result && !isSearching && (
                <div className="space-y-6">
                  <div className="prose prose-indigo max-w-none prose-p:leading-relaxed">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  
                  {sources.length > 0 && (
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Sources</h3>
                      <div className="flex flex-col gap-2">
                        {sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50/50 p-2 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <span className="truncate">{source.title || source.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
