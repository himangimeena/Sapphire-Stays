import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Sparkles, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function HousekeepingPortal() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All Tasks');
  const [loading, setLoading] = useState(true);

  // Turnaround checklist state
  const [activeTaskForChecklist, setActiveTaskForChecklist] = useState(null);
  const [checklistChecked, setChecklistChecked] = useState([false, false, false, false, false]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get('http://localhost:5000/api/operations/housekeeping')
      .then(res => {
        setTasks(res.data.tasks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await axios.patch(`http://localhost:5000/api/operations/housekeeping/${task.id}`, {
        status: nextStatus,
        roomId: task.room_id
      });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleOpenChecklist = (task) => {
    if (task.status === 'COMPLETED') {
      // Toggle back to PENDING directly
      handleToggleStatus(task);
    } else {
      setActiveTaskForChecklist(task);
      setChecklistChecked([false, false, false, false, false]);
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All Tasks') return true;
    if (filter === 'Housekeeping') return t.task_type === 'Standard Cleaning' || t.task_type === 'Deep Clean';
    if (filter === 'Technical Repairs') return t.task_type === 'Maintenance Check';
    if (filter === 'VIP Turn-down') return t.priority === 'VIP';
    return true;
  });

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Housekeeping Board...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100">Palace Housekeeping Control</h1>
        <div className="flex items-center gap-4">
          <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D4AF37]" />
          </button>
          <div className="text-right">
            <span className="font-bold text-sm text-[#0F3D6E] dark:text-amber-300 block">Shift: Morning</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">08:00 AM - 04:00 PM</span>
          </div>
        </div>
      </div>

      {/* KPI Status Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-900 dark:text-slate-100">
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1 bg-white dark:bg-[#08203E]">
          <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">PENDING TASKS</span>
          <span className="font-serif text-4xl font-bold block">{tasks.filter(t => t.status !== 'COMPLETED').length}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1 bg-white dark:bg-[#08203E]">
          <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">IN TURNAROUND</span>
          <span className="font-serif text-4xl font-bold block text-amber-500">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-1 bg-white dark:bg-[#08203E]">
          <span className="text-xs uppercase font-bold text-emerald-500 tracking-wider">COMPLETED TODAY</span>
          <span className="font-serif text-4xl font-bold block text-emerald-500">{tasks.filter(t => t.status === 'COMPLETED').length}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-1 bg-red-500/10 text-red-600 dark:text-red-400">
          <span className="text-xs uppercase font-bold tracking-wider">VIP ARRIVALS</span>
          <span className="font-serif text-4xl font-bold block">{tasks.filter(t => t.priority === 'VIP').length}</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {['All Tasks', 'Housekeeping', 'Technical Repairs', 'VIP Turn-down'].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition ${
              filter === c ? 'bg-[#08203E] dark:bg-amber-500 text-white dark:text-[#08203E] font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTasks.map(t => (
          <div
            key={t.id}
            className={`glass-card rounded-2xl overflow-hidden border transition flex flex-col justify-between ${
              t.priority === 'VIP' ? 'bg-[#08203E] text-white border-[#D4AF37]/50 shadow-2xl' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  t.priority === 'VIP' ? 'bg-[#D4AF37] text-[#08203E]' :
                  t.priority === 'URGENT' ? 'bg-red-500/20 text-red-600' : 'bg-gray-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {t.priority === 'VIP' ? 'VIP ARRIVAL' : t.task_type}
                </span>
                <span className={`font-serif font-bold text-sm ${t.priority === 'VIP' ? 'text-amber-300' : 'text-slate-900 dark:text-slate-100'}`}>Room {t.room_number}</span>
              </div>

              {t.priority === 'VIP' ? (
                <div className="space-y-3">
                  <h4 className="font-serif text-xl font-bold text-amber-300">Welcome Setup</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{t.notes}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-32 rounded-xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80" alt="Suite" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">{t.task_type}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.notes}</p>
                </div>
              )}
            </div>

            <div className={`p-4 border-t flex items-center justify-between ${t.priority === 'VIP' ? 'border-white/10 bg-white/5' : 'border-gray-100 dark:border-gray-800'}`}>
              <span className={`text-xs font-semibold ${t.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-600 dark:text-gray-400'}`}>
                {t.status === 'COMPLETED' ? 'Cleaned & Released' : 'Release Room'}
              </span>
              <button
                onClick={() => handleOpenChecklist(t)}
                className={`w-12 h-6 rounded-full transition flex items-center p-1 ${
                  t.status === 'COMPLETED' ? 'bg-[#0F3D6E] dark:bg-amber-500 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Housekeeping Turnaround Modal */}
      {activeTaskForChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Turnaround Protocol
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">Suite {activeTaskForChecklist.room_number} Inspection</h3>
              </div>
              <button 
                onClick={() => { setActiveTaskForChecklist(null); setChecklistChecked([false, false, false, false, false]); }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-2">
              <p className="text-xs text-slate-500">
                Acknowledge and verify the following luxury hygiene standards prior to marking room ready:
              </p>

              {[
                "Sanitize all high-touch surfaces (remotes, door handles, climate switches)",
                "Replace suite linen with pre-pressed 800-thread Egyptian cotton linen",
                "Replenish minibar inventory, crystal glassware, and organic tea selectors",
                "Deep sanitize Italian marble bath and polish chrome rainfall shower fittings",
                "Vacuum woolen carpets and polish teakwood floors to a high shine"
              ].map((item, idx) => (
                <label 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={checklistChecked[idx]}
                    onChange={() => {
                      const newChecks = [...checklistChecked];
                      newChecks[idx] = !newChecks[idx];
                      setChecklistChecked(newChecks);
                    }}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 dark:border-gray-700 mt-0.5"
                  />
                  <span className="leading-relaxed">{item}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => { setActiveTaskForChecklist(null); setChecklistChecked([false, false, false, false, false]); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!checklistChecked.every(v => v)}
                onClick={async () => {
                  try {
                    await axios.patch(`http://localhost:5000/api/operations/housekeeping/${activeTaskForChecklist.id}`, {
                      status: 'COMPLETED',
                      roomId: activeTaskForChecklist.room_id
                    });
                    setActiveTaskForChecklist(null);
                    setChecklistChecked([false, false, false, false, false]);
                    fetchTasks();
                  } catch (err) {
                    alert('Failed to complete cleaning turnaround');
                  }
                }}
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-bold transition ${
                  checklistChecked.every(v => v)
                    ? 'btn-gold shadow-xl cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-transparent'
                }`}
              >
                Submit Turnaround
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
