"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import Link from 'next/link';

// Definisikan tipe data untuk produk
type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
};

// Tipe data untuk pesan dalam chat, sekarang bisa berisi produk
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  products?: Product[]; // Properti opsional untuk menyimpan produk yang direkomendasikan
};

// Komponen kecil untuk kartu produk di dalam chat
const ChatProductCard = ({ product }: { product: Product }) => (
  <Link 
    href={`/products/${product.id}`} 
    target="_blank" 
    className="group mt-3 p-3 bg-white border-2 border-gray-100 rounded-xl flex items-center gap-3 hover:border-indigo-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
  >
    <div className="relative w-14 h-14 flex-shrink-0">
      <Image 
        src={product.imageUrl} 
        alt={product.name} 
        fill 
        className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300">
        {product.name}
      </p>
      <p className="text-sm font-bold text-indigo-600 mt-1">
        {new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR', 
          minimumFractionDigits: 0 
        }).format(Number(product.price))}
      </p>
    </div>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
);

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages([
      { 
        id: 1, 
        text: "Hi! I'm **FASHONGMAN**, your personal shopping assistant. How can I help you find the perfect items today? ✨", 
        sender: 'bot' 
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: trimmedInput, sender: 'user' };
    const newMessages: Message[] = [...messages, userMessage];

    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages }),
      });

      if (!res.ok) throw new Error('Network response was not ok');

      const data: { reply: string; productIds: string[] } = await res.json();

      let recommendedProducts: Product[] = [];
      if (data.productIds && data.productIds.length > 0) {
        const productPromises = data.productIds.map(id =>
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`).then(res => res.json())
        );
        recommendedProducts = await Promise.all(productPromises);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'bot',
        products: recommendedProducts,
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to get response from AI:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again. 😔",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* JENDELA CHAT dengan styling yang lebih menarik */}
      <div className={`fixed bottom-24 right-5 z-40 w-full max-w-sm transition-all duration-500 ease-out transform ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
      }`}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          
          {/* Header dengan gradient */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">FASHONG Assistant</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/80">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List Pesan dengan background pattern */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-3 animate-fadeInUp ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.091z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-md' 
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${
                      msg.sender === 'user' 
                        ? 'prose-invert' 
                        : 'prose-gray'
                    }`}>
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="mb-1 last:mb-0">{children}</p>,
                          strong: ({children}) => <strong className={msg.sender === 'user' ? 'text-yellow-200' : 'text-indigo-600'}>{children}</strong>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                    
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Recommended Products ({msg.products.length})
                        </p>
                        {msg.products.map(p => <ChatProductCard key={p.id} product={p} />)}
                      </div>
                    )}
                  </div>
                  
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-end gap-3 justify-start animate-fadeInUp">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="max-w-xs rounded-2xl px-4 py-3 bg-white text-gray-800 rounded-bl-md border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">FASHONGMAN is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form dengan styling yang lebih menarik */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 py-3 px-4 pr-12 text-gray-700 placeholder-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10l1.105 13.257a2 2 0 01-1.992 2.243H7.887a2 2 0 01-1.992-2.243L7 4z" />
                  </svg>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full p-3 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tombol Floating dengan animasi yang lebih menarik */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-5 right-5 w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'rotate-0' : 'hover:rotate-12'
        }`}
        aria-label="Toggle Chat"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20"></div>
        <div className="relative">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          )}
        </div>
        
        {/* Notification dot untuk pesan baru */}
        {!isOpen && messages.length > 1 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{messages.length - 1}</span>
          </div>
        )}
      </button>

      {/* Tambahkan CSS custom untuk animasi */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        
        .messages-container {
          background-image: radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.03) 1px, transparent 0);
          background-size: 20px 20px;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </>
  );
}