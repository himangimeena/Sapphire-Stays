import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Play, 
  ArrowRight, 
  Plus, 
  Activity, 
  FileText, 
  Settings 
} from 'lucide-react';

export default function MaintenancePortal() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Interaction states
  const [activeChecklistTicket, setActiveChecklistTicket] = useState(null);
  const [checklistChecked, setChecklistChecked] = useState([false, false, false, false]);
  
  // Incident & Supply Log state
  const [partsRequests, setPartsRequests] = useState([
    { id: 1, roomNumber: 'UDA-104', part: '25W LED Ballast Driver', status: 'DISPATCHED' },
    { id: 2, roomNumber: 'UDA-102', part: 'Thermostatic Expansion Valve', status: 'PENDING STORE' }
  ]);
  
  // Incident Form state
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [reportingIssue, setReportingIssue] = useState(false);

  // Supply Log Form state
  const [supplyRoomNo, setSupplyRoomNo] = useState('');
  const [supplyPartName, setSupplyPartName] = useState('');

  // Local helper rooms list for incident form
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('http://localhost:5000/api/operations/maintenance'),
      axios.get('http://localhost:5000/api/rooms')
    ]).then(([maintRes, roomsRes]) => {
      setTickets(maintRes.data.tickets || []);
      setRooms(roomsRes.data.rooms || []);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load engineering data:', err);
      setLoading(false);
    });
  };

  const handleUpdateStatus = async (ticketId, nextStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/operations/maintenance/${ticketId}`, {
        status: nextStatus
      });
      fetchData();
    } catch (err) {
      alert('Failed to update ticket status.');
    }
  };

  const handleToggleLockout = async (ticket) => {
    const nextLocked = ticket.is_locked === 1 ? 0 : 1;
    try {
      await axios.patch(`http://localhost:5000/api/rooms/${ticket.room_id}/lockout`, {
        is_locked: nextLocked
      });
      fetchData();
    } catch (err) {
      alert('Failed to toggle Safety Lockout.');
    }
  };

  const handleResolveTicket = async () => {
    if (!activeChecklistTicket) return;
    try {
      // 1. Resolve ticket on backend
      await axios.patch(`http://localhost:5000/api/operations/maintenance/${activeChecklistTicket.id}`, {
        status: 'COMPLETED',
        roomId: activeChecklistTicket.room_id
      });
      
      // 2. Automatically release safety lockout (LOTO) upon resolution
      if (activeChecklistTicket.is_locked === 1) {
        await axios.patch(`http://localhost:5000/api/rooms/${activeChecklistTicket.room_id}/lockout`, {
          is_locked: 0
        });
      }

      setActiveChecklistTicket(null);
      setChecklistChecked([false, false, false, false]);
      fetchData();
    } catch (err) {
      alert('Failed to resolve maintenance request.');
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!newRoomId || !newIssueTitle) return;
    setReportingIssue(true);

    try {
      await axios.post('http://localhost:5000/api/operations/maintenance', {
        room_id: Number(newRoomId),
        issue_title: newIssueTitle,
        description: newDesc || 'Preventive facility engineering logging.',
        priority: newPriority
      });
      
      setNewIssueTitle('');
      setNewRoomId('');
      setNewDesc('');
      setNewPriority('NORMAL');
      fetchData();
    } catch (err) {
      alert('Failed to log incident.');
    } finally {
      setReportingIssue(false);
    }
  };

  const handleCreateSupplyRequest = (e) => {
    e.preventDefault();
    if (!supplyRoomNo || !supplyPartName) return;

    setPartsRequests(prev => [
      ...prev,
      { id: Date.now(), roomNumber: supplyRoomNo, part: supplyPartName, status: 'PENDING STORE' }
    ]);
    setSupplyRoomNo('');
    setSupplyPartName('');
    alert('Parts requisition request logged.');
  };

  const getAssetCategory = (title, desc) => {
    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes('ac') || text.includes('hvac') || text.includes('heat') || text.includes('cool') || text.includes('vent') || text.includes('fan')) {
      return 'HVAC';
    }
    if (text.includes('leak') || text.includes('plumb') || text.includes('pipe') || text.includes('clog') || text.includes('water') || text.includes('toilet') || text.includes('sink') || text.includes('drain')) {
      return 'Plumbing';
    }
    if (text.includes('wire') || text.includes('elect') || text.includes('short') || text.includes('light') || text.includes('plug') || text.includes('breaker') || text.includes('power')) {
      return 'Electrical';
    }
    return 'Structural';
  };

  const getPreventiveChecklist = (category) => {
    switch (category) {
      case 'HVAC':
        return [
          "Test compressor voltage load & startup capacitor tolerances",
          "Flush condensate drain line & clear structural blockages",
          "Clean heat exchanger coils & replace anti-bacterial air filters",
          "Verify digital thermostat sensor calibration & air velocity output"
        ];
      case 'Plumbing':
        return [
          "Inspect piping joints for microscopic humidity & pressure leaks",
          "Clean faucet aerator screen & verify laminar flow rate",
          "Test main emergency shutoff valve operation & seal integrity",
          "Snake secondary drain lines to clear potential residue blockages"
        ];
      case 'Electrical':
        return [
          "Verify Ground Fault Circuit Interrupter (GFCI) trip speed & load limits",
          "Audit circuit breaker panel temperatures (thermal check for hot spots)",
          "Torque terminal connection screws to manufacturer specifications",
          "Test voltage fluctuation levels under maximum suite appliance load"
        ];
      default:
        return [
          "Inspect drywall backing for dampness, humidity, or structural cracks",
          "Verify magnetic door lock alignment & strike plates clearance",
          "Lubricate heavy door hinge pin sleeves & adjust pneumatic closers",
          "Audit window weather seals and frame draft resilience"
        ];
    }
  };

  // Group tickets into Kanban columns
  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');
  const resolvedTickets = tickets.filter(t => t.status === 'COMPLETED');

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Engineering Matrix...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1E36] border-slate-200 dark:border-slate-800">
      
      {/* Title Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse text-red-500" /> Facilities Engineering Hub
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1">Maintenance & Repairs</h1>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Column 1: Pending Triage */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-[#132135]/40 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Pending Triage</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">
              {pendingTickets.length}
            </span>
          </div>

          <div className="space-y-4">
            {pendingTickets.map(t => {
              const cat = getAssetCategory(t.issue_title, t.description);
              const isLOTO = t.is_locked === 1;

              return (
                <div key={t.id} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">Suite {t.room_number}</span>
                      <span className="text-[10px] text-slate-500 block">{cat} Category</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      t.priority === 'EMERGENCY' ? 'bg-red-500/10 text-red-650' : 'bg-amber-500/10 text-amber-600'
                    }`}>{t.priority}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{t.issue_title}</p>
                  
                  {isLOTO && (
                    <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" /> LOTO LOCKOUT ACTIVE
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200/40 dark:border-slate-850 flex justify-between items-center gap-2">
                    <button
                      onClick={() => handleToggleLockout(t)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[8px] font-bold uppercase transition ${
                        isLOTO ? 'bg-red-650 border-red-600 text-white' : 'border-red-500/40 text-red-500 dark:text-red-400'
                      }`}
                    >
                      LOTO Lock
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-[#0F3D6E] dark:bg-amber-500 hover:bg-[#14355E] dark:hover:bg-amber-600 text-white dark:text-[#08203E] text-[9px] font-bold uppercase flex items-center gap-1"
                    >
                      Start Repair <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-[#132135]/40 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-500">In Progress</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
              {inProgressTickets.length}
            </span>
          </div>

          <div className="space-y-4">
            {inProgressTickets.map(t => {
              const cat = getAssetCategory(t.issue_title, t.description);
              const isLOTO = t.is_locked === 1;

              return (
                <div key={t.id} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">Suite {t.room_number}</span>
                      <span className="text-[10px] text-slate-500 block">{cat} Category</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-550 uppercase">Active fix</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{t.issue_title}</p>
                  
                  {isLOTO && (
                    <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-[9px] font-bold uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" /> LOTO LOCKOUT ACTIVE
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200/40 dark:border-slate-850 flex justify-between items-center gap-2">
                    <button
                      onClick={() => handleToggleLockout(t)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[8px] font-bold uppercase transition ${
                        isLOTO ? 'bg-red-650 border-red-600 text-white' : 'border-red-500/40 text-red-500 dark:text-red-400'
                      }`}
                    >
                      LOTO Lock
                    </button>
                    <button
                      onClick={() => {
                        setActiveChecklistTicket(t);
                        setChecklistChecked([false, false, false, false]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Complete Fix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 3: Resolved */}
        <div className="space-y-4 bg-slate-50/50 dark:bg-[#132135]/40 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/40">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-500">Resolved Today</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
              {resolvedTickets.length}
            </span>
          </div>

          <div className="space-y-4">
            {resolvedTickets.map(t => {
              const cat = getAssetCategory(t.issue_title, t.description);
              return (
                <div key={t.id} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-3 shadow-sm opacity-70">
                  <div className="flex justify-between items-start">
                    <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">Suite {t.room_number}</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-650 uppercase">Closed</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-400 font-semibold">{t.issue_title}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Incident Audit & Supply Requisition Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        
        {/* Incident Audit Reporter Form */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><FileText className="w-5 h-5 text-[#D4AF37]" /> Facility Incident Reporter</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Log an immediate maintenance ticket to update status board.</p>
          </div>

          <form onSubmit={handleReportIssue} className="space-y-3 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Room Number</label>
                <select
                  value={newRoomId}
                  onChange={e => setNewRoomId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose Room --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>Suite {r.room_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Priority Severity</label>
                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="NORMAL">NORMAL (PLANNED)</option>
                  <option value="URGENT">URGENT (REPAIR)</option>
                  <option value="EMERGENCY">EMERGENCY (LOTO LOCKOUT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Issue Title Summary</label>
              <input 
                type="text"
                required
                placeholder="E.g. AC leaking condensation water"
                value={newIssueTitle}
                onChange={e => setNewIssueTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detailed Description</label>
              <textarea 
                placeholder="Describe part defects or emergency lockout requirements..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                rows="2"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={reportingIssue}
              className="w-full btn-gold !py-3 font-bold uppercase text-[10px] tracking-wider mt-2 hover:scale-[1.01] transition shadow-lg"
            >
              {reportingIssue ? 'Filing incident...' : 'Log Facility Incident'}
            </button>
          </form>
        </div>

        {/* Parts Requisition Logs & Supply request Form */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Settings className="w-5 h-5 text-[#D4AF37]" /> Engineering Supply Request Requisitions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Request specialized turnaround parts from storage inventory logs.</p>
          </div>

          <form onSubmit={handleCreateSupplyRequest} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold items-end pb-4 border-b border-slate-200/40 dark:border-slate-800">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Room / Location</label>
              <input 
                type="text" 
                required 
                placeholder="E.g. Room 104"
                value={supplyRoomNo}
                onChange={e => setSupplyRoomNo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Part / Ballast name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="LED ballast, filter, cartridge"
                  value={supplyPartName}
                  onChange={e => setSupplyPartName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <button type="submit" className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#D4AF37] hover:text-[#08203E] dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 transition">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Active supply logs list */}
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {partsRequests.map(r => (
              <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-200/30 dark:border-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{r.part}</span>
                  <span className="text-[10px] text-slate-500 block font-mono">Location: {r.roomNumber}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                  r.status === 'DISPATCHED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Preventive Maintenance Checklist Modal */}
      {activeChecklistTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> Preventive Turnaround Checklist
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Suite {activeChecklistTicket.room_number} Sign-off</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveChecklistTicket(null);
                  setChecklistChecked([false, false, false, false]);
                }}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <p className="text-slate-500">
                Acknowledge and verify the following technical compliance standards before releasing this room back to active inventory:
              </p>

              {getPreventiveChecklist(getAssetCategory(activeChecklistTicket.issue_title, activeChecklistTicket.description)).map((item, idx) => (
                <label 
                  key={idx} 
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={checklistChecked[idx]}
                    onChange={() => {
                      const copy = [...checklistChecked];
                      copy[idx] = !copy[idx];
                      setChecklistChecked(copy);
                    }}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-slate-300 dark:border-slate-700 mt-0.5"
                  />
                  <span className="leading-relaxed">{item}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveChecklistTicket(null);
                  setChecklistChecked([false, false, false, false]);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!checklistChecked.every(v => v)}
                onClick={handleResolveTicket}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${
                  checklistChecked.every(v => v)
                    ? 'btn-gold shadow-lg cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                }`}
              >
                Sign Off & Release Key
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
