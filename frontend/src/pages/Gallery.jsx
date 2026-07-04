import React, { useState } from 'react';
import { Sparkles, Eye } from 'lucide-react';

export default function Gallery() {
  const [filter, setFilter] = useState('ALL');
  const [selectedImg, setSelectedImg] = useState(null);

  const categories = ['ALL', 'POOL', 'RESTAURANT', 'ROOMS', 'SPA', 'GYM', 'LOBBY', 'EXTERIOR', 'EVENTS'];

  const images = [
    // POOL
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Lakefront Infinity Pool', desc: 'Overlooking the glistening waters of Lake Pichola at sunset.', cat: 'POOL' },
    { url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', title: 'Illuminated Night Pool Sanctuary', desc: 'Private heated temperature-controlled plunge pool under starry skies.', cat: 'POOL' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', title: 'Tropical Outdoor Luxury Pool', desc: 'Surrounded by royal date palms and private cabanas.', cat: 'POOL' },

    // RESTAURANT
    { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', title: 'Royal Awadhi Fine Dining Room', desc: 'Michelin-celebrated heritage gastronomy under crystal chandeliers.', cat: 'RESTAURANT' },
    { url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80', title: 'Rooftop Seafront Lounge & Bar', desc: 'Panoramic 360-degree views of the Arabian Sea skyline.', cat: 'RESTAURANT' },
    { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80', title: 'Grand Imperial Breakfast Buffet', desc: 'Curated artisanal pastries, champagne breakfast, and organic delicacies.', cat: 'RESTAURANT' },

    // ROOMS
    { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', title: 'Maharaja Master Royal Suite', desc: 'Carved Rajput archways with plush silk furnishings and bespoke bedding.', cat: 'ROOMS' },
    { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', title: 'Presidential Penthouse Sanctuary', desc: 'Expansive private living parlor with wraparound terrace.', cat: 'ROOMS' },
    { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', title: 'Executive Heritage Deluxe Room', desc: 'Handcrafted rosewood furniture and acoustic glass windows.', cat: 'ROOMS' },

    // SPA
    { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', title: 'Sapphire Ayurvedic Wellness Room', desc: 'Holistic rejuvenation therapies with warm organic oils and herbal mist.', cat: 'SPA' },
    { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80', title: 'Private Couple Massage Sanctuary', desc: 'Tranquil stone suites designed for deep nervous system relaxation.', cat: 'SPA' },
    { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80', title: 'Cedarwood Finnish Sauna & Steam', desc: 'Detoxifying thermal suites accompanied by Himalayan rock salt loungers.', cat: 'SPA' },

    // GYM
    { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', title: 'State-of-the-Art Luxury Fitness Center', desc: 'Equipped with Technogym Artis series and personal trainers on call.', cat: 'GYM' },
    { url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80', title: 'Private Yoga & Pilates Pavilion', desc: 'Overlooking private gardens for sunrise meditation and aerial yoga.', cat: 'GYM' },

    // LOBBY
    { url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', title: 'Grand Palace Reception Esplanade', desc: 'Welcome ceremony with rose petal showers and silver thali refreshments.', cat: 'LOBBY' },
    { url: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1200&q=80', title: 'VIP Concierge Waiting Lounge', desc: 'Soaring 30-foot gold-leaf ceilings with bespoke velvet lounge seating.', cat: 'LOBBY' },

    // EXTERIOR
    { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', title: 'Sapphire Palace Illuminated Architecture', desc: 'Centuries of royal Rajput heritage preserved in pristine marble.', cat: 'EXTERIOR' },
    { url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', title: 'Diplomatic Enclave Night Facade', desc: 'Grand driveways designed for executive fleets and Maybach arrivals.', cat: 'EXTERIOR' },

    // EVENTS
    { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80', title: 'Royal Heritage Banquet & Ballroom', desc: 'Pillarless crystal ballroom capable of hosting 1,000 distinguished guests.', cat: 'EVENTS' },
    { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80', title: 'Palatial Lakeside Wedding Mandap', desc: 'Bespoke floral architecture and royal processions by the waterfront.', cat: 'EVENTS' },
    { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', title: 'Executive Summit Conference Hall', desc: 'Equipped with 4K holographic displays and encrypted translation suites.', cat: 'EVENTS' }
  ];

  const filtered = filter === 'ALL' ? images : images.filter(img => img.cat === filter);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 overflow-x-hidden">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Visual Sanctuary</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">The Sapphire Gallery</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Immerse yourself in our curated photographic collection representing every facet of 5-star Indian hospitality.
        </p>
        
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 pt-6">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition duration-300 ${
                filter === c 
                  ? 'bg-[#08203E] text-[#D4AF37] border-2 border-[#D4AF37] shadow-lg scale-105' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {c === 'ALL' ? 'All Collection' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((img, idx) => (
          <div 
            key={idx} 
            onClick={() => setSelectedImg(img)}
            className="group relative h-80 rounded-3xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 cursor-pointer bg-[#051329]"
          >
            <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#08203E]/80 backdrop-blur-md text-[#D4AF37] font-bold text-[10px] uppercase tracking-wider border border-[#D4AF37]/30">
              {img.cat}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#08203E] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xl font-bold text-white">{img.title}</h4>
                  <Eye className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{img.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div 
          onClick={() => setSelectedImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
        >
          <div className="max-w-4xl w-full rounded-3xl overflow-hidden bg-[#08203E] border-2 border-[#D4AF37] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <img src={selectedImg.url} alt={selectedImg.title} className="w-full max-h-[70vh] object-cover" />
            <div className="p-6 text-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
                  {selectedImg.cat}
                </span>
                <button onClick={() => setSelectedImg(null)} className="text-sm font-bold text-amber-400 hover:underline">
                  Close ✕
                </button>
              </div>
              <h3 className="font-serif text-2xl font-bold">{selectedImg.title}</h3>
              <p className="text-sm text-gray-300">{selectedImg.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
