import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, BookmarkPlus, Send, Loader2, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { MOCK_BOOKS } from '../data/mockBooks';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = MOCK_BOOKS.find(b => b.id === id) || MOCK_BOOKS[0];
  
  // Action state
  const [isBorrowed, setIsBorrowed] = useState(book.status === 'borrowed');
  const [isWishlisted, setIsWishlisted] = useState(book.status === 'wishlist');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const submitQuestion = async (question: string) => {
    if (!question.trim()) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are a helpful librarian AI assistant for the app BookMind. The user is asking about the book "${book.title}" by ${book.author}. 
      
      User question: ${question}
      
      Provide a concise, insightful, and helpful answer based on the book's themes and content.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      if (response.text) {
        setChatHistory(prev => [...prev, { role: 'model', text: response.text as string }]);
      }
    } catch (error) {
      console.error("Error asking AI:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I couldn't process that request right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQuestion(chatInput);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20"
    >
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-gray-200/50">
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          
          <div className="flex flex-col gap-3">
            {book.readUrl ? (
              <a 
                href={book.readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm bg-purple-600 hover:bg-purple-700 text-white"
              >
                <BookOpen className="w-5 h-5" />
                Read for Free (eBook)
              </a>
            ) : (
              <button 
                onClick={() => {
                  if (book.available || isBorrowed) {
                    setIsBorrowed(!isBorrowed);
                  }
                }}
                disabled={!book.available && !isBorrowed}
                className={`w-full font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${
                  isBorrowed 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : !book.available 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                {isBorrowed ? 'Return Book' : !book.available ? 'Currently Unavailable' : 'Borrow Book'}
              </button>
            )}
            <button 
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`w-full font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm border ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <BookmarkPlus className="w-5 h-5" />
              {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>

        {/* Right Column: Details & AI */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${book.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {book.available ? 'Available Now' : 'Currently Issued'}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-2 leading-tight">{book.title}</h1>
            <p className="text-xl text-gray-500 font-medium">{book.author}</p>
          </div>

          {/* Description */}
          {book.description && (
            <section className="bg-indigo-50/50 rounded-2xl p-6 lg:p-8 border border-indigo-100/50">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-900">About this Book</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {book.description}
              </p>
            </section>
          )}

          {/* Key Topics */}
          {book.topics && book.topics.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Key Topics</h2>
              <div className="flex flex-wrap gap-2">
                {book.topics.map(topic => (
                  <span key={topic} className="px-3.5 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">
                    {topic}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Famous Quotes */}
          {book.quotes && book.quotes.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Famous Quotes</h2>
              <div className="grid gap-4">
                {book.quotes.map((quote, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                    <Quote className="w-6 h-6 text-indigo-200 shrink-0" />
                    <p className="text-gray-600 italic leading-relaxed">{quote}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Ask AI Chat */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-gray-900">Ask AI About This Book</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <Sparkles className="w-8 h-8 opacity-50" />
                  <p className="text-sm">Ask anything about the themes, characters, or concepts.</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    <button onClick={() => submitQuestion("What are the main takeaways?")} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">What are the main takeaways?</button>
                    <button onClick={() => submitQuestion("Who should read this book?")} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">Who should read this book?</button>
                  </div>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.role === 'user' ? (
                        <p>{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-indigo-600">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleAskAI} className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || isTyping}
                  className="absolute right-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
