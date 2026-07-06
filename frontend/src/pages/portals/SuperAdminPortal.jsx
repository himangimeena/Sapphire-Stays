import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Home, Users, TrendingUp, Plus, Filter, Download, CheckCircle, Shield } from 'lucide-react';

export default function SuperAdminPortal() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/analytics/overview'),
      axios.get('http://localhost:5000/api/bookings')
    ]).then(([resAnalytics, resBookings]) => {
      setData(resAnalytics.data);
      setBookings(resBookings.data.bookings || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-24 text-center font-serif text-xl">Loading Executive Portal...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12">
      {/* Top Header matching Screenshot 5 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Estate Management
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1">Overview</h1>
        </div>
        <button onClick={() => alert('New reservation desk modal')} className="btn-luxury !py-3 !px-5 text-xs flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4 text-[#D4AF37]" /> New Reservation
        </button>
      </div>

      {/* KPI Cards Grid matching Screenshot 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><TrendingUp className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">+12.4%</span>
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold block">Total Revenue</span>
          <span className="font-serif text-3xl font-bold text-[#0F3D6E] dark:text-amber-300">₹4.2M</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Home className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-bold">Optimal</span>
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold block">Avg. Occupancy</span>
          <span className="font-serif text-3xl font-bold">{data?.avgOccupancy || 84}%</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500"><Users className="w-5 h-5" /></span>
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold block">Active Indian Palaces</span>
          <span className="font-serif text-3xl font-bold">{data?.activeBranches || 6}</span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">High</span>
          </div>
          <span className="text-xs text-gray-500 uppercase font-semibold block">Daily Bookings</span>
          <span className="font-serif text-3xl font-bold">{data?.dailyBookings || 142}</span>
        </div>
      </div>

      {/* Middle Row matching Screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Distribution Portfolio Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold">Branch Distribution</h3>
              <p className="text-xs text-gray-500">Global footprint across iconic Indian destinations</p>
            </div>
            <span className="text-xs text-[#0F3D6E] dark:text-amber-300 font-semibold cursor-pointer">Expand Map ↗</span>
          </div>
          <div className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800/60 overflow-hidden relative border border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between"
               style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=60')`, backgroundSize: 'cover' }}>
            <div className="bg-[#08203E]/90 backdrop-blur-md p-4 rounded-xl text-white max-w-sm">
              <span className="text-[10px] text-[#D4AF37] uppercase font-bold">Portfolio Overview</span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-xs text-gray-300 block">Net Operating Income</span>
                  <span className="font-serif text-lg font-bold">₹7,85,30,000</span>
                </div>
                <div>
                  <span className="text-xs text-gray-300 block">Occupancy Rate</span>
                  <span className="font-serif text-lg font-bold text-emerald-400">96.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Service Card matching Screenshot 5 */}
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold">Revenue by Service</h3>
            <p className="text-xs text-gray-500">Quarterly distribution</p>

            <div className="space-y-4 mt-6">
              {(data?.revenueByService || []).map((s, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{s.service}</span>
                    <span>{s.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-[#0F3D6E] dark:bg-[#D4AF37] rounded-full" style={{ width: `${s.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => alert('Downloading comprehensive audit PDF report...')} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Recent Booking Activity Table matching Screenshot 5 */}
      <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl font-bold">Recent Booking Activity (India Collection)</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500"><Filter className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-semibold uppercase">
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Branch Sanctuary</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">INR Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {bookings.slice(0, 6).map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3.5 px-4 font-semibold">{b.guest_name || 'Julian Thorne'}</td>
                  <td className="py-3.5 px-4">{b.branch_name}</td>
                  <td className="py-3.5 px-4 text-gray-500">{b.check_in_date} → {b.check_out_date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold uppercase text-[10px]">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-sm">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
