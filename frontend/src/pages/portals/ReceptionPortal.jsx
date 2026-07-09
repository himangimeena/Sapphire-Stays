import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserCheck, Key, FileText, CheckCircle } from 'lucide-react';

export default function ReceptionPortal() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    axios.get('http://localhost:5000/api/bookings')
      .then(res => {
        setBookings(res.data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleStatusUpdate = async (id, nextStatus, roomId = 1) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, {
        status: nextStatus,
        assigned_room_id: roomId
      });
      fetchBookings();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const filtered = search
    ? bookings.filter(b => (b.guest_name || '').toLowerCase().includes(search.toLowerCase()) || b.booking_ref.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest">Front Desk Desk</span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">Reception Dashboard</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Indian guest or booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#08203E] text-white uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6">Booking Ref</th>
              <th className="py-4 px-6">Guest Name</th>
              <th className="py-4 px-6">Sanctuary Branch</th>
              <th className="py-4 px-6">Dates</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Desk Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 text-slate-900 dark:text-slate-100">
                <td className="py-4 px-6 font-mono font-bold text-[#0F3D6E] dark:text-amber-300">{b.booking_ref}</td>
                <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">{b.guest_name}</td>
                <td className="py-4 px-6 text-slate-800 dark:text-slate-200">{b.branch_name}</td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">{b.check_in_date} → {b.check_out_date}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    b.status === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-600' :
                    b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusUpdate(b.id, 'CHECKED_IN', 1)}
                      className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Check-In
                    </button>
                  )}
                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleStatusUpdate(b.id, 'CHECKED_OUT', 1)}
                      className="px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                    >
                      Check-Out
                    </button>
                  )}
                  <button onClick={() => window.print()} className="px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-800 transition font-medium">
                    Print Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
