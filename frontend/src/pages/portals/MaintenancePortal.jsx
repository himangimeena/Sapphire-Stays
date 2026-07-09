import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wrench, AlertTriangle, CheckCircle, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function MaintenancePortal() {
  const [tickets, setTickets] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
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
      // Auto-release LOTO lockout upon ticket resolution for safety
      if (ticket.is_locked === 1) {
        await axios.patch(`http://localhost:5000/api/rooms/${ticket.room_id}/lockout`, {
          is_locked: 0
        });
      }
      fetchTickets();
    } catch (err) {
      alert('Failed to resolve ticket');
    }
  };

  const handleToggleLockout = async (ticket) => {
    const nextLocked = ticket.is_locked === 1 ? 0 : 1;
    try {
      await axios.patch(`http://localhost:5000/api/rooms/${ticket.room_id}/lockout`, {
        is_locked: nextLocked
      });
      fetchTickets();
    } catch (err) {
      alert('Failed to update safety lockout status.');
    }
  };

  const getAssetCategory = (ticket) => {
    const text = `${ticket.issue_title} ${ticket.description}`.toLowerCase();
    if (text.includes('ac') || text.includes('hvac') || text.includes('heat') || text.includes('cooling') || text.includes('ventilation') || text.includes('air con')) {
      return 'HVAC';
    }
    if (text.includes('leak') || text.includes('plumb') || text.includes('pipe') || text.includes('clog') || text.includes('water') || text.includes('toilet') || text.includes('sink') || text.includes('tap')) {
      return 'Plumbing';
    }
    if (text.includes('wire') || text.includes('elect') || text.includes('short') || text.includes('light') || text.includes('plug') || text.includes('breaker') || text.includes('power') || text.includes('socket')) {
      return 'Electrical';
    }
    return 'Structural';
  };

  const filteredTickets = activeCategory === 'ALL'
    ? tickets
    : tickets.filter(t => getAssetCategory(t) === activeCategory);

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Engineering Console...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100">
      
      {/* Top Title Bar */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Engineering & Facilities
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">Maintenance & Repairs</h1>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 items-center text-slate-900 dark:text-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Asset Categories:
        </span>
        {['ALL', 'HVAC', 'Plumbing', 'Electrical', 'Structural'].map(c => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
              activeCategory === c 
                ? 'bg-[#08203E] dark:bg-amber-500 text-white dark:text-[#08203E] font-bold' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map(t => {
          const category = getAssetCategory(t);
          const isLOTO = t.is_locked === 1;

          return (
            <div key={t.id} className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between space-y-4 shadow-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-[#132135]">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'EMERGENCY' ? 'bg-red-500/20 text-red-600' :
                    t.priority === 'URGENT' ? 'bg-orange-500/20 text-orange-600' : 'bg-amber-500/20 text-amber-600'
                  }`}>
                    {t.priority}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {category}
                    </span>
                    <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">Room {t.room_number}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">{t.issue_title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t.description}</p>
                
                {/* LOTO Badge indicator */}
                {isLOTO && (
                  <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    Safety Lockout/Tagout (LOTO) Active
                  </div>
                )}

                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-2 border-t border-gray-100 dark:border-gray-800">
                  Reported by: <span className="font-semibold text-slate-900 dark:text-slate-100">{t.reported_by}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-3">
                {t.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleToggleLockout(t)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                      isLOTO 
                        ? 'bg-red-600 border-red-600 text-white shadow-md' 
                        : 'border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isLOTO ? 'LOTO Locked' : 'Trigger LOTO'}
                  </button>
                )}

                <span className={`text-xs font-bold uppercase tracking-wide ${t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {t.status === 'COMPLETED' ? 'Resolved' : 'Pending Fix'}
                </span>

                {t.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleResolve(t)}
                    className="px-3 py-1.5 rounded-xl bg-[#0F3D6E] dark:bg-amber-500 hover:bg-[#14355E] dark:hover:bg-amber-600 text-white dark:text-[#08203E] text-xs font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredTickets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm">No maintenance requests listed.</div>
        )}
      </div>
    </div>
  );
}
