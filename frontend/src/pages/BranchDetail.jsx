import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, Sparkles, Wifi, Utensils, Car, Shield, CheckCircle } from 'lucide-react';
import { FALLBACK_BRANCHES } from '../data/fallbackData';
import { getRoomImage } from '../utils/roomImage';

export default function BranchDetail() {
  const { id } = useParams();
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/branches/${id}`)
      .then(res => {
        setBranch(res.data.branch);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        const fallback = FALLBACK_BRANCHES.find(b => Number(b.id) === Number(id));
        if (fallback) {
          setBranch(fallback);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="py-24 text-center font-serif text-2xl">Loading Sanctuary Details...</div>;
  if (!branch) return <div className="py-24 text-center font-serif text-2xl">Sanctuary not found.</div>;

  return (
    <div className="py-8 sm:py-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
      {/* Header matching Screenshot 4 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
          <span>Palaces</span> <span>›</span> <span>{branch.city}, {branch.state}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold">{branch.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base leading-relaxed">
          {branch.description}
        </p>
      </div>

      {/* Large Image Gallery matching Screenshot 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <div className="md:col-span-2 h-[260px] sm:h-[450px]">
          <img src={branch.hero_image} alt={branch.name} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
        </div>
        <div className="hidden md:grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-2 sm:gap-4 h-[130px] md:h-[450px]">
          <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" alt="Palace Heritage" className="w-full h-full object-cover rounded-xl" />
          <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80" alt="Spa Pool" className="w-full h-full object-cover rounded-xl" />
        </div>
      </div>

      {/* Overview & Map Grid matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-serif text-3xl font-bold">The {branch.city} Sanctuary</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            Experience the quintessence of Indian heritage grandeur. {branch.name} occupies a meticulously restored heritage palace building, seamlessly blending royal architectural splendor with state-of-the-art 21st-century wellness amenities.
          </p>

          <div>
            <h3 className="font-serif text-xl font-bold mb-4 text-[#0F3D6E] dark:text-amber-300">Premium Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(branch.amenities || []).map(am => (
                <div key={am.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 flex items-center gap-2 sm:gap-3 text-xs font-semibold min-w-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span className="truncate">{am.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Map Simulation Box matching Screenshot 4 */}
        <div className="glass-card p-6 rounded-2xl border border-[#D4AF37]/30 space-y-4">
          <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-800 overflow-hidden relative flex items-center justify-center border border-gray-300 dark:border-gray-700"
               style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=60')`, backgroundSize: 'cover' }}>
            <div className="p-3 bg-[#08203E] rounded-full shadow-xl text-amber-400 animate-bounce">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D4AF37]">Palace Location</span>
            <p className="text-sm font-semibold mt-1">{branch.address}</p>
            <p className="text-xs text-gray-500 mt-1">Direct Helipad / VIP Chauffeur pickup available</p>
          </div>
        </div>
      </div>

      {/* Curated Accommodations matching Screenshot 4 */}
      <div className="space-y-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Curated Accommodations</h2>
          <p className="text-xs md:text-sm text-gray-500">Select from our range of meticulously designed royal suites and villas, offering a unique perspective of {branch.city}.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {(branch.roomTypes || []).map(rt => (
            <div key={rt.id} className="glass-card overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={getRoomImage({ ...rt, branch_city: branch.city, branch_name: branch.name })} alt={rt.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#D4AF37] text-[#08203E] font-bold text-[10px] uppercase tracking-wider">
                    {rt.tier}
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  <h3 className="font-serif text-lg sm:text-xl font-bold">{rt.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{rt.description}</p>
                  <div className="text-xs text-gray-400 pt-2 flex items-center gap-4">
                    <span>📐 {rt.size_sqm} sqm</span>
                    <span>🛏️ {rt.bed_type}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50 mt-2 sm:mt-4">
                <div>
                  <span className="font-serif font-bold text-base sm:text-lg text-[#0F3D6E] dark:text-amber-300">₹{Number(rt.base_price).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400"> / night</span>
                </div>
                <Link to={`/checkout?roomTypeId=${rt.id}&branchId=${branch.id}`} className="btn-luxury !py-2 !px-3.5 sm:!px-4 text-xs shrink-0">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
