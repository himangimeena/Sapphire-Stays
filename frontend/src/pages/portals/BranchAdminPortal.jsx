import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Briefcase, 
  Home, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Plus, 
  Info,
  ShieldCheck,
  Truck
} from 'lucide-react';

export default function BranchAdminPortal() {
  const { user } = useContext(AuthContext);
  const branchId = user?.branch_id || 1; // Default to Udaipur (1) for pre-loaded account
  const branchName = user?.branch_name || 'Sapphire Palace Udaipur';

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab management
  const [activeTab, setActiveTab] = useState('inventory');

  // Dynamic Rate Plan Modifier state
  const [surcharges, setSurcharges] = useState({
    1: 0, // Lakeview Standard Haven
    2: 0, // Royal Courtyard Suite
    3: 0  // Maharaja Imperial Pavilion
  });
  const [selectedRoomTypeRate, setSelectedRoomTypeRate] = useState('1');
  const [surchargeValue, setSurchargeValue] = useState('');

  // Booking Calculator Simulation state
  const [simRoomType, setSimRoomType] = useState('1');
  const [simNights, setSimNights] = useState('1');
  const [simRoomsCount, setSimRoomsCount] = useState('1');

  // Local Inventory Supplies stock
  const [supplies, setSupplies] = useState([
    { id: 'linen', name: '800-Thread Egyptian Cotton Sheets', category: 'Linen', qty: 14, min: 20, unit: 'Sets' },
    { id: 'minibar', name: 'Premium Single Malt & Champagne Stock', category: 'Minibar', qty: 45, min: 15, unit: 'Bottles' },
    { id: 'toiletries', name: 'Organic Ayurvedic Sandalwood Soaps', category: 'Amenities', qty: 8, min: 30, unit: 'Units' },
    { id: 'glassware', name: 'Hand-Cut Crystal Cognac Snifters', category: 'Glassware', qty: 24, min: 10, unit: 'Pairs' }
  ]);

  // Mock staff registry local to this branch
  const localStaff = [
    { name: 'Ananya Sharma', role: 'RECEPTIONIST', shift: 'Morning', status: 'ON_DUTY' },
    { name: 'Julian D.', role: 'HOUSEKEEPING', shift: 'Morning', status: 'ON_DUTY' },
    { name: 'Rajesh Kumar', role: 'MAINTENANCE', shift: 'Morning', status: 'ON_DUTY' }
  ];

  useEffect(() => {
    fetchBranchData();
  }, [branchId]);

  const fetchBranchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`http://localhost:5000/api/rooms?branchId=${branchId}`),
      axios.get('http://localhost:5000/api/bookings'),
      axios.get('http://localhost:5000/api/operations/housekeeping'),
      axios.get('http://localhost:5000/api/operations/maintenance')
    ]).then(([resRooms, resBookings, resHousekeeping, resMaintenance]) => {
      setRooms(resRooms.data.rooms || []);
      
      // Filter bookings, housekeeping and maintenance belonging to this branch
      const localBookings = (resBookings.data.bookings || []).filter(b => b.branch_id === Number(branchId));
      setBookings(localBookings);
      
      // Filter tasks associated with rooms of this branch
      const roomIds = (resRooms.data.rooms || []).map(r => r.id);
      
      const localHK = (resHousekeeping.data.tasks || []).filter(t => roomIds.includes(t.room_id));
      setHousekeeping(localHK);

      const localMaint = (resMaintenance.data.tickets || []).filter(t => roomIds.includes(t.room_id));
      setMaintenance(localMaint);

      setLoading(false);
    }).catch(err => {
      console.error('Failed to load local branch analytics:', err);
      setError('Failed to load branch analytics. The server may be offline.');
      setLoading(false);
    });
  };

  const handleUpdateSurcharge = (e) => {
    e.preventDefault();
    if (surchargeValue === '') return;
    setSurcharges(prev => ({
      ...prev,
      [selectedRoomTypeRate]: Number(surchargeValue)
    }));
    setSurchargeValue('');
  };

  const handleRestockSupply = (supplyId) => {
    setSupplies(prev => prev.map(s => {
      if (s.id === supplyId) {
        return { ...s, qty: s.qty + 30 }; // Restock with a dynamic lot addition of 30 units
      }
      return s;
    }));
  };

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Branch Control Console...</div>;

  if (error) {
    return (
      <div className="py-24 text-center space-y-6 max-w-md mx-auto px-4">
        <h2 className="font-serif text-2xl font-bold text-red-600 dark:text-red-400">Connection Error</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{error}</p>
        <button 
          onClick={fetchBranchData}
          className="btn-gold !py-3 !px-8 text-xs font-bold transition hover:scale-[1.02] shadow-lg w-full"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Local property inventory calculations (.filter() & .reduce())
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
  const dirtyRooms = rooms.filter(r => r.status === 'CLEANING').length;
  const maintenanceLocked = rooms.filter(r => r.is_locked === 1).length;

  const localOccupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Today's Date helpers to calculate arrivals/departures
  const todayStr = new Date().toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
  const arrivalsToday = bookings.filter(b => b.check_in_date === todayStr && b.status === 'CONFIRMED').length;
  const departuresToday = bookings.filter(b => b.check_out_date === todayStr && b.status === 'CHECKED_IN').length;

  // Get distinct local room types
  const uniqueRoomTypes = rooms.reduce((acc, current) => {
    const exists = acc.find(item => item.room_type_id === current.room_type_id);
    if (!exists) {
      acc.push({
        room_type_id: current.room_type_id,
        name: current.type_name,
        nightly_rate: current.nightly_rate
      });
    }
    return acc;
  }, []);

  // Simulator Rates Calculation
  const selectedSimTypeObj = uniqueRoomTypes.find(rt => rt.room_type_id === Number(simRoomType)) || uniqueRoomTypes[0] || {};
  const simBasePrice = Number(selectedSimTypeObj.nightly_rate || 45000);
  const simSurchargePct = surcharges[simRoomType] || 0;
  const simAdjustedNightRate = simBasePrice * (1 + simSurchargePct / 100);
  
  const simSubtotal = simAdjustedNightRate * Number(simNights) * Number(simRoomsCount);
  const simGST = simSubtotal * 0.18; // India luxury hotel GST is 18%
  const simTotal = simSubtotal + simGST;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1E36] border-slate-200 dark:border-slate-800">
      
      {/* Top Banner Control Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Palace Manager Control Room
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">{branchName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchBranchData} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" />
          </button>
          <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            Operational Hub Status: 100% Online
          </span>
        </div>
      </div>

      {/* Local Property Inventory Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Live Occupancy Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-4xl font-bold text-slate-900 dark:text-slate-100">{localOccupancyRate}%</span>
            <span className="text-xs text-slate-400 font-semibold">{occupiedRooms} / {totalRooms} Suites</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Dirty Turnaround Queue</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-4xl font-bold text-amber-500">{dirtyRooms} Suites</span>
            <span className="text-xs text-slate-400 font-semibold">Housekeeping pending</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Today's Check-ins</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-4xl font-bold text-[#0F3D6E] dark:text-amber-300">{arrivalsToday} Guests</span>
            <span className="text-xs text-slate-400 font-semibold">Confirmed arrivals</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Maintenance Lockouts</span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-4xl font-bold text-red-500">{maintenanceLocked} Suites</span>
            <span className="text-xs text-slate-400 font-semibold">Safety LOTO locks active</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 transition ${
            activeTab === 'inventory' 
              ? 'border-[#D4AF37] text-[#D4AF37]' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Room Status & Pricing
        </button>
        <button
          onClick={() => setActiveTab('supplies')}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 transition ${
            activeTab === 'supplies' 
              ? 'border-[#D4AF37] text-[#D4AF37]' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Procurement & Supplies
        </button>
      </div>

      {/* Tab Panel 1: Room Status & Dynamic Yield Control */}
      {activeTab === 'inventory' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* Dynamic Rate plan Modifier & Live simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Surcharge Modifier Form */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-4 text-slate-900 dark:text-slate-100">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Settings className="w-5 h-5 text-[#D4AF37]" /> Dynamic Rate Plan Modifier</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Adjust room multipliers for peak occupancy or local festivals.</p>
              </div>

              <form onSubmit={handleUpdateSurcharge} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Room Type</label>
                  <select 
                    value={selectedRoomTypeRate}
                    onChange={e => setSelectedRoomTypeRate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {uniqueRoomTypes.map(rt => (
                      <option key={rt.room_type_id} value={rt.room_type_id}>{rt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Temporary Surcharge / Multiplier (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 15 for +15%"
                      value={surchargeValue}
                      onChange={e => setSurchargeValue(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                    <span className="absolute right-3 top-3 font-bold text-slate-400">%</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full btn-gold !py-3 font-bold uppercase text-[10px] tracking-wider mt-2 hover:scale-[1.01] transition shadow-lg"
                >
                  Apply Yield Adjustment
                </button>
              </form>
            </div>

            {/* Live Booking Calculator Simulator */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><DollarSign className="w-5 h-5 text-[#D4AF37]" /> Live Booking Price Simulator</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review live rates including the dynamic yield adjustment and India GST (18%) taxation.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-semibold pt-1">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Room Type</label>
                  <select 
                    value={simRoomType}
                    onChange={e => setSimRoomType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {uniqueRoomTypes.map(rt => (
                      <option key={rt.room_type_id} value={rt.room_type_id}>{rt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nights</label>
                  <input 
                    type="number"
                    min="1"
                    value={simNights}
                    onChange={e => setSimNights(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Suites count</label>
                  <input 
                    type="number"
                    min="1"
                    value={simRoomsCount}
                    onChange={e => setSimRoomsCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Calculation details summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1E36] border border-slate-200/50 dark:border-slate-800 space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Standard Suite Rate (Nightly):</span>
                  <span>₹{simBasePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Palace Surcharge ({simSurchargePct}% yield applied):</span>
                  <span className="text-[#D4AF37] font-bold">+ ₹{(simBasePrice * simSurchargePct / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 border-t border-slate-200/40 dark:border-slate-800 pt-2">
                  <span>Adjusted Rate / Night:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{simAdjustedNightRate.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>Subtotal ({simNights} Nights • {simRoomsCount} Room):</span>
                  <span>₹{simSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span>India Luxury GST (18% Total):</span>
                  <span>₹{simGST.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/40 dark:border-slate-800 pt-2 font-bold text-sm">
                  <span>Estimated Total Quote:</span>
                  <span className="text-[#D4AF37] font-serif">₹{simTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Local Room Status board list */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
            <div>
              <h3 className="font-serif text-xl font-bold">Room Inventory & Status Board</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Live overview of physical suite keys, active rates, and operational cleaning states.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map(r => {
                const isLOTO = r.is_locked === 1;
                const surcharge = surcharges[r.room_type_id] || 0;
                const adjustedNightlyRate = Number(r.nightly_rate) * (1 + surcharge / 100);

                let statusBadgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                if (isLOTO) {
                  statusBadgeColor = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
                } else if (r.status === 'OCCUPIED') {
                  statusBadgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                } else if (r.status === 'CLEANING') {
                  statusBadgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                } else if (r.status === 'MAINTENANCE') {
                  statusBadgeColor = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                }

                return (
                  <div key={r.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0D1E36] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">Suite {r.room_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${statusBadgeColor}`}>
                        {isLOTO ? 'LOTO LOCKED' : r.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium block">{r.type_name}</p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{r.floor}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/80 flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Live Rate:</span>
                      <div className="text-right">
                        {surcharge > 0 && (
                          <span className="text-[9px] line-through text-slate-400 block">₹{Number(r.nightly_rate).toLocaleString('en-IN')}</span>
                        )}
                        <span className="text-[#0F3D6E] dark:text-amber-300 font-serif font-bold">₹{Math.round(adjustedNightlyRate).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Staff Dispatch Tracker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Staff Registry */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Users className="w-5 h-5 text-[#D4AF37]" /> Local On-Duty Staff</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Staff directory assigned strictly to this branch roster.</p>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[9px] pb-2">
                      <th className="py-2">Employee Name</th>
                      <th className="py-2">Roster Role</th>
                      <th className="py-2">Active Shift</th>
                      <th className="py-2 text-right">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {localStaff.map((s, idx) => (
                      <tr key={idx} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-[#08203E]/10 dark:bg-amber-500/10 text-[#0F3D6E] dark:text-amber-400 font-bold uppercase text-[9px]">
                            {s.role}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 font-medium">{s.shift}</td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Turnaround bottleneck tracking ticker */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Operations Turnaround Ticker</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Live queue status and Turnaround tracking bottlenecks.</p>
              </div>

              <div className="space-y-4 font-semibold text-xs pt-1">
                <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                  <span>Housekeeping Tasks Queued:</span>
                  <span className="font-mono text-amber-500 text-sm font-bold">{housekeeping.filter(t => t.status !== 'COMPLETED').length} tasks</span>
                </div>
                <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                  <span>Maintenance Alerts Pending:</span>
                  <span className="font-mono text-red-500 text-sm font-bold">{maintenance.filter(t => t.status !== 'COMPLETED').length} tickets</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1E36] border border-slate-200/50 dark:border-slate-800 space-y-2 text-[10px]">
                  <span className="uppercase font-bold text-slate-500 block">Queue Bottleneck Status:</span>
                  {dirtyRooms > 2 ? (
                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>{dirtyRooms} dirty suites waiting. Restock supplies below.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Housekeeping queues are optimal. Ready to take check-ins.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Panel 2: Procurement & Supplies */}
      {activeTab === 'supplies' && (
        <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
          
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
            <div>
              <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Truck className="w-5 h-5 text-[#D4AF37]" /> Local Supplies & Linen Inventory</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Audit essential hotel assets and verify stock levels against the safe reorder thresholds.</p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[9px] pb-2">
                    <th className="py-2">Supply Asset</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Stock Level</th>
                    <th className="py-2">Min Threshold</th>
                    <th className="py-2">Stock Alert Status</th>
                    <th className="py-2 text-right">Procurement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {supplies.map(s => {
                    const isLow = s.qty < s.min;
                    return (
                      <tr key={s.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                        <td className="py-3.5 text-slate-500 font-semibold">{s.category}</td>
                        <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{s.qty} {s.unit}</td>
                        <td className="py-3.5 font-mono text-slate-500">{s.min} {s.unit}</td>
                        <td className="py-3.5">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1 w-max border border-red-500/20">
                              <AlertTriangle className="w-3 h-3 text-red-500" /> Low Stock / Reorder Needed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 w-max border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Stock Level Safe
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRestockSupply(s.id)}
                            className="px-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-700 text-[9px] font-bold uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#08203E] hover:border-[#D4AF37] dark:hover:text-[#08203E] transition"
                          >
                            Dispatch Restock (+30)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
