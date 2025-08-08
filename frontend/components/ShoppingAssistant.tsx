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
  <Link href={`/products/${product.id}`} target="_blank" className=" mt-2 p-2 border rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors">
    <div className="relative w-12 h-12 flex-shrink-0">
      <Image src={product.imageUrl} alt={product.name} fill className="object-cover rounded-md" />
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
      <p className="text-sm text-indigo-600">
        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(product.price))}
      </p>
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
      { id: 1, text: "Hi! I'm FASHONGMAN, your personal shopping assistant. How can I help you ?", sender: 'bot' }
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
        // --- PERBAIKAN DI SINI ---
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
      // Ganti setMessages di sini agar tidak duplikat pesan pengguna
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to get response from AI:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
      };
      // Ganti setMessages di sini agar tidak duplikat pesan pengguna
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* JENDELA CHAT (UI tidak berubah banyak) */}
      <div className={`fixed bottom-24 right-5 z-40 w-full max-w-sm rounded-xl bg-white shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <h3 className="text-lg font-semibold">FASHONG Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </button>
        </div>

        {/* List Pesan dengan Rendering BARU */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                {/* --- PERUBAHAN UTAMA DI SINI --- */}
                <div className="prose prose-sm">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-2 border-t pt-2">
                    {msg.products.map(p => <ChatProductCard key={p.id} product={p} />)}
                  </div>
                )}
                {/* ----------------------------- */}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="max-w-xs rounded-2xl px-4 py-2 bg-gray-200 text-gray-800 rounded-bl-none">
                <p className="text-sm animate-pulse">FASHONGMAN is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="w-full rounded-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-black"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* --- TOMBOL FLOATING --- */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-indigo-700 transition-transform duration-300 transform hover:scale-110"
        aria-label="Toggle Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </button>
    </>
  );
}