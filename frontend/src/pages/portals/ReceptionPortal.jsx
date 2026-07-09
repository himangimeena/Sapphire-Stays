import React, { useState, useEffect } from 'react';
import axiosInstance from 'axios';
import { Search, UserCheck, Key, FileText, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function ReceptionPortal() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('http://localhost:5000/api/bookings'),
      axiosInstance.get('http://localhost:5000/api/rooms')
    ])
    .then(([bookingsRes, roomsRes]) => {
      setBookings(bookingsRes.data.bookings || []);
      setRooms(roomsRes.data.rooms || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleStatusUpdate = async (id, nextStatus, roomId = null) => {
    try {
      await axiosInstance.patch(`http://localhost:5000/api/bookings/${id}/status`, {
        status: nextStatus,
        assigned_room_id: roomId
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update booking status');
    }
  };

  const filtered = search
    ? bookings.filter(b => (b.guest_name || '').toLowerCase().includes(search.toLowerCase()) || b.booking_ref.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 text-slate-900 dark:text-slate-100">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Front Desk Hub
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">Reception Dashboard</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Indian guest or booking ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:border-[#D4AF37] text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Guest Bookings Board */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Today's Guest Arrivals & Departures</h2>
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
                        onClick={() => handleStatusUpdate(b.id, 'CHECKED_IN', null)}
                        className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                      >
                        Check-In
                      </button>
                    )}
                    {b.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleStatusUpdate(b.id, 'CHECKED_OUT', b.assigned_room_id)}
                        className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">No reservations found matching search query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Room Status Board */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-200 dark:border-gray-800 pb-3 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100">Live Room Status Board</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time occupancy, sanitization, and LOTO engineering lockout states.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vacant-Clean
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Cleaning Turnaround
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Locked Out (LOTO)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {rooms.map(room => {
            const isLOTO = room.is_locked === 1;
            let statusColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
            let statusLabel = "Vacant-Clean";

            if (isLOTO) {
              statusColor = "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400 opacity-60";
              statusLabel = "LOTO Locked";
            } else if (room.status === 'OCCUPIED') {
              statusColor = "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
              statusLabel = "Occupied";
            } else if (room.status === 'CLEANING') {
              statusColor = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
              statusLabel = "Turnaround";
            } else if (room.status === 'MAINTENANCE') {
              statusColor = "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400";
              statusLabel = "Maintenance";
            }

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 bg-white/50 dark:bg-[#0B1D3A] transition duration-200 ${statusColor}`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">{room.room_number}</span>
                    {isLOTO && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{room.type_name}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200/20">
                  <span className="text-[9px] uppercase font-bold tracking-wider">{statusLabel}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{room.floor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
