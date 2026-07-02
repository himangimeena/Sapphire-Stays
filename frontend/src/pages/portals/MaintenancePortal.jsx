import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MaintenancePortal() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    axios.get('http://localhost:5000/api/operations/maintenance')
      .then(res => {
        setTickets(res.data.tickets || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleResolve = async (ticket) => {
    try {
      await axios.patch(`http://localhost:5000/api/operations/maintenance/${ticket.id}`, {
        status: 'COMPLETED',
        roomId: ticket.room_id
      });
      fetchTickets();
    } catch (err) {
      alert('Failed to resolve ticket');
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest">Engineering & Facilities</span>
          <h1 className="font-serif text-4xl font-bold mt-1">Maintenance & Technical Repairs</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map(t => (
          <div key={t.id} className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  t.priority === 'URGENT' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {t.priority}
                </span>
                <span className="font-serif font-bold text-sm">Room {t.room_number}</span>
              </div>
              <h3 className="font-serif text-xl font-bold">{t.issue_title}</h3>
              <p className="text-xs text-gray-500">{t.description}</p>
              <div className="text-[11px] text-gray-400 pt-2 border-t">
                Reported by: <span className="font-semibold text-gray-600 dark:text-gray-300">{t.reported_by}</span>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-between items-center">
              <span className={`text-xs font-bold ${t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {t.status}
              </span>
              {t.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleResolve(t)}
                  className="px-3 py-1.5 rounded bg-[#0F3D6E] text-white text-xs font-semibold hover:bg-[#14355E] transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
