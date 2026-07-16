import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export default function Footer() {
  const { showAlert } = useModal();
  return (
    <footer className="bg-[#08203E] text-white border-t border-[#D4AF37]/20 pt-10 sm:pt-16 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-12">
        {/* Brand Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-serif font-bold text-lg text-[#08203E]">
              S
            </div>
            <div>
              <span className="font-serif font-bold text-2xl tracking-wider block">SAPPHIRE STAYS</span>
              <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] font-semibold uppercase">India's Premier Luxury Collection</span>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
            Founded on the architectural harmony of India's royal palaces and coastal sanctuaries. Every Sapphire property is a beacon for travelers seeking quiet luxury, personal discretion, and bespoke hospitality.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> 24/7 Concierge</span>
            <span>•</span>
            <span>100 Years of Heritage</span>
          </div>
        </div>

        {/* Iconic Indian Branches */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-[#D4AF37]">Global Sanctums</h4>
          <ul className="space-y-1 md:space-y-2 text-sm text-gray-300">
            <li><Link to="/branches/1" className="block py-1 hover:text-white transition">Udaipur Royal Palace</Link></li>
            <li><Link to="/branches/2" className="block py-1 hover:text-white transition">Mumbai Marine Skyline</Link></li>
            <li><Link to="/branches/3" className="block py-1 hover:text-white transition">South Goa Beach Villa</Link></li>
            <li><Link to="/branches/4" className="block py-1 hover:text-white transition">New Delhi Diplomatic</Link></li>
            <li><Link to="/branches/5" className="block py-1 hover:text-white transition">Jaipur Heritage Fort</Link></li>
            <li><Link to="/branches/6" className="block py-1 hover:text-white transition">Munnar Cloud Pavilion</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-[#D4AF37]">Explore</h4>
          <ul className="space-y-1 md:space-y-2 text-sm text-gray-300">
            <li><Link to="/rooms" className="block py-1 hover:text-white transition">Curated Suites</Link></li>
            <li><Link to="/offers" className="block py-1 hover:text-white transition">Seasonal Offers</Link></li>
            <li><Link to="/gallery" className="block py-1 hover:text-white transition">Visual Sanctuary</Link></li>
            <li><Link to="/about" className="block py-1 hover:text-white transition">Our Heritage</Link></li>
            <li><Link to="/contact" className="block py-1 hover:text-white transition">Contact Concierge</Link></li>
          </ul>
        </div>

        {/* Newsletter & Contact */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-[#D4AF37]">The Sapphire Society</h4>
          <p className="text-xs text-gray-300">Receive private invitations to palace unveilings and seasonal Indian retreats.</p>
          <form onSubmit={(e) => { e.preventDefault(); showAlert('Welcome to The Sapphire Society!', 'The Sapphire Society'); }} className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="px-3 py-2.5 rounded-lg bg-[#14355E]/60 border border-[#D4AF37]/30 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
            <button type="submit" className="btn-gold !py-2 text-xs w-full">
              Join Society
            </button>
          </form>
          <div className="pt-2 text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#D4AF37]" /> +91 22 6632 1000</div>
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> concierge@sapphirestays.in</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-3">
        <p>© 2026 Sapphire Stays India Global Hospitality Group. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer">Terms of Service</span>
          <span className="hover:text-white cursor-pointer">GST Compliance</span>
        </div>
      </div>
    </footer>
  );
}
