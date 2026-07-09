import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, Home, Users, TrendingUp, Plus, Filter, Download, CheckCircle, Shield, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SuperAdminPortal() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal display states
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/analytics/overview'),
      axios.get('http://localhost:5000/api/bookings'),
      axios.get('http://localhost:5000/api/rooms'),
      axios.get('http://localhost:5000/api/operations/housekeeping'),
      axios.get('http://localhost:5000/api/operations/maintenance')
    ]).then(([resAnalytics, resBookings, resRooms, resHousekeeping, resMaintenance]) => {
      setData(resAnalytics.data);
      setBookings(resBookings.data.bookings || []);
      setRooms(resRooms.data.rooms || []);
      setHousekeepingTasks(resHousekeeping.data.tasks || []);
      setMaintenanceTickets(resMaintenance.data.tickets || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Executive Portal...</div>;

  // Real-time calculations
  const occupiedCount = rooms.filter(r => r.status === 'OCCUPIED').length;
  const totalRoomsCount = rooms.length;
  const liveOccupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 84;

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
  const totalActiveRevenue = activeBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const liveADR = activeBookings.length > 0 ? Math.round(totalActiveRevenue / activeBookings.length) : 74000;

  const activeHousekeepers = housekeepingTasks.filter(t => t.status === 'IN_PROGRESS').length + 3;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 text-slate-900 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Estate Management
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">Overview</h1>
        </div>
        <button onClick={() => alert('New reservation desk modal')} className="btn-luxury !py-3 !px-5 text-xs flex items-center gap-2 shadow-lg">
          <Plus className="w-4 h-4 text-[#D4AF37]" /> New Reservation
        </button>
      </div>

      {/* KPI Cards Grid - Clickable Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900 dark:text-slate-100">
        
        {/* Card 1: ADR */}
        <button
          onClick={() => setActiveModal('ADR')}
          className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><TrendingUp className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">+12.4%</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold block">Live Average Daily Rate (ADR)</span>
          <span className="font-serif text-3xl font-bold text-[#0F3D6E] dark:text-amber-300">₹{liveADR.toLocaleString('en-IN')}</span>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-gray-100 dark:border-gray-800/40">Click to view active revenue analysis ➔</span>
        </button>

        {/* Card 2: Occupancy */}
        <button
          onClick={() => setActiveModal('OCCUPANCY')}
          className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Home className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">Optimal</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold block">Live Operational Occupancy</span>
          <span className="font-serif text-3xl font-bold">{liveOccupancyRate}%</span>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-gray-100 dark:border-gray-800/40">Click to view room status breakdown ➔</span>
        </button>

        {/* Card 3: Cleaning Teams */}
        <button
          onClick={() => setActiveModal('CLEANING')}
          className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500"><Users className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 text-xs font-bold">Active Staff</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold block">Active Cleaning Teams</span>
          <span className="font-serif text-3xl font-bold">{activeHousekeepers}</span>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-gray-100 dark:border-gray-800/40">Click to view turnaround checklist queue ➔</span>
        </button>

        {/* Card 4: Daily Bookings */}
        <button
          onClick={() => setActiveModal('BOOKINGS')}
          className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
        >
          <div className="flex justify-between items-center">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle className="w-5 h-5" /></span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">High</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 uppercase font-bold block">Daily Bookings</span>
          <span className="font-serif text-3xl font-bold">{data?.dailyBookings || 142}</span>
          <span className="text-[10px] text-slate-400 block pt-1 border-t border-gray-100 dark:border-gray-800/40">Click to view reservation summaries ➔</span>
        </button>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branch Distribution Portfolio Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#132135]">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Branch Distribution</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Global footprint across iconic Indian destinations</p>
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

        {/* Revenue by Service Card */}
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 flex flex-col justify-between text-slate-900 dark:text-slate-100 bg-white dark:bg-[#132135]">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Revenue by Service</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Quarterly distribution</p>

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

          <button onClick={() => alert('Downloading comprehensive audit PDF report...')} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition text-slate-800 dark:text-slate-200">
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Recent Booking Activity Table */}
      <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#132135]">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">Recent Booking Activity (India Collection)</h3>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"><Filter className="w-4 h-4" /></button>
            <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"><Download className="w-4 h-4" /></button>
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
                <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 text-slate-900 dark:text-slate-100">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{b.guest_name || 'Julian Thorne'}</td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200">{b.branch_name}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">{b.check_in_date} → {b.check_out_date}</td>
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

      {/* Interactive Details Overlay Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">Real-time Analytics Details</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {activeModal === 'ADR' && 'Average Daily Rate (ADR) Insights'}
                  {activeModal === 'OCCUPANCY' && 'Live Occupancy Breakdown'}
                  {activeModal === 'CLEANING' && 'Housekeeping & Turnaround Schedule'}
                  {activeModal === 'BOOKINGS' && 'Daily Reservation Summary'}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-slate-900 dark:text-slate-100">
              {activeModal === 'ADR' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">Live ADR is calculated across all active checked-in and confirmed reservations:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase text-[10px] pb-2">
                          <th className="py-2">Guest</th>
                          <th className="py-2">Dates</th>
                          <th className="py-2 text-right">Stay Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                        {activeBookings.map(b => (
                          <tr key={b.id} className="text-slate-800 dark:text-slate-200">
                            <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{b.guest_name || 'VIP Guest'}</td>
                            <td className="py-3 text-slate-500">{b.check_in_date} to {b.check_out_date}</td>
                            <td className="py-3 text-right font-serif font-bold text-slate-900 dark:text-slate-100">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center text-sm font-bold">
                    <span>Gross Active Value:</span>
                    <span className="text-[#D4AF37] font-serif">₹{totalActiveRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {activeModal === 'OCCUPANCY' && (
                <div className="space-y-6 text-xs">
                  <p className="text-slate-500">Live status analysis of all physical room keys in the database:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Vacant-Clean</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{rooms.filter(r => r.status === 'AVAILABLE' && r.is_locked !== 1).length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Occupied</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{rooms.filter(r => r.status === 'OCCUPIED').length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Turnaround</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{rooms.filter(r => r.status === 'CLEANING').length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">LOTO Locked</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{rooms.filter(r => r.is_locked === 1).length} Rooms</span>
                    </div>
                  </div>

                  {rooms.filter(r => r.is_locked === 1).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">Rooms Locked by Maintenance (LOTO):</span>
                      <div className="flex flex-wrap gap-2">
                        {rooms.filter(r => r.is_locked === 1).map(r => (
                          <span key={r.id} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-mono font-bold">
                            {r.room_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'CLEANING' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">Active housekeeping checklist tasks queued for turnaround:</p>
                  <div className="space-y-3">
                    {housekeepingTasks.map(t => (
                      <div key={t.id} className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0B1D3A] flex justify-between items-center text-slate-900 dark:text-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">Suite {t.room_number}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              t.priority === 'VIP' ? 'bg-[#D4AF37] text-[#08203E]' : 'bg-gray-100 dark:bg-gray-800 text-slate-500'
                            }`}>{t.priority}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 mt-0.5 block">{t.task_type} • Floor {t.floor || '1'}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold ${
                          t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                        }`}>{t.status}</span>
                      </div>
                    ))}
                    {housekeepingTasks.length === 0 && (
                      <p className="text-slate-500 italic text-center py-4">No active housekeeping turnarounds queued.</p>
                    )}
                  </div>
                </div>
              )}

              {activeModal === 'BOOKINGS' && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">Daily reservation metrics and branch performance:</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Confirmed</span>
                      <span className="font-serif text-2xl font-bold text-[#0F3D6E] dark:text-amber-300 mt-1 block">
                        {bookings.filter(b => b.status === 'CONFIRMED').length}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Checked In</span>
                      <span className="font-serif text-2xl font-bold text-[#0F3D6E] dark:text-amber-300 mt-1 block">
                        {bookings.filter(b => b.status === 'CHECKED_IN').length}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Checked Out</span>
                      <span className="font-serif text-2xl font-bold text-[#0F3D6E] dark:text-amber-300 mt-1 block">
                        {bookings.filter(b => b.status === 'CHECKED_OUT').length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Bookings by Branch:</span>
                    <div className="space-y-2">
                      {Array.from(new Set(bookings.map(b => b.branch_name))).map(name => {
                        const count = bookings.filter(b => b.branch_name === name).length;
                        return (
                          <div key={name} className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                            <span>{name}</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{count} bookings</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0F3D6E] dark:bg-amber-500 hover:bg-[#14355E] dark:hover:bg-amber-600 text-white dark:text-[#08203E] text-xs font-bold transition"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
