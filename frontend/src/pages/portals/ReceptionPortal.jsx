import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { 
  Search, 
  UserCheck, 
  Key, 
  FileText, 
  CheckCircle, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  DollarSign, 
  ClipboardList, 
  Bell, 
  AlertTriangle 
} from 'lucide-react';

export default function ReceptionPortal() {
  const { user } = useContext(AuthContext);
  const branchId = user?.branch_id || 1; // Default to Udaipur Palace (1)

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Folio incidentals state (simulates real-time hotel room charges)
  const [roomCharges, setRoomCharges] = useState({
    'UDA-101': [
      { item: 'In-Room Awadhi Heritage Dinner', amount: 4800 },
      { item: 'Dry Cleaning Service', amount: 1200 }
    ],
    'UDA-102': [
      { item: 'Ayurvedic Massage Treatment', amount: 8500 }
    ]
  });

  // Modal / Interaction states
  const [activeCheckInBooking, setActiveCheckInBooking] = useState(null);
  const [selectedCheckInRoomId, setSelectedCheckInRoomId] = useState('');
  
  const [activeCheckOutBooking, setActiveCheckOutBooking] = useState(null);
  
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInGuestName, setWalkInGuestName] = useState('');
  const [walkInRoomTypeId, setWalkInRoomTypeId] = useState('');
  const [walkInRoomId, setWalkInRoomId] = useState('');
  const [walkInNights, setWalkInNights] = useState('1');

  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeRoomNumber, setChargeRoomNumber] = useState('');
  const [chargeItemName, setChargeItemName] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, [branchId]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('http://localhost:5000/api/bookings'),
      axios.get(`http://localhost:5000/api/rooms?branchId=${branchId}`)
    ])
    .then(([bookingsRes, roomsRes]) => {
      // Filter bookings for this branch
      const localBookings = (bookingsRes.data.bookings || []).filter(b => b.branch_id === Number(branchId));
      setBookings(localBookings);
      setRooms(roomsRes.data.rooms || []);
      setLoading(false);
    })
    .catch(err => {
      console.error('Fetch front desk error:', err);
      setLoading(false);
    });
  };

  // Check-In submission executing Room Assignment and Room state change
  const handleConfirmCheckIn = async (bookingId, roomId) => {
    if (!roomId) {
      alert('Please select a vacant clean room to allocate.');
      return;
    }
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: 'CHECKED_IN',
        assigned_room_id: roomId
      });
      setActiveCheckInBooking(null);
      setSelectedCheckInRoomId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Check-in failed.');
    }
  };

  // Express Check-Out releasing room and dispatching turnaround tasks
  const handleConfirmCheckOut = async (bookingId, roomId) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        status: 'CHECKED_OUT',
        assigned_room_id: roomId
      });
      
      // Clear incidentals for this room since guest settled bill
      const roomObj = rooms.find(r => r.id === roomId);
      if (roomObj) {
        setRoomCharges(prev => {
          const next = { ...prev };
          delete next[roomObj.room_number];
          return next;
        });
      }

      setActiveCheckOutBooking(null);
      fetchData();
    } catch (err) {
      alert('Check-out failed.');
    }
  };

  // Post dynamic folio charge to specific room number
  const handlePostCharge = (e) => {
    e.preventDefault();
    if (!chargeRoomNumber || !chargeItemName || !chargeAmount) return;

    setRoomCharges(prev => {
      const current = prev[chargeRoomNumber] || [];
      return {
        ...prev,
        [chargeRoomNumber]: [...current, { item: chargeItemName, amount: Number(chargeAmount) }]
      };
    });

    setChargeRoomNumber('');
    setChargeItemName('');
    setChargeAmount('');
    setChargeOpen(false);
    alert('Folio charge posted successfully.');
  };

  // Log immediate Walk-in Reservation
  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInGuestName || !walkInRoomId) return;

    try {
      const roomObj = rooms.find(r => r.id === Number(walkInRoomId));
      const roomTypeSelected = roomTypesUnique.find(t => t.id === Number(walkInRoomTypeId)) || {};
      
      const baseAmount = Number(roomTypeSelected.nightly_rate || 45000) * Number(walkInNights);
      const cgst = baseAmount * 0.09;
      const sgst = baseAmount * 0.09;
      const totalAmount = baseAmount + cgst + sgst;

      // Post walk-in booking
      await axios.post('http://localhost:5000/api/bookings', {
        branchId: Number(branchId),
        roomTypeId: Number(walkInRoomTypeId),
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: new Date(Date.now() + Number(walkInNights) * 24 * 60 * 60 * 1500).toISOString().split('T')[0], // 24 hours per day
        adults: 2,
        children: 0,
        roomsCount: 1,
        specialRequests: 'Walk-In registration',
        guestDetails: { 
          firstName: walkInGuestName.trim().split(' ')[0], 
          lastName: walkInGuestName.trim().split(' ').slice(1).join(' ') || '', 
          email: 'walkin@guest.com', 
          phone: '+91 99999 88888' 
        },
        paymentMethod: 'Pay at Hotel',
        assignedRoomId: Number(walkInRoomId)
      });

      setWalkInGuestName('');
      setWalkInRoomId('');
      setWalkInOpen(false);
      fetchData();
    } catch (err) {
      console.error('Walk-in check-in error details:', err);
      alert('Walk-in check-in failed.');
    }
  };

  const filteredBookings = search
    ? bookings.filter(b => (b.guest_name || '').toLowerCase().includes(search.toLowerCase()) || b.booking_ref.toLowerCase().includes(search.toLowerCase()))
    : bookings;

  // Filter expected arrivals today
  const todayStr = new Date().toISOString().split('T')[0];
  const expectedArrivals = filteredBookings.filter(b => b.status === 'CONFIRMED');
  const activeStays = filteredBookings.filter(b => b.status === 'CHECKED_IN');

  // Group unique room types from branch rooms
  const roomTypesUnique = rooms.reduce((acc, current) => {
    const exists = acc.find(item => item.id === current.room_type_id);
    if (!exists) {
      acc.push({
        id: current.room_type_id,
        name: current.type_name,
        nightly_rate: current.nightly_rate
      });
    }
    return acc;
  }, []);

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Front Desk...</div>;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1E36] border-slate-200 dark:border-slate-800">
      
      {/* Top Banner Hub Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> High-Velocity Front Desk PMS
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1">Receptionist Desk</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setWalkInOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F3D6E] dark:bg-[#D4AF37] hover:bg-[#14355E] text-white dark:text-[#08203E] font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Log Walk-In Guest
          </button>
          <button 
            onClick={() => setChargeOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-[#D4AF37] text-[#D4AF37] font-bold text-xs hover:bg-[#D4AF37]/10 transition flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" /> Post Folio Charge
          </button>
        </div>
      </div>

      {/* Main Room Status Board */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-slate-800 pb-3 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">Interactive Room Matrix</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time status board of physical keys, categories, and maintenance lockout locks.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vacant-Clean
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Occupied
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dirty
            </span>
            <span className="flex items-center gap-1.5 text-red-650 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Out of Order
            </span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {rooms.map(room => {
            const isLOTO = room.is_locked === 1;
            let statusColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
            let statusLabel = "Vacant-Clean";

            if (isLOTO || room.status === 'MAINTENANCE') {
              statusColor = "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400";
              statusLabel = "Out of Order";
            } else if (room.status === 'OCCUPIED') {
              statusColor = "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400";
              statusLabel = "Occupied";
            } else if (room.status === 'CLEANING') {
              statusColor = "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
              statusLabel = "Dirty";
            }

            // Fetch active incidentals sum
            const charges = roomCharges[room.room_number] || [];
            const chargesSum = charges.reduce((sum, item) => sum + item.amount, 0);

            return (
              <div
                key={room.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 bg-white dark:bg-[#132135] transition duration-200 ${statusColor}`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">{room.room_number}</span>
                    {isLOTO && <ShieldAlert className="w-4 h-4 text-red-500" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{room.type_name}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/20 text-[9px] uppercase font-bold tracking-wider">
                  <span>{statusLabel}</span>
                  {chargesSum > 0 && (
                    <span className="text-amber-600 font-mono">+₹{chargesSum}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guest Bookings & Expected Arrivals Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Arrivals Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold">Today's Expected Arrivals</h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
              {expectedArrivals.length} Arrivals
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[9px] pb-2">
                  <th className="py-2">Guest</th>
                  <th className="py-2">Suites Category</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {expectedArrivals.map(b => (
                  <tr key={b.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-3">
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">{b.guest_name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{b.booking_ref}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 font-medium">{b.room_type_name}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setActiveCheckInBooking(b);
                          setSelectedCheckInRoomId('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] uppercase hover:bg-emerald-700 transition"
                      >
                        Process Check-In
                      </button>
                    </td>
                  </tr>
                ))}
                {expectedArrivals.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 italic">No expected arrivals queued for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Stays & Check-outs Table */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold">Active Stay Roster</h3>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">
              {activeStays.length} Stays
            </span>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[9px] pb-2">
                  <th className="py-2">Guest / Room</th>
                  <th className="py-2">Stay Period</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {activeStays.map(b => {
                  const allocatedRoom = rooms.find(r => r.id === b.assigned_room_id);
                  const roomNo = allocatedRoom ? allocatedRoom.room_number : 'Unassigned';

                  return (
                    <tr key={b.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3">
                        <span className="font-semibold block text-slate-900 dark:text-slate-100">{b.guest_name}</span>
                        <span className="text-[10px] text-[#D4AF37] font-bold">Room {roomNo}</span>
                      </td>
                      <td className="py-3 text-slate-500 font-medium font-mono">{b.check_in_date} → {b.check_out_date}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setActiveCheckOutBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[10px] uppercase hover:bg-amber-700 transition"
                        >
                          Express Check-Out
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {activeStays.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 italic">No guests checked-in currently.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Smart Check-In allocation Modal (Fixes the Room 1 bug) */}
      {activeCheckInBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Guest Check-In Assistant
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Assign Suite Key</h3>
              </div>
              <button 
                onClick={() => setActiveCheckInBooking(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1E36] border border-slate-200/50 dark:border-slate-800 space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Guest Details:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeCheckInBooking.guest_name}</p>
                <p className="text-slate-500">Reserved Category: <span className="text-[#D4AF37] font-bold">{activeCheckInBooking.room_type_name}</span></p>
              </div>

              {/* Filtering Logic: Filter rooms matching room_type_id and are Vacant-Clean */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Available Vacant-Clean Suite:</label>
                <select
                  value={selectedCheckInRoomId}
                  onChange={e => setSelectedCheckInRoomId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose a Suite --</option>
                  {rooms
                    .filter(r => r.room_type_id === activeCheckInBooking.room_type_id && r.status === 'AVAILABLE' && r.is_locked !== 1)
                    .map(r => (
                      <option key={r.id} value={r.id}>Suite {r.room_number} (Floor {r.floor})</option>
                    ))
                  }
                </select>
                
                {rooms.filter(r => r.room_type_id === activeCheckInBooking.room_type_id && r.status === 'AVAILABLE' && r.is_locked !== 1).length === 0 && (
                  <p className="text-[10px] text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 mt-2 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    No Vacant-Clean suites of this category are currently available. Check housekeeping.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCheckInBooking(null)}
                className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedCheckInRoomId}
                onClick={() => handleConfirmCheckIn(activeCheckInBooking.id, selectedCheckInRoomId)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${
                  selectedCheckInRoomId
                    ? 'btn-gold shadow-lg cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                }`}
              >
                Confirm Allocation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Express Check-Out Billing Modal (With folio calculations) */}
      {activeCheckOutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Folio Billing & Settlement
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Express Check-Out</h3>
              </div>
              <button 
                onClick={() => setActiveCheckOutBooking(null)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Folio computations */}
            <div className="space-y-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1E36] border border-slate-200/50 dark:border-slate-800 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Stay Details:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeCheckOutBooking.guest_name}</p>
                <p className="text-slate-550">Room Number: <span className="font-bold text-slate-900 dark:text-slate-100">Suite {rooms.find(r => r.id === activeCheckOutBooking.assigned_room_id)?.room_number || 'Unassigned'}</span></p>
                <p className="text-slate-550">Room Base Total: <span className="font-mono">₹{Number(activeCheckOutBooking.total_amount).toLocaleString('en-IN')}</span></p>
              </div>

              {/* Incidental Charges listing */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Incidentals & Folio Charges:</span>
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] space-y-2">
                  {(roomCharges[rooms.find(r => r.id === activeCheckOutBooking.assigned_room_id)?.room_number] || []).map((ch, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-800 dark:text-slate-200 font-medium">
                      <span>{ch.item}</span>
                      <span className="font-mono text-slate-900 dark:text-slate-100">₹{ch.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {(roomCharges[rooms.find(r => r.id === activeCheckOutBooking.assigned_room_id)?.room_number] || []).length === 0 && (
                    <p className="text-slate-500 italic">No extra dining or services charges posted to this room.</p>
                  )}
                </div>
              </div>

              {/* Folio sum settlement calculation */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-slate-100">
                <span>Final Settlement Total:</span>
                <span className="text-[#D4AF37] font-serif">
                  ₹{(
                    Number(activeCheckOutBooking.total_amount) +
                    (roomCharges[rooms.find(r => r.id === activeCheckOutBooking.assigned_room_id)?.room_number] || [])
                      .reduce((sum, item) => sum + item.amount, 0)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCheckOutBooking(null)}
                className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmCheckOut(activeCheckOutBooking.id, activeCheckOutBooking.assigned_room_id)}
                className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md"
              >
                Settled & Check-Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Log Walk-In Modal */}
      {walkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Reception Desk Quick actions
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Walk-In Registration</h3>
              </div>
              <button 
                onClick={() => setWalkInOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Guest Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="E.g. Vikram Malhotra"
                  value={walkInGuestName}
                  onChange={e => setWalkInGuestName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Category Type</label>
                  <select 
                    value={walkInRoomTypeId} 
                    onChange={e => setWalkInRoomTypeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">-- Choose Category --</option>
                    {roomTypesUnique.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nights Count</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={walkInNights} 
                    onChange={e => setWalkInNights(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Available Room Key</label>
                <select 
                  value={walkInRoomId} 
                  onChange={e => setWalkInRoomId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Select Vacant Clean Room --</option>
                  {rooms
                    .filter(r => r.room_type_id === Number(walkInRoomTypeId) && r.status === 'AVAILABLE' && r.is_locked !== 1)
                    .map(r => (
                      <option key={r.id} value={r.id}>Suite {r.room_number}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setWalkInOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!walkInRoomId}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${
                    walkInRoomId
                      ? 'btn-gold shadow-lg cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                  }`}
                >
                  Register & Check-In
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Post Folio Charge Modal */}
      {chargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> Folio Billing Assistant
                </span>
                <h3 className="font-serif text-2xl font-bold mt-1">Post Folio Incidental Charge</h3>
              </div>
              <button 
                onClick={() => setChargeOpen(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostCharge} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Select Occupied Room</label>
                <select 
                  value={chargeRoomNumber}
                  onChange={e => setChargeRoomNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose Suite --</option>
                  {rooms
                    .filter(r => r.status === 'OCCUPIED')
                    .map(r => (
                      <option key={r.id} value={r.room_number}>Suite {r.room_number}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Charge Item / Description</label>
                <input 
                  type="text" 
                  required 
                  placeholder="E.g. Room Service Lunch, Valet, Laundry"
                  value={chargeItemName}
                  onChange={e => setChargeItemName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Amount (INR ₹)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="2500"
                  value={chargeAmount}
                  onChange={e => setChargeAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setChargeOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-350 dark:border-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!chargeRoomNumber}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition ${
                    chargeRoomNumber
                      ? 'btn-gold shadow-lg cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                  }`}
                >
                  Post Folio Charge
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
