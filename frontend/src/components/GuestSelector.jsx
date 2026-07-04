import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Minus } from 'lucide-react';

// Custom inline Paw Print SVG matching the exact reference design
const PawIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Main pad */}
    <path d="M12 13.5C9.5 13.5 7.5 15.5 7.5 18C7.5 20.2 9.5 21.5 12 21.5C14.5 21.5 16.5 20.2 16.5 18C16.5 15.5 14.5 13.5 12 13.5Z" />
    {/* Toe 1 (far left) */}
    <circle cx="6.5" cy="11.5" r="2.2" />
    {/* Toe 2 (inner left) */}
    <circle cx="9.5" cy="8" r="2.2" />
    {/* Toe 3 (inner right) */}
    <circle cx="14.5" cy="8" r="2.2" />
    {/* Toe 4 (far right) */}
    <circle cx="17.5" cy="11.5" r="2.2" />
  </svg>
);

export default function GuestSelector({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [travelingWithPets, setTravelingWithPets] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (typeof value === 'string') {
      const aMatch = value.match(/(\d+)\s*Adult/i);
      const cMatch = value.match(/(\d+)\s*Child/i);
      const rMatch = value.match(/(\d+)\s*Room/i);
      if (aMatch) setAdults(Math.max(1, Math.min(20, parseInt(aMatch[1], 10))));
      if (cMatch) setChildren(Math.max(0, Math.min(10, parseInt(cMatch[1], 10))));
      if (rMatch) setRooms(Math.max(1, Math.min(10, parseInt(rMatch[1], 10))));
      if (value.includes('Pets') || value.includes('🐾')) setTravelingWithPets(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateAll = (newA, newC, newR, newPets) => {
    const validA = Math.max(1, Math.min(20, isNaN(newA) ? 1 : Math.floor(newA)));
    const validC = Math.max(0, Math.min(10, isNaN(newC) ? 0 : Math.floor(newC)));
    const validR = Math.max(1, Math.min(10, isNaN(newR) ? 1 : Math.floor(newR)));
    const validPets = typeof newPets === 'boolean' ? newPets : travelingWithPets;

    setAdults(validA);
    setChildren(validC);
    setRooms(validR);
    setTravelingWithPets(validPets);

    const totalG = validA + validC;
    const str = `${validA} ${validA === 1 ? 'Adult' : 'Adults'}, ${validC} ${validC === 1 ? 'Child' : 'Children'} • ${validR} ${validR === 1 ? 'Room' : 'Rooms'}${validPets ? ' • 🐾 Pets' : ''}`;
    if (onChange) onChange(str, { adults: validA, children: validC, rooms: validR, totalGuests: totalG, travelingWithPets: validPets });
  };

  return (
    <div className="relative w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-left focus:outline-none ${className || ''}`}
      >
        <span className="text-white text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
          <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="truncate">
            {adults}A, {children}C • {rooms} {rooms === 1 ? 'Room' : 'Rooms'}{travelingWithPets ? ' • 🐾' : ''}
          </span>
        </span>
        <span className="text-[10px] text-[#D4AF37] font-bold uppercase ml-1 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 z-[100] w-[320px] sm:w-[440px] p-6 rounded-2xl bg-[#0B1D3A] border border-[#D4AF37]/50 shadow-2xl space-y-5 text-white animate-fade-in max-h-[85vh] overflow-y-auto">
          
          {/* Room Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-white">Room</span>
            <div className="flex items-center border border-[#D4AF37]/40 rounded-xl p-1 bg-[#08172E] shadow-inner">
              <button
                type="button"
                onClick={() => updateAll(adults, children, rooms - 1, travelingWithPets)}
                disabled={rooms <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-white text-base font-mono">{rooms}</span>
              <button
                type="button"
                onClick={() => updateAll(adults, children, rooms + 1, travelingWithPets)}
                disabled={rooms >= 10}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Adults Row */}
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base font-bold text-white">Adults</span>
            <div className="flex items-center border border-[#D4AF37]/40 rounded-xl p-1 bg-[#08172E] shadow-inner">
              <button
                type="button"
                onClick={() => updateAll(adults - 1, children, rooms, travelingWithPets)}
                disabled={adults <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-white text-base font-mono">{adults}</span>
              <button
                type="button"
                onClick={() => updateAll(adults + 1, children, rooms, travelingWithPets)}
                disabled={adults >= 20}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-base font-bold text-white block">Children</span>
              <span className="text-xs text-gray-400 font-normal">0 - 17 Years Old</span>
            </div>
            <div className="flex items-center border border-[#D4AF37]/40 rounded-xl p-1 bg-[#08172E] shadow-inner">
              <button
                type="button"
                onClick={() => updateAll(adults, children - 1, rooms, travelingWithPets)}
                disabled={children <= 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-white text-base font-mono">{children}</span>
              <button
                type="button"
                onClick={() => updateAll(adults, children + 1, rooms, travelingWithPets)}
                disabled={children >= 10}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white font-bold transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Explanatory Text */}
          <p className="text-xs text-gray-300 pt-1 leading-relaxed font-normal">
            Please provide right number of children along with their right age for best options and prices.
          </p>

          {/* Divider */}
          <div className="border-t border-[#D4AF37]/20 my-4" />

          {/* Traveling with Pets Card */}
          <div className="border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 bg-[#08172E]/80">
            <label className="flex items-start gap-3.5 cursor-pointer min-w-0">
              <input
                type="checkbox"
                checked={travelingWithPets}
                onChange={(e) => {
                  const val = e.target.checked;
                  setTravelingWithPets(val);
                  updateAll(adults, children, rooms, val);
                }}
                className="w-5 h-5 rounded border-[#D4AF37]/50 bg-[#051329] text-[#0B63E5] focus:ring-[#0B63E5] cursor-pointer shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <span className="text-sm font-bold text-white block">Are you travelling with pets?</span>
                <span className="text-xs text-gray-300 leading-relaxed mt-1 block">
                  Selecting this option will show only pet-friendly properties. Please review the pet policies & applicable fees, if any.
                </span>
              </div>
            </label>
            <PawIcon className="w-9 h-9 text-[#D4AF37]/60 shrink-0 ml-2" />
          </div>

          {/* Apply Button Footer */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                updateAll(adults, children, rooms, travelingWithPets);
                setOpen(false);
              }}
              className="bg-[#0B63E5] hover:bg-[#0952C2] text-white font-bold text-sm px-8 py-3 rounded-full shadow-lg transition transform active:scale-95 tracking-wide"
            >
              APPLY
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
