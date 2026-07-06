import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Filter, CheckCircle, MapPin, Sparkles, Compass, ArrowLeft, RefreshCw } from 'lucide-react';

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city') || '';
  const couponParam = searchParams.get('coupon') || '';
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/rooms/types')
      .then(res => {
        setRoomTypes(res.data.roomTypes || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const cleanCityParam = (cityParam || '').trim().toLowerCase();
  const isAllIndia = cleanCityParam === '' || cleanCityParam.includes('all india') || cleanCityParam === 'india';

  const filteredByCity = !isAllIndia
    ? roomTypes.filter(r => 
        (r.branch_name || '').toLowerCase().includes(cleanCityParam) || 
        (r.branch_city || '').toLowerCase().includes(cleanCityParam) || 
        (r.branch_state || '').toLowerCase().includes(cleanCityParam) ||
        (r.city || '').toLowerCase().includes(cleanCityParam)
      )
    : roomTypes;

  const filtered = selectedTier === 'ALL'
    ? filteredByCity
    : filteredByCity.filter(r => r.tier === selectedTier);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 overflow-x-hidden">
      {/* Header matching Screenshot 2 */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Accommodations</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold">
            {cityParam ? `Sanctuaries in ${cityParam}` : 'Discover Sanctuary'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-2xl">
            Refined escapes across India's most breathtaking locations. Find the Sapphire experience that speaks to your royal taste.
          </p>
        </div>

        {/* Tier Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'Essential Luxury', 'Most Popular', 'The Signature'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedTier(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                selectedTier === t
                  ? 'bg-[#08203E] text-[#D4AF37] border border-[#D4AF37]'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {t === 'ALL' ? 'All Curated Suites' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Privilege Activated Banner when coming from Offers */}
      {couponParam && (
        <div className="p-6 rounded-2xl bg-[#08203E] border-2 border-[#D4AF37] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block">Privilege Activated</span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                Promo Code: <span className="text-amber-300 font-mono tracking-wider">{couponParam}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light mt-0.5">
                Your exclusive seasonal benefit will be automatically applied during checkout reservation.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold px-4 py-2.5 rounded-full bg-[#D4AF37] text-[#08203E] uppercase tracking-wider shrink-0 shadow-lg">
            ✓ VIP Offer Applied
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 font-serif text-xl">Loading Sanctuary Suites...</div>
      ) : filtered.length === 0 ? (
        /* Professional Luxury Empty State matching Requirement 5 */
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
              We're continuously expanding Sapphire Stays to new destinations across India and hope to serve this location soon. Please try searching another destination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/rooms')}
              className="btn-gold !py-3.5 !px-6 text-xs font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> View All India Sanctuaries
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(rt => (
            <div key={rt.id} className="glass-card overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-lg">
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80" alt={rt.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.95
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 rounded bg-[#08203E]/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                    {rt.branch_name || 'India Collection'}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-serif text-2xl font-bold">{rt.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{rt.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 pt-2">
                    <span className="flex items-center gap-1">✨ {rt.size_sqm} sqm suite</span>
                    <span className="flex items-center gap-1">👥 Up to {rt.capacity_adults} Guests</span>
                    <span className="flex items-center gap-1">🛏️ {rt.bed_type}</span>
                    <span className="flex items-center gap-1">☕ Royal Breakfast</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 dark:border-gray-800/50 mt-4">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase block">Nightly Rate</span>
                  <span className="font-serif font-bold text-xl text-[#0F3D6E] dark:text-amber-300">₹{Number(rt.base_price).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400"> + GST</span>
                </div>
                <Link to={`/checkout?roomTypeId=${rt.id}&branchId=${rt.branch_id}${couponParam ? `&coupon=${couponParam}` : ''}`} className="btn-luxury !py-2.5 !px-5 text-xs">
                  Reserve Suite
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
