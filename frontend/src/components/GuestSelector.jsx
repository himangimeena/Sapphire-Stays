import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Minus, Check } from 'lucide-react';

export default function GuestSelector({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const popoverRef = useRef(null);

  // Parse initial value if possible
  useEffect(() => {
    if (typeof value === 'string') {
      const aMatch = value.match(/(\d+)\s*Adult/i);
      const cMatch = value.match(/(\d+)\s*Child/i);
      if (aMatch) setAdults(Math.max(1, Math.min(20, parseInt(aMatch[1], 10))));
      if (cMatch) setChildren(Math.max(0, Math.min(10, parseInt(cMatch[1], 10))));
    }
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateGuests = (newAdults, newChildren) => {
    const validA = Math.max(1, Math.min(20, isNaN(newAdults) ? 1 : Math.floor(newAdults)));
    const validC = Math.max(0, Math.min(10, isNaN(newChildren) ? 0 : Math.floor(newChildren)));
    setAdults(validA);
    setChildren(validC);
    const str = `${validA} ${validA === 1 ? 'Adult' : 'Adults'}, ${validC} ${validC === 1 ? 'Child' : 'Children'}`;
    onChange(str);
  };

  const handleAdultInput = (e) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (!isNaN(val)) {
      updateGuests(val, children);
    } else {
      updateGuests(1, children);
    }
  };

  const handleChildInput = (e) => {
    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (!isNaN(val)) {
      updateGuests(adults, val);
    } else {
      updateGuests(0, children);
    }
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
          <span>{adults} {adults === 1 ? 'Adult' : 'Adults'}, {children} {children === 1 ? 'Child' : 'Children'}</span>
        </span>
        <span className="text-[10px] text-[#D4AF37] font-bold uppercase ml-1 shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 sm:left-0 top-full mt-3 z-50 w-[290px] sm:w-[340px] p-5 rounded-2xl bg-[#08203E] border-2 border-[#D4AF37] shadow-2xl space-y-5 text-white animate-fade-in">
          {/* Adults Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block">Adults</span>
                <span className="text-[10px] text-gray-400">Ages 12+ (Max 20)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateGuests(adults - 1, children)}
                  disabled={adults <= 1}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={adults}
                  onChange={handleAdultInput}
                  className="w-12 py-1 px-1 text-center bg-[#051329] border border-[#D4AF37]/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => updateGuests(adults + 1, children)}
                  disabled={adults >= 20}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
            {/* Quick Select Pills */}
            <div className="flex gap-1.5 pt-1">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateGuests(num, children)}
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold block">Children</span>
                <span className="text-[10px] text-gray-400">Ages 0–11 (Max 10)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateGuests(adults, children - 1)}
                  disabled={children <= 0}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={handleChildInput}
                  className="w-12 py-1 px-1 text-center bg-[#051329] border border-[#D4AF37]/50 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => updateGuests(adults, children + 1)}
                  disabled={children >= 10}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center font-bold text-xs"
                >
                  +
                </button>
              </div>
            </div>
            {/* Quick Select Pills */}
            <div className="flex gap-1.5 pt-1">
              {[0, 1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateGuests(adults, num)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition ${
                    children === num ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-white/5 hover:bg-white/10 text-gray-300'
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
            className="w-full btn-gold !py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Apply Royal Guests
          </button>
        </div>
      )}
    </div>
  );
}
