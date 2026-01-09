import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, MapPin, User, Sparkles } from 'lucide-react';
import { askTripGuide } from '../lib/itineraryService';

const TripGuideBot = ({ tripData, apiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Hi! I'm your local guide for ${tripData?.destination || 'your trip'}. Ask me anything about directions, food, or hidden gems!` 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await askTripGuide(inputText, tripData, apiKey);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I got distracted by a butterfly. Ask me again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Bot Window */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-80 md:w-96 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden flex flex-col animate-fade-in-up origin-bottom-right transition-all duration-300 transform scale-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-200">
                 {/* Guide Avatar */}
                 <span className="text-2xl">👨‍✈️</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Tour Guide</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <MapPin className="w-3 h-3"/> {tripData?.destination}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-gray-100 rounded-tl-none'
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="Ask about food, places..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !inputText.trim()}
              className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition"
            >
              <Send className="w-5 h-5"/>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20"></div>
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white/20 group-hover:scale-110 transition duration-300">
             <span className="text-2xl pt-1">👨‍✈️</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-xl shadow-xl text-slate-700 text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-x-2 group-hover:translate-x-0">
             Need a Guide?
             <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-white transform -translate-y-1/2 rotate-45"></div>
          </div>
        </button>
      )}

    </div>
  );
};

export default TripGuideBot;
