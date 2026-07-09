import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Search, Sparkles, Compass, RefreshCw, ArrowLeft, Building2 } from 'lucide-react';
import { FALLBACK_BRANCHES } from '../data/fallbackData';

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [allBranches, setAllBranches] = useState([]);
  const [filterCity, setFilterCity] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  // Fetch all branches initially for autocomplete suggestions (with graceful fallback)
  useEffect(() => {
    axios.get('http://localhost:5000/api/branches')
      .then(res => {
        setAllBranches(res.data.branches || FALLBACK_BRANCHES);
      })
      .catch(() => {
        // Silent fallback when live API server is offline during local review
        setAllBranches(FALLBACK_BRANCHES);
      });
  }, []);

  // Fetch filtered branches when filterCity changes (with graceful fallback)
  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/branches${filterCity ? `?city=${encodeURIComponent(filterCity)}` : ''}`)
      .then(res => {
        setBranches(res.data.branches || FALLBACK_BRANCHES);
        setLoading(false);
      })
      .catch(() => {
        // Silent fallback when live API server is offline during local review
        const filtered = filterCity.trim().length > 0
          ? FALLBACK_BRANCHES.filter(b => b.city.toLowerCase().includes(filterCity.trim().toLowerCase()) || b.name.toLowerCase().includes(filterCity.trim().toLowerCase()))
          : FALLBACK_BRANCHES;
        setBranches(filtered);
        setLoading(false);
      });
  }, [filterCity]);

  // Handle outside click to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derived suggestions — always in sync with filterCity, nothing can desync
  const normalizedQuery = filterCity.trim().toLowerCase();

  const suggestions = normalizedQuery.length > 0
    ? allBranches.filter(b => {
        const haystack = `${b.name} ${b.city} ${b.state} ${b.address}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : [];

  const showSuggestions = isSearchFocused && normalizedQuery.length > 0 && suggestions.length > 0;

  const handleSelectSuggestion = (branch) => {
    setFilterCity(branch.city || branch.name);
    setIsSearchFocused(false);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Palaces & Resorts</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">Iconic Indian Sanctuaries</h1>
        <p className="text-gray-500 dark:text-gray-400 text-base">
          From tranquil lakeside royal fortresses in Udaipur to skyline penthouses in Mumbai, explore our signature estate collection.
        </p>

        {/* Search Bar with Real-Time Autocomplete Suggestions */}
        <div className="mt-8 max-w-md mx-auto relative text-left z-30" ref={searchRef}>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by Indian destination (e.g. Udaipur, Mumbai, Goa)..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-[#D4AF37]/40 bg-white dark:bg-[#132135] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-md text-gray-800 dark:text-white placeholder-gray-400"
            />
            {filterCity && (
              <button
                onClick={() => {
                  setFilterCity('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-4 top-3 text-xs text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0B1D3A] rounded-2xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden z-50 animate-fade-in max-h-72 overflow-y-auto">
              <div className="p-2 text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider px-4 border-b border-gray-100 dark:border-gray-800">
                Suggested Indian Destinations
              </div>
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#13284c] cursor-pointer transition flex items-center justify-between border-b last:border-0 border-gray-100 dark:border-gray-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-serif font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.city}, {item.state}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#D4AF37] shrink-0 ml-2">Select →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-serif text-xl">Loading Indian Palaces...</div>
      ) : branches.length === 0 ? (
        <div className="py-16 sm:py-20 max-w-2xl mx-auto text-center glass-card p-8 sm:p-12 rounded-3xl border-2 border-[#D4AF37]/40 shadow-2xl space-y-8 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-[#08203E] text-[#D4AF37] shadow-xl border border-[#D4AF37]">
            <Compass className="w-10 h-10 animate-pulse" />
            <Sparkles className="w-4 h-4 absolute top-2 right-2 text-amber-300" />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3D6E] dark:text-amber-300">
              We're currently not available in this location.
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto font-light">
              We're continuously expanding Sapphire Stays to new royal destinations across India and hope to serve this location soon. Please try searching another destination or explore our signature collection below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => setFilterCity('')}
              className="btn-gold !py-3.5 !px-6 text-xs font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> View All Indian Palaces
            </button>
            <Link
              to="/"
              className="btn-luxury !py-3.5 !px-6 text-xs font-bold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
          </div>
        </div>
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