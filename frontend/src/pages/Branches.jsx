import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Search } from 'lucide-react';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [filterCity, setFilterCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/branches${filterCity ? `?city=${filterCity}` : ''}`)
      .then(res => {
        setBranches(res.data.branches || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [filterCity]);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Palaces & Resorts</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">Iconic Indian Sanctuaries</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          From tranquil lakeside royal fortresses in Udaipur to skyline penthouses in Mumbai, explore our signature estate collection.
        </p>

        {/* Filter Bar */}
        <div className="mt-8 max-w-md mx-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by Indian destination (e.g. Udaipur, Mumbai, Goa)..."
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-[#D4AF37]/40 bg-white dark:bg-[#132135] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-serif text-xl">Loading Indian Palaces...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.map(b => (
            <div key={b.id} className="glass-card overflow-hidden rounded-2xl flex flex-col justify-between border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition">
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img src={b.hero_image} alt={b.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {b.rating}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> {b.city}, {b.state}
                  </div>
                  <h3 className="font-serif text-2xl font-bold">{b.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{b.description}</p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50 mt-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Starting From</span>
                  <span className="font-serif font-bold text-lg text-[#0F3D6E] dark:text-amber-300">₹{Number(b.starting_price).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400"> / night</span>
                </div>
                <Link to={`/branches/${b.id}`} className="btn-luxury !py-2.5 !px-5 text-xs">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
