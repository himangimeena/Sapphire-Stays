import React, { useState } from 'react';

export default function Gallery() {
  const [filter, setFilter] = useState('ALL');

  const images = [
    { url: 'https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=800&q=80', title: 'Udaipur Palace Courtyard', cat: 'EXTERIOR' },
    { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', title: 'Maharaja Master Bedroom', cat: 'ROOMS' },
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', title: 'Ayurvedic Infinity Pool', cat: 'POOL' },
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', title: 'Heritage Michelin Dining', cat: 'RESTAURANT' },
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', title: 'Mumbai Seafront Promenade', cat: 'EXTERIOR' },
    { url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', title: 'Goa Private Beach Villa', cat: 'VILLAS' },
  ];

  const filtered = filter === 'ALL' ? images : images.filter(img => img.cat === filter);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Visual Sanctuary</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">The Sapphire Gallery</h1>
        
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['ALL', 'ROOMS', 'EXTERIOR', 'POOL', 'RESTAURANT', 'VILLAS'].map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                filter === c ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((img, idx) => (
          <div key={idx} className="group relative h-80 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
              <div>
                <span className="text-[10px] uppercase text-[#D4AF37] font-bold block">{img.cat}</span>
                <h4 className="font-serif text-xl font-bold text-white">{img.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
