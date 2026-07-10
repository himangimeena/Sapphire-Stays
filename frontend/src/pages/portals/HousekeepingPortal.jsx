import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench, 
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function HousekeepingPortal() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Turnaround Checklist states
  const [activeChecklistTask, setActiveChecklistTask] = useState(null);
  const [checklistChecked, setChecklistChecked] = useState([false, false, false, false, false]);

  // Maintenance Escalation states
  const [activeEscalationTask, setActiveEscalationTask] = useState(null);
  const [escalationTitle, setEscalationTitle] = useState('');
  const [escalationDesc, setEscalationDesc] = useState('');
  const [escalationPriority, setEscalationPriority] = useState('URGENT');
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/operations/housekeeping')
      .then(res => {
        setTasks(res.data.tasks || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load housekeeping tasks:', err);
        setLoading(false);
      });
  };

  const handleStartCleaning = async (task) => {
    try {
      // Set status in progress on server
      await axios.patch(`http://localhost:5000/api/operations/housekeeping/${task.id}`, {
        status: 'IN_PROGRESS',
        roomId: task.room_id
      });
      // Also temporarily mark room status to CLEANING in case receptionist check board checks
      await axios.patch(`http://localhost:5000/api/rooms/${task.room_id}/status`, {
        status: 'CLEANING'
      });
      
      // Open modal checklist
      setActiveChecklistTask(task);
      setChecklistChecked([false, false, false, false, false]);
    } catch (err) {
      alert('Failed to start cleaning task.');
    }
  };

  const handleSubmitTurnaround = async () => {
    if (!activeChecklistTask) return;
    try {
      // Sync status to COMPLETED (the backend route auto-marks Room status back to AVAILABLE!)
      await axios.patch(`http://localhost:5000/api/operations/housekeeping/${activeChecklistTask.id}`, {
        status: 'COMPLETED',
        roomId: activeChecklistTask.room_id
      });
      
      setActiveChecklistTask(null);
      setChecklistChecked([false, false, false, false, false]);
      fetchTasks();
    } catch (err) {
      alert('Failed to submit room turnaround.');
    }
  };

  const handleReportEscalation = async (e) => {
    e.preventDefault();
    if (!activeEscalationTask || !escalationTitle) return;
    setEscalating(true);

    try {
      // 1. Post new ticket directly to Maintenance Portal queue
      await axios.post('http://localhost:5000/api/operations/maintenance', {
        room_id: activeEscalationTask.room_id,
        issue_title: `[Housekeeping Escalation] ${escalationTitle}`,
        description: escalationDesc || 'Malfunction reported by housekeeping staff during turnaround cleaning.',
        priority: escalationPriority
      });

      // 2. Lockout the room (LOTO) for safety if priority is URGENT or EMERGENCY
      if (escalationPriority === 'URGENT' || escalationPriority === 'EMERGENCY') {
        await axios.patch(`http://localhost:5000/api/rooms/${activeEscalationTask.room_id}/lockout`, {
          is_locked: 1
        });
      }

      setEscalationTitle('');
      setEscalationDesc('');
      setEscalationPriority('URGENT');
      setActiveEscalationTask(null);
      alert('Maintenance fault dispatched. Room has been locked for safety.');
      fetchTasks();
    } catch (err) {
      alert('Failed to dispatch maintenance ticket.');
    } finally {
      setEscalating(false);
    }
  };

  // Turnaround categories
  const immediateClean = tasks.filter(t => t.status !== 'COMPLETED' && (t.task_type === 'Standard Cleaning' || t.priority === 'URGENT'));
  const stayoverService = tasks.filter(t => t.status !== 'COMPLETED' && t.task_type === 'Turn-down Service');
  const deepCleanInspection = tasks.filter(t => t.status !== 'COMPLETED' && t.task_type === 'Deep Clean');

  // Dynamic Metrics calculations (.filter())
  const totalAssigned = tasks.length;
  const cleanedToday = tasks.filter(t => t.status === 'COMPLETED').length;
  const remainingTurnarounds = tasks.filter(t => t.status !== 'COMPLETED').length;

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Turnaround Board...</div>;

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-8 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1E36] border-slate-200 dark:border-slate-800">
      
      {/* Top Banner Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Mobile Turnaround App
          </span>
          <h1 className="font-serif text-3xl font-bold mt-0.5">Palace Housekeeping</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Shift: Morning (08:00 AM - 04:00 PM)
          </span>
        </div>
      </div>

      {/* Dynamic Queue Metrics */}
      <div className="grid grid-cols-3 gap-4 text-center text-slate-900 dark:text-slate-100">
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Assigned Rooms</span>
          <span className="font-serif text-2xl font-bold block">{totalAssigned}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-1">
          <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider block">Cleaned Today</span>
          <span className="font-serif text-2xl font-bold block text-emerald-500">{cleanedToday}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-1">
          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider block">Remaining</span>
          <span className="font-serif text-2xl font-bold block text-amber-500">{remainingTurnarounds}</span>
        </div>
      </div>

      {/* Touch Friendly Turnaround Queues */}
      <div className="space-y-8">
        
        {/* Category 1: Immediate Clean (Checkout/Arrivals) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-850 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="font-serif text-lg font-bold">Immediate Clean (Checkout Turnaround)</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
              {immediateClean.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {immediateClean.map(t => (
              <div 
                key={t.id} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base">Suite {t.room_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      t.priority === 'VIP' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>{t.priority}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">{t.room_type_name} • Floor {t.floor || '1'}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2.5 leading-relaxed">{t.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => setActiveEscalationTask(t)}
                    className="px-2.5 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Report Fault
                  </button>
                  <button
                    onClick={() => handleStartCleaning(t)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Start Turnaround
                  </button>
                </div>
              </div>
            ))}
            {immediateClean.length === 0 && (
              <p className="text-slate-500 italic text-xs py-2">No checkout turnarounds queued.</p>
            )}
          </div>
        </div>

        {/* Category 2: Stayover Service */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-850 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="font-serif text-lg font-bold">Stayover Service (Tidy & Turn-down)</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
              {stayoverService.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stayoverService.map(t => (
              <div 
                key={t.id} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base">Suite {t.room_number}</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-blue-500/10 text-blue-600 uppercase">Tidy Up</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">{t.room_type_name} • Floor {t.floor || '1'}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2.5 leading-relaxed">{t.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => setActiveEscalationTask(t)}
                    className="px-2.5 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Report Fault
                  </button>
                  <button
                    onClick={() => handleStartCleaning(t)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Start Turnaround
                  </button>
                </div>
              </div>
            ))}
            {stayoverService.length === 0 && (
              <p className="text-slate-500 italic text-xs py-2">No stayover service scheduled.</p>
            )}
          </div>
        </div>

        {/* Category 3: Deep Clean / Inspection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-850 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h2 className="font-serif text-lg font-bold">Deep Clean / Periodic Inspection</h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 text-[10px] font-bold">
              {deepCleanInspection.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deepCleanInspection.map(t => (
              <div 
                key={t.id} 
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] flex flex-col justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base">Suite {t.room_number}</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-500/10 text-purple-600 uppercase">Deep Clean</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">{t.room_type_name} • Floor {t.floor || '1'}</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-2.5 leading-relaxed">{t.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => setActiveEscalationTask(t)}
                    className="px-2.5 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Report Fault
                  </button>
                  <button
                    onClick={() => handleStartCleaning(t)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Start Turnaround
                  </button>
                </div>
              </div>
            ))}
            {deepCleanInspection.length === 0 && (
              <p className="text-slate-500 italic text-xs py-2">No deep cleans or inspections scheduled.</p>
            )}
          </div>
        </div>

      </div>

      {/* Luxury Sanitation Checklist Modal */}
      {activeChecklistTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Palace Turnaround Protocol
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Suite {activeChecklistTask.room_number} Inspection</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveChecklistTask(null);
                  setChecklistChecked([false, false, false, false, false]);
                }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <p className="text-slate-550">
                Acknowledge and verify the following turnaround standards before releasing this room to the front desk:
              </p>

              {[
                "Strip linens and replace with fresh 500-thread-count Egyptian cotton sheets.",
                "Replenish luxury minibar inventory (fine teas, local heritage sweets).",
                "Sanitize and polish all marble surfaces, brass fixtures, and high-touch areas.",
                "Place fresh bath rituals and setup custom aromatherapy diffusers.",
                "Final inspection: Verify lighting, electronics, and smart ambient controls are working."
              ].map((item, idx) => (
                <label 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={checklistChecked[idx]}
                    onChange={() => {
                      const copy = [...checklistChecked];
                      copy[idx] = !copy[idx];
                      setChecklistChecked(copy);
                    }}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-350 dark:border-slate-700 mt-0.5"
                  />
                  <span className="leading-relaxed">{item}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveChecklistTask(null);
                  setChecklistChecked([false, false, false, false, false]);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!checklistChecked.every(v => v)}
                onClick={handleSubmitTurnaround}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${
                  checklistChecked.every(v => v)
                    ? 'btn-gold shadow-lg cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                }`}
              >
                Submit Room Turnaround
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Emergency Maintenance Fault Escalation Modal */}
      {activeEscalationTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-red-500/40 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-red-200 dark:border-red-900/30 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-500 tracking-widest flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> Maintenance Escalation
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">Disruptive Suite Fault</h3>
              </div>
              <button 
                onClick={() => setActiveEscalationTask(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReportEscalation} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Room / Suite Location</label>
                <input 
                  type="text"
                  disabled
                  value={`Suite ${activeEscalationTask.room_number}`}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-[#0D1E36] text-slate-950 dark:text-slate-100 focus:outline-none opacity-80"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Fault Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="E.g. Broken bathroom shower faucet"
                    value={escalationTitle}
                    onChange={e => setEscalationTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">SLA Urgency Severity</label>
                  <select 
                    value={escalationPriority} 
                    onChange={e => setEscalationPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="URGENT">URGENT (IMMEDIATE ESCALATION)</option>
                    <option value="EMERGENCY">EMERGENCY (LOTO LOCKOUT REQUIRED)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Incident Details</label>
                <textarea 
                  placeholder="Detail plumbing damage, electrical ballast leaks, or locked lock faults..."
                  value={escalationDesc}
                  onChange={e => setEscalationDesc(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveEscalationTask(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md"
                >
                  {escalating ? 'Dispatching...' : 'Dispatch Maintenance Fault'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
