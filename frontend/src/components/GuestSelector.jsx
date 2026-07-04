import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Minus, Check, Building2 } from 'lucide-react';

export default function GuestSelector({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (typeof value === 'string') {
      const aMatch = value.match(/(\d+)\s*Adult/i);
      const cMatch = value.match(/(\d+)\s*Child/i);
      const rMatch = value.match(/(\d+)\s*Room/i);
      if (aMatch) setAdults(Math.max(1, Math.min(20, parseInt(aMatch[1], 10))));
      if (cMatch) setChildren(Math.max(0, Math.min(10, parseInt(cMatch[1], 10))));
      if (rMatch) setRooms(Math.max(1, Math.min(10, parseInt(rMatch[1], 10))));
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

  const updateAll = (newA, newC, newR) => {
    const validA = Math.max(1, Math.min(20, isNaN(newA) ? 1 : Math.floor(newA)));
    const validC = Math.max(0, Math.min(10, isNaN(newC) ? 0 : Math.floor(newC)));
    const validR = Math.max(1, Math.min(10, isNaN(newR) ? 1 : Math.floor(newR)));
    setAdults(validA);
    setChildren(validC);
    setRooms(validR);
    const totalG = validA + validC;
    const str = `${validA} ${validA === 1 ? 'Adult' : 'Adults'}, ${validC} ${validC === 1 ? 'Child' : 'Children'} • ${validR} ${validR === 1 ? 'Room' : 'Rooms'}`;
    if (onChange) onChange(str, { adults: validA, children: validC, rooms: validR, totalGuests: totalG });
  };

  const handleInput = (type, rawValue) => {
    const val = parseInt(rawValue.replace(/\D/g, ''), 10);
    if (type === 'adults') updateAll(!isNaN(val) ? val : 1, children, rooms);
    if (type === 'children') updateAll(adults, !isNaN(val) ? val : 0, rooms);
    if (type === 'rooms') updateAll(adults, children, !isNaN(val) ? val : 1);
  };

  const totalGuests = adults + children;

  return (
    <div className="relative w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-left focus:outline-none ${className || ''}`}
      >
        <span className="text-white text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
          <Users className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="truncate">{adults}A, {children}C • {rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
        </span>
        <span className="text-[10px] text-[#D4AF37] font-bold uppercase ml-1 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-3 z-50 w-[300px] sm:w-[360px] p-5 rounded-2xl bg-[#08203E] border-2 border-[#D4AF37] shadow-2xl space-y-4 text-white animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">Royal Occupancy</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded font-mono">Total: {totalGuests} Guests</span>
          </div>

          {/* Adults Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block">Adults</span>
                <span className="text-[10px] text-gray-400">Ages 12+ (Max 20)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateAll(adults - 1, children, rooms)}
                  disabled={adults <= 1}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={adults}
                  onChange={(e) => handleInput('adults', e.target.value)}
                  className="w-12 py-1 px-1 text-center bg-[#051329] border border-[#D4AF37]/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => updateAll(adults + 1, children, rooms)}
                  disabled={adults >= 20}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateAll(num, children, rooms)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    adults === num ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Children Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block">Children</span>
                <span className="text-[10px] text-gray-400">Ages 0–11 (Max 10)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateAll(adults, children - 1, rooms)}
                  disabled={children <= 0}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => handleInput('children', e.target.value)}
                  className="w-12 py-1 px-1 text-center bg-[#051329] border border-[#D4AF37]/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => updateAll(adults, children + 1, rooms)}
                  disabled={children >= 10}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateAll(adults, num, rooms)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    children === num ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Rooms Section */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block">Suites / Rooms</span>
                <span className="text-[10px] text-gray-400">Required accommodation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateAll(adults, children, rooms - 1)}
                  disabled={rooms <= 1}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rooms}
                  onChange={(e) => handleInput('rooms', e.target.value)}
                  className="w-12 py-1 px-1 text-center bg-[#051329] border border-[#D4AF37]/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => updateAll(adults, children, rooms + 1)}
                  disabled={rooms >= 10}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateAll(adults, children, num)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    rooms === num ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full btn-gold !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg mt-2"
          >
            <Check className="w-4 h-4" /> Apply ({totalGuests} Guests • {rooms} {rooms === 1 ? 'Room' : 'Rooms'})
          </button>
        </div>
      )}
    </div>
  );
}
