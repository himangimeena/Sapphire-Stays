import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function Contact() {
  const { showAlert } = useModal();
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Private Concierge</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">Contact Our India Desk</h1>
        <p className="text-gray-500 text-base">
          Whether arranging private charter flights to Udaipur or custom wedding banquets in Jaipur, our concierge is at your service 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-card p-8 rounded-2xl border border-[#D4AF37]/30 space-y-6">
          <h3 className="font-serif text-2xl font-bold">Direct Inquiry Form</h3>
          <form onSubmit={e => { e.preventDefault(); showAlert('Your message has been dispatched to our India Senior Concierge.', 'Concierge Services'); }} className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Your Name</label>
              <input type="text" required placeholder="Julian Thorne" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Email Address</label>
              <input type="email" required placeholder="julian@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Select Sanctuary Branch</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]">
                <option>Sapphire Palace Udaipur</option>
                <option>Sapphire Grand Colaba Mumbai</option>
                <option>Sapphire Serenity South Goa</option>
                <option>Sapphire Imperial New Delhi</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Inquiry / Bespoke Request</label>
              <textarea rows={4} required placeholder="Detail your preferences..." className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <button type="submit" className="btn-gold !py-3.5 text-xs w-full flex items-center justify-center gap-2">
              <span>Dispatch Inquiry</span> <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h4 className="font-serif text-xl font-bold text-[#0F3D6E] dark:text-amber-300">Headquarters – India Executive Office</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#D4AF37]" /> Nariman Point Executive Enclave, Mumbai 400021</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#D4AF37]" /> +91 22 6632 1000 / Toll Free: 1800-SAPPHIRE-IN</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#D4AF37]" /> concierge@sapphirestays.in</p>
            </div>
          </div>

          <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden relative flex items-center justify-center border border-gray-300 dark:border-gray-700 shadow-xl"
               style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60')`, backgroundSize: 'cover' }}>
            <div className="p-4 bg-[#08203E] rounded-xl shadow-2xl text-amber-400 text-xs font-bold text-center">
              📍 Sapphire Stays India Hub — Mumbai
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
