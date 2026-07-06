import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Home, Users, DollarSign, CheckCircle } from 'lucide-react';

export default function BranchAdminPortal() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/rooms?branchId=1')
      .then(res => {
        setRooms(res.data.rooms || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest">Branch Operations</span>
          <h1 className="font-serif text-4xl font-bold mt-1">Sapphire Palace Udaipur – Manager Portal</h1>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
          Branch Status: 100% Operational
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Total Suites</span>
          <span className="font-serif text-3xl font-bold">42</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Occupied Today</span>
          <span className="font-serif text-3xl font-bold text-[#0F3D6E] dark:text-amber-300">36</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold">Average Nightly Rate</span>
          <span className="font-serif text-3xl font-bold">₹58,500</span>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6">
        <h3 className="font-serif text-2xl font-bold">Room Inventory & Status Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map(r => (
            <div key={r.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-lg">Room {r.room_number}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  r.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-600' :
                  r.status === 'OCCUPIED' ? 'bg-blue-500/20 text-blue-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {r.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{r.type_name}</p>
              <div className="pt-2 border-t flex justify-between text-xs font-semibold">
                <span>Rate</span>
                <span className="text-[#0F3D6E] dark:text-amber-300">₹{Number(r.nightly_rate).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
