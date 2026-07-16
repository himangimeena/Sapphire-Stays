import React from 'react';
import { Shield, Sparkles, Award, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 sm:space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Brand Heritage</span>
        <h1 className="font-serif text-4xl md:text-6xl font-bold">A Century of Royal Elegance</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          Founded in 1926 as a private sanctuary for royal families in Rajasthan, Sapphire Stays has evolved into India's benchmark for bespoke luxury hospitality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80" alt="Palace" className="rounded-2xl shadow-2xl border border-[#D4AF37]/30" />
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-bold">Our Vision for Indian Hospitality</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            We believe that true luxury lies in intuitive service and architectural authenticity. Whether restoring 19th-century havelis in Udaipur or crafting eco-sustainable sea pavilions in Goa, our mission remains constant: to curate unforgettable sanctuaries of quiet light.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5">
              <Award className="w-6 h-6 text-[#D4AF37] mb-2" />
              <h4 className="font-serif font-bold">Forbes 5-Star</h4>
              <p className="text-xs text-gray-500">Awarded to all 6 Indian Palaces</p>
            </div>
            <div className="p-4 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5">
              <Heart className="w-6 h-6 text-[#D4AF37] mb-2" />
              <h4 className="font-serif font-bold">100% Sustainable</h4>
              <p className="text-xs text-gray-500">Zero plastic & solar heritage grid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
