import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, MapPin, Calendar, Users, Star, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import GuestSelector from '../components/GuestSelector';
import { FALLBACK_BRANCHES } from '../data/fallbackData';

export default function Home() {
  const [branches, setBranches] = useState([]);
  const [searchDestination, setSearchDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkIn, setCheckIn] = useState('2026-07-15');
  const [checkOut, setCheckOut] = useState('2026-07-18');
  const [guests, setGuests] = useState('2 Adults, 0 Children');
  const navigate = useNavigate();
  const destRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/branches')
      .then(res => setBranches(res.data.branches || FALLBACK_BRANCHES))
      .catch(() => {
        // Silent fallback when live API server is offline during local review
        setBranches(FALLBACK_BRANCHES);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDestChange = (e) => {
    const val = e.target.value;
    setSearchDestination(val);
    if (val.trim().length > 0) {
      const lower = val.toLowerCase();
      const matched = branches.filter(b =>
        (b.city || '').toLowerCase().includes(lower) ||
        (b.name || '').toLowerCase().includes(lower) ||
        (b.state || '').toLowerCase().includes(lower)
      );
      setSuggestions(matched);
      setShowSuggestions(true);
    } else {
      setSuggestions(branches);
      setShowSuggestions(true);
    }
  };

  const handleSelectDest = (val) => {
    setSearchDestination(val);
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/rooms?city=${encodeURIComponent(searchDestination)}&checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Luxury Hero Section matching reference design */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div 
            className="w-full h-full bg-cover bg-center scale-105 transition-transform duration-[10s]"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=2000&q=85')` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#08203E]/80 via-[#08203E]/60 to-[#08203E]/95 z-10" />

        <div className="relative z-20 max-w-5xl mx-auto space-y-6 pt-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-widest uppercase shadow-md">
            <Sparkles className="w-3.5 h-3.5" /> Royal Indian Hospitality
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight leading-tight drop-shadow-lg">
            The Art of Timeless Retreats
          </h1>
          <p className="text-gray-200 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed drop-shadow">
            Discover curated palaces and coastal sanctuaries across India where centuries of Rajput grandeur meet unparalleled contemporary luxury.
          </p>

          {/* Floating Search Box (Check In - Check Out Details Filling Box) styled explicitly to look luxury rich midnight sapphire in both light & dark mode */}
          <form 
            onSubmit={handleSearch} 
            className="mt-12 p-4 md:p-5 rounded-3xl max-w-4xl mx-auto shadow-2xl border-2 border-[#D4AF37]/50 bg-[#051224] text-white grid grid-cols-1 md:grid-cols-4 gap-4 text-left relative z-30"
          >
            {/* Destination Autocomplete */}
            <div className="p-3.5 rounded-2xl bg-[#0B1D3A] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition flex flex-col justify-center relative z-50" ref={destRef}>
              <label className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Destination
              </label>
              <input
                type="text"
                placeholder="All India Sanctuaries..."
                value={searchDestination}
                onChange={handleDestChange}
                onFocus={() => {
                  setSuggestions(searchDestination.trim() ? branches.filter(b => (b.city||'').toLowerCase().includes(searchDestination.toLowerCase()) || (b.name||'').toLowerCase().includes(searchDestination.toLowerCase())) : branches);
                  setShowSuggestions(true);
                }}
                className="bg-transparent text-white text-sm font-semibold focus:outline-none w-full placeholder-gray-400"
              />
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0B1D3A] rounded-2xl border border-[#D4AF37]/50 shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => handleSelectDest('')}
                    className="px-4 py-2.5 hover:bg-[#13284c] cursor-pointer text-xs font-bold text-[#D4AF37] border-b border-gray-800 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> All India Sanctuaries
                  </div>
                  {suggestions.map(b => (
                    <div
                      key={b.id}
                      onClick={() => handleSelectDest(b.city)}
                      className="px-4 py-2.5 hover:bg-[#13284c] cursor-pointer text-xs transition border-b last:border-0 border-gray-800/50 flex flex-col"
                    >
                      <span className="font-bold text-white">{b.name}</span>
                      <span className="text-[10px] text-gray-400">{b.city}, {b.state}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Check In / Out Dates Box */}
            <div className="p-3.5 rounded-2xl bg-[#0B1D3A] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition flex flex-col justify-center min-w-0">
              <label className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" /> Check In — Out
              </label>
              <div className="flex items-center justify-between gap-1 text-white text-xs font-semibold w-full">
                <input 
                  type="date" 
                  value={checkIn} 
                  onChange={(e) => setCheckIn(e.target.value)} 
                  style={{ colorScheme: 'dark' }}
                  className="bg-transparent focus:outline-none min-w-0 w-full max-w-[125px] text-white font-mono cursor-pointer text-xs" 
                />
                <span className="text-[#D4AF37] shrink-0">→</span>
                <input 
                  type="date" 
                  value={checkOut} 
                  onChange={(e) => setCheckOut(e.target.value)} 
                  style={{ colorScheme: 'dark' }}
                  className="bg-transparent focus:outline-none min-w-0 w-full max-w-[125px] text-white font-mono cursor-pointer text-xs text-right sm:text-left" 
                />
              </div>
            </div>

            {/* Guests Selection */}
            <div className="p-3.5 rounded-2xl bg-[#0B1D3A] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition flex flex-col justify-center relative z-50">
              <label className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Guests
              </label>
              <GuestSelector value={guests} onChange={(val) => setGuests(val)} />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-gold !rounded-2xl !py-4 flex items-center justify-center gap-2 text-sm font-bold shadow-xl hover:scale-[1.02] transition">
              <span>Reserve Stay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Global Sanctums Grid matching Reference Screenshot 3 */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Our Collection</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mt-2">Global Sanctums of Light</h2>
          </div>
          <Link to="/branches" className="mt-4 md:mt-0 text-sm font-semibold text-[#0F3D6E] dark:text-[#D4AF37] flex items-center gap-2 hover:translate-x-1 transition">
            View All Indian Palaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branches.slice(0, 3).map((b, idx) => (
            <Link key={b.id} to={`/branches/${b.id}`} className="group relative overflow-hidden rounded-2xl glass-card border border-gray-200/60 dark:border-gray-800 transition hover:-translate-y-2 shadow-lg">
              <div className="relative h-80 overflow-hidden">
                <img src={b.hero_image} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  {idx === 0 ? 'Royal Heritage' : idx === 1 ? 'Seafront Horizon' : 'Private Villa'}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-2xl font-bold group-hover:text-[#D4AF37] transition">{b.name}</h3>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {b.rating}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{b.description}</p>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-semibold block">Starting From</span>
                    <span className="font-serif font-bold text-lg text-[#0F3D6E] dark:text-amber-300">₹{Number(b.starting_price).toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium"> / night</span>
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1">Explore Sanctuary →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Heritage Banner */}
      <section className="bg-[#08203E] text-white py-24 my-12 border-y border-[#D4AF37]/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#D4AF37]/30">
            <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80" alt="Concierge" className="w-full h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08203E] via-transparent to-transparent opacity-60" />
          </div>
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Our Heritage</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">A Century of Enlightened Indian Hospitality</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              We believe that hospitality is the ultimate art form. Every Sapphire property is designed to capture the unique luminosity of its Indian location—from the glistening silver reflections of Lake Pichola to the sunset hues over Marine Drive.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
              <div>
                <span className="font-serif text-4xl font-bold text-[#D4AF37]">06</span>
                <span className="block text-xs uppercase text-gray-400 mt-1">Iconic Indian Palaces</span>
              </div>
              <div>
                <span className="font-serif text-4xl font-bold text-[#D4AF37]">100</span>
                <span className="block text-xs uppercase text-gray-400 mt-1">Years of Royal Service</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
