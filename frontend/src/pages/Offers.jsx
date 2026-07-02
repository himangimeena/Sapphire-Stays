import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Gift, Tag, CheckCircle } from 'lucide-react';

export default function Offers() {
  const offers = [
    {
      title: 'Royal Wedding & Honeymoon Sanctuary',
      code: 'ROYALINDIA20',
      discount: '20% Off + Complimentary Champagne & Private Yacht',
      desc: 'Experience pure romance overlooking Lake Pichola or the South Goa coastline. Includes private dining pavilion and Ayurvedic couples spa.',
      validity: 'Valid across all Indian Palaces until Dec 2026'
    },
    {
      title: 'Weekend Heritage Escape Flat Discount',
      code: 'SAPPHIRE5000',
      discount: 'Flat ₹5,000 Off on 2+ Nights',
      desc: 'Escape the city rush to our royal forts in Jaipur or tea plantation estates in Munnar. Includes chauffeur luxury transit.',
      validity: 'Applicable on bookings above ₹40,000 INR'
    },
    {
      title: 'Corporate Diplomatic Enclave Privilege',
      code: 'EXECUTIVE25',
      discount: '25% Executive Suite Savings',
      desc: 'High-speed global fiber Wi-Fi, 24/7 executive boardroom access, and dedicated butler in New Delhi & Mumbai.',
      validity: 'Exclusive for corporate executive stays'
    }
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Privileges & Escapes</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">Curated Seasonal Offers</h1>
        <p className="text-gray-500 text-sm md:text-base">
          Unlock exclusive benefits, flat INR reductions, and complimentary experiences across our India collection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {offers.map((o, idx) => (
          <div key={idx} className="glass-card p-8 rounded-2xl border border-[#D4AF37]/30 flex flex-col justify-between shadow-xl space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
                Promo Code: {o.code}
              </span>
              <h3 className="font-serif text-2xl font-bold">{o.title}</h3>
              <p className="font-semibold text-sm text-[#0F3D6E] dark:text-amber-300">{o.discount}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{o.desc}</p>
            </div>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4">
              <span className="text-[11px] text-gray-400">{o.validity}</span>
              <Link to={`/rooms?coupon=${o.code}`} className="btn-luxury text-center !py-3 text-xs">
                Claim Privilege →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
