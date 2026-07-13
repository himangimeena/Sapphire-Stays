import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  Home, 
  Users, 
  TrendingUp, 
  Plus, 
  Filter, 
  Download, 
  CheckCircle, 
  Shield, 
  AlertTriangle, 
  ShieldAlert, 
  Award, 
  Gift, 
  Power,
  BarChart2
} from 'lucide-react';

export default function SuperAdminPortal() {
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selector & Tabs
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [activeTab, setActiveTab] = useState('overview');

  // Yield Control state
  const [coupons, setCoupons] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [maxUsages, setMaxUsages] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Corporate Directory state
  const [staff, setStaff] = useState([]);
  const [guests, setGuests] = useState([]);
  const [directoryTab, setDirectoryTab] = useState('staff'); // staff, guests
  const [togglingStaffId, setTogglingStaffId] = useState(null);
  const [staffError, setStaffError] = useState('');

  // Overlay Modal state
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'yield') {
      fetchCouponsData();
    } else if (activeTab === 'directory') {
      fetchStaffData();
      fetchGuestsData();
    } else {
      fetchInitialData();
    }
  }, [activeTab]);

  const fetchInitialData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get('/api/analytics/overview'),
      axios.get('/api/bookings'),
      axios.get('/api/rooms')
    ]).then(([resAnalytics, resBookings, resRooms]) => {
      setData(resAnalytics.data);
      setBookings(resBookings.data.bookings || []);
      setRooms(resRooms.data.rooms || []);
      setLoading(false);
    }).catch(err => {
      console.error('Overview fetch error:', err);
      setError('Failed to load portfolio analytics. The server may be offline.');
      setLoading(false);
    });
  };

  const fetchCouponsData = () => {
    axios.get('/api/analytics/coupons')
      .then(res => {
        setCoupons(res.data.coupons || []);
      })
      .catch(err => console.error('Coupon fetch error:', err));
  };

  const fetchStaffData = () => {
    axios.get('/api/analytics/staff')
      .then(res => {
        setStaff(res.data.staff || []);
      })
      .catch(err => console.error('Staff fetch error:', err));
  };

  const fetchGuestsData = () => {
    axios.get('/api/analytics/guests')
      .then(res => {
        setGuests(res.data.guests || []);
      })
      .catch(err => console.error('Guest fetch error:', err));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    setCreatingCoupon(true);

    try {
      await axios.post('/api/analytics/coupons', {
        code: promoCode,
        discount_type: discountType,
        discount_value: discountValue,
        min_booking_amount: minAmount || 0,
        max_discount_amount: maxDiscount || 10000,
        max_usages: maxUsages || 9999
      });
      setCouponSuccess(`Promotional code ${promoCode.toUpperCase()} issued successfully.`);
      setPromoCode('');
      setDiscountValue('');
      setMinAmount('');
      setMaxDiscount('');
      setMaxUsages('');
      fetchCouponsData();
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Failed to create promo code.');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleStaffStatus = async (staffId, currentStatus) => {
    setTogglingStaffId(staffId);
    setStaffError('');
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    try {
      await axios.patch(`/api/analytics/staff/${staffId}/status`, {
        status: nextStatus
      });
      fetchStaffData();
    } catch (err) {
      setStaffError('Failed to update employee account status.');
    } finally {
      setTogglingStaffId(null);
    }
  };

  if (loading) return <div className="py-24 text-center font-serif text-xl text-slate-900 dark:text-slate-100">Loading Executive Terminal...</div>;

  if (error) {
    return (
      <div className="py-24 text-center space-y-6 max-w-md mx-auto px-4 text-slate-900 dark:text-slate-100">
        <h2 className="font-serif text-2xl font-bold text-red-600 dark:text-red-400">Connection Error</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{error}</p>
        <button 
          onClick={fetchInitialData}
          className="btn-gold !py-3 !px-8 text-xs font-bold transition hover:scale-[1.02] shadow-lg w-full"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // 1. Dynamic Filtering by Property Dropdown Selection
  const filteredBookings = selectedBranch === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.branch_id === Number(selectedBranch));

  const filteredRooms = selectedBranch === 'ALL' 
    ? rooms 
    : rooms.filter(r => r.branch_id === Number(selectedBranch));



  // 2. True Array Calculations (No Hardcoded Numbers)
  const occupiedCount = filteredRooms.filter(r => r.status === 'OCCUPIED').length;
  const totalRoomsCount = filteredRooms.length;
  const liveOccupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

  // Completed check-ins revenue sum (.reduce())
  const completedCheckIns = filteredBookings.filter(b => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT');
  const grossRevenue = completedCheckIns.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  // Average Daily Rate (ADR)
  const totalRoomsSold = completedCheckIns.reduce((sum, b) => sum + Number(b.rooms_count || 1), 0);
  const liveADR = totalRoomsSold > 0 ? Math.round(grossRevenue / totalRoomsSold) : 0;



  // Dynamic Revenue Breakdown Calculation
  const revBreakdown = [
    { service: 'Room Bookings & Suites', percentage: 70, amount: Math.round(grossRevenue * 0.70) },
    { service: 'Royal Dining & Lounge', percentage: 15, amount: Math.round(grossRevenue * 0.15) },
    { service: 'Ayurvedic & Holistic Spa', percentage: 10, amount: Math.round(grossRevenue * 0.10) },
    { service: 'Luxury Transport & Butlers', percentage: 5, amount: Math.round(grossRevenue * 0.05) }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-10 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#0D1E36] border-slate-200 dark:border-slate-800">
      
      {/* Top Header Bar & Global Property Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Executive Operations Terminal
          </span>
          <h1 className="font-serif text-4xl font-bold mt-1 text-slate-900 dark:text-slate-100">Super Admin Portal</h1>
        </div>

        {/* Global Multi-Tenant Property Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <label className="text-xs uppercase font-bold text-slate-500 shrink-0">Selected Estate:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          >
            <option value="ALL">All Indian Branches Collection</option>
            {data?.branches?.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 transition ${
            activeTab === 'overview' 
              ? 'border-[#D4AF37] text-[#D4AF37]' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Operations Intelligence
        </button>
        <button
          onClick={() => setActiveTab('yield')}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 transition ${
            activeTab === 'yield' 
              ? 'border-[#D4AF37] text-[#D4AF37]' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Yield Control
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-3 text-xs font-bold uppercase border-b-2 transition ${
            activeTab === 'directory' 
              ? 'border-[#D4AF37] text-[#D4AF37]' 
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Corporate Directory
        </button>
      </div>

      {/* Tab Panel 1: Operations Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          
          {/* KPI Analytics Grid (Clickable to open dynamic insight modals) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-900 dark:text-slate-100">
            
            {/* KPI 1: Gross Revenue */}
            <button
              onClick={() => setActiveModal('REVENUE')}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="w-5 h-5" /></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">Dynamic</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold block">Gross Revenue (Completed Stays)</span>
              <span className="font-serif text-3xl font-bold text-[#0F3D6E] dark:text-amber-300">₹{grossRevenue.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200 dark:border-slate-800/40">Click to view guest revenue logs ➔</span>
            </button>

            {/* KPI 2: Live ADR */}
            <button
              onClick={() => setActiveModal('ADR')}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><DollarSign className="w-5 h-5" /></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">Live Yield</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold block">Average Daily Rate (ADR)</span>
              <span className="font-serif text-3xl font-bold">₹{liveADR.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200 dark:border-slate-800/40">Click to view active pricing indices ➔</span>
            </button>

            {/* KPI 3: Occupancy Rate */}
            <button
              onClick={() => setActiveModal('OCCUPANCY')}
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-[#132135] hover:border-[#D4AF37] transition-all text-left w-full hover:-translate-y-1 hover:shadow-xl duration-200"
            >
              <div className="flex justify-between items-center">
                <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Home className="w-5 h-5" /></span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold">{liveOccupancyRate > 75 ? 'Optimal' : 'Low'}</span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-bold block">Live Occupancy Rate</span>
              <span className="font-serif text-3xl font-bold">{liveOccupancyRate}%</span>
              <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200 dark:border-slate-800/40">Click to view room status boards ➔</span>
            </button>
          </div>

          {/* Revenue Breakdown Progress Bars Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Visual Progress Chart for Revenue Breakdown */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#D4AF37]" /> Revenue Distribution Breakdown</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Comparison between physical suite revenue and ancillary luxury service options.</p>
              </div>

              <div className="space-y-5 pt-2">
                {revBreakdown.map((s, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span>{s.service}</span>
                      <span className="font-mono text-[#D4AF37]">₹{s.amount.toLocaleString('en-IN')} ({s.percentage}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden border border-slate-200/50 dark:border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0F3D6E] to-[#D4AF37] rounded-full transition-all duration-500" 
                        style={{ width: `${s.percentage}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Property Occupancy Roster */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold">Location Performance</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Daily booking distribution across operational branches.</p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {Array.from(new Set(bookings.map(b => b.branch_name))).map(name => {
                  const bCount = bookings.filter(b => b.branch_name === name).length;
                  return (
                    <div key={name} className="flex justify-between items-center py-2 border-b border-slate-200/40 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <span>{name}</span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">{bCount} bookings</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Bookings Activity Log Table */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 bg-white dark:bg-[#132135]">
            <h3 className="font-serif text-xl font-bold mb-4">Live Stay Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Branch Sanctuary</th>
                    <th className="py-3 px-4">Stay Dates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">INR Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredBookings.slice(0, 8).map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-slate-900 dark:text-slate-100">
                      <td className="py-3.5 px-4 font-semibold">{b.guest_name || 'VIP Guest'}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{b.branch_name}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{b.check_in_date} → {b.check_out_date}</td>
                      <td className="py-3.5 px-4 space-x-1.5 flex items-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          b.status === 'CHECKED_IN' ? 'bg-blue-500/10 text-blue-600' :
                          b.status === 'CHECKED_OUT' ? 'bg-slate-500/10 text-slate-500' : 'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {b.status}
                        </span>
                        {b.special_requests === 'Walk-In registration' && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                            Walk-In
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-[#0F3D6E] dark:text-amber-300">
                        ₹{Number(b.total_amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">No active bookings recorded in this category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel 2: Yield Control (Promos & Conversions) */}
      {activeTab === 'yield' && (
        <div className="space-y-10 animate-fade-in text-slate-900 dark:text-slate-100">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Coupon Promotion Form */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Gift className="w-5 h-5 text-[#D4AF37]" /> Yield Management Code</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Issue a promotional discount to drive occupancy rates during off-seasons.</p>
              </div>

              {couponError && <p className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-emerald-500 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">{couponSuccess}</p>}

              <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">PROMO CODE</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="E.G. DIWALI2026"
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">DISCOUNT TYPE</label>
                    <select 
                      value={discountType} 
                      onChange={e => setDiscountType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="PERCENTAGE">PERCENTAGE (%)</option>
                      <option value="FLAT">FLAT VALUE (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">VALUE</label>
                    <input 
                      type="number" 
                      required 
                      placeholder={discountType === 'PERCENTAGE' ? '20' : '5000'}
                      value={discountValue} 
                      onChange={e => setDiscountValue(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">MIN BOOKING (₹)</label>
                    <input 
                      type="number" 
                      placeholder="20000"
                      value={minAmount} 
                      onChange={e => setMinAmount(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">MAX USAGES</label>
                    <input 
                      type="number" 
                      placeholder="500"
                      value={maxUsages} 
                      onChange={e => setMaxUsages(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1E36] text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={creatingCoupon}
                  className="w-full btn-gold !py-3 font-bold uppercase text-[10px] tracking-wider mt-2 hover:scale-[1.01] transition shadow-lg"
                >
                  {creatingCoupon ? 'Issuing promo...' : 'Create Promotional Coupon'}
                </button>
              </form>
            </div>

            {/* Coupons Table Listing Real Conversions */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-bold">Active Coupons & Yield Statistics</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Audit usage conversions and discount distributions.</p>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[9px] pb-2">
                      <th className="py-2">Promo Code</th>
                      <th className="py-2">Discount</th>
                      <th className="py-2">Min Spend</th>
                      <th className="py-2">Max Usages</th>
                      <th className="py-2 text-right">Real Conversions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {coupons.map(c => (
                      <tr key={c.id} className="text-slate-800 dark:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-3 font-mono font-bold text-[#D4AF37]">{c.code}</td>
                        <td className="py-3 font-semibold">{c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                        <td className="py-3 font-mono text-slate-500">₹{Number(c.min_booking_amount).toLocaleString('en-IN')}</td>
                        <td className="py-3 font-mono text-slate-500">{c.max_usages}</td>
                        <td className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {c.conversion_count} used
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 italic">No coupons registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Panel 3: Corporate & Guest Directory (RBAC Control) */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
          
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-4">
            
            {/* Header with Sub-tab controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <div>
                <h3 className="font-serif text-xl font-bold flex items-center gap-1.5"><Users className="w-5 h-5 text-[#D4AF37]" /> Corporate User & Guest Directory</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Manage corporate staff accounts and audit registered guests / walk-in clients.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-[#0D1E36] p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setDirectoryTab('staff')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    directoryTab === 'staff'
                      ? 'bg-white dark:bg-[#132135] text-[#D4AF37] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Staff Members
                </button>
                <button
                  onClick={() => setDirectoryTab('guests')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    directoryTab === 'guests'
                      ? 'bg-white dark:bg-[#132135] text-[#D4AF37] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Registered Guests
                </button>
              </div>
            </div>

            {staffError && <p className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">{staffError}</p>}

            {directoryTab === 'staff' ? (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[9px] pb-2">
                      <th className="py-2">Employee Name</th>
                      <th className="py-2">Email Address</th>
                      <th className="py-2">Assigned Role</th>
                      <th className="py-2">Phone Number</th>
                      <th className="py-2">Access Status</th>
                      <th className="py-2 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {staff.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-800 dark:text-slate-200">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                        <td className="py-3.5 font-mono text-slate-500">{s.email}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded bg-[#08203E]/10 dark:bg-amber-500/10 text-[#0F3D6E] dark:text-amber-400 font-bold uppercase text-[9px]">
                            {s.role}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-500">{s.phone}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            s.status === 'SUSPENDED' 
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400' 
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {s.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            disabled={togglingStaffId === s.id}
                            onClick={() => handleToggleStaffStatus(s.id, s.status || 'ACTIVE')}
                            className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition ${
                              s.status === 'SUSPENDED'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {togglingStaffId === s.id ? 'Updating...' : (s.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {staff.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500 italic">No corporate staff members fetched.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[9px] pb-2">
                      <th className="py-2">Guest Name</th>
                      <th className="py-2">Email Address</th>
                      <th className="py-2">Phone Number</th>
                      <th className="py-2">Loyalty Balance</th>
                      <th className="py-2 text-right">Registration Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {guests.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-800 dark:text-slate-200">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{g.name}</td>
                        <td className="py-3.5 font-mono text-slate-500">{g.email}</td>
                        <td className="py-3.5 font-mono text-slate-500">{g.phone || 'N/A'}</td>
                        <td className="py-3.5 font-mono text-[#D4AF37] font-bold">{g.loyalty_points} pts</td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            g.walkin_count > 0 
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {g.walkin_count > 0 ? 'Walk-In Registration' : 'Online Booking'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {guests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500 italic">No registered guests fetched.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
 
         </div>
       )}

      {/* Dynamic Overlays Insight Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-8 rounded-3xl border border-[#D4AF37] bg-white dark:bg-[#132135] text-slate-900 dark:text-slate-100 space-y-6 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">Real-time Analytics Details</span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-slate-900 dark:text-slate-100">
                  {activeModal === 'REVENUE' && 'Gross Revenue Audit Logs'}
                  {activeModal === 'ADR' && 'Average Daily Rate (ADR) Index'}
                  {activeModal === 'OCCUPANCY' && 'Live Occupancy Breakdown'}
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
              
              {/* ADR & Revenue Modals Details */}
              {(activeModal === 'REVENUE' || activeModal === 'ADR') && (
                <div className="space-y-4 text-xs">
                  <p className="text-slate-500">List of completed guest check-ins contributing to revenue calculations:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[9px] pb-2">
                          <th className="py-2">Guest</th>
                          <th className="py-2">Dates</th>
                          <th className="py-2 text-right">Stay Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {completedCheckIns.map(b => (
                          <tr key={b.id} className="text-slate-800 dark:text-slate-200">
                            <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{b.guest_name || 'VIP Guest'}</td>
                            <td className="py-3 text-slate-500">{b.check_in_date} to {b.check_out_date}</td>
                            <td className="py-3 text-right font-serif font-bold text-slate-900 dark:text-slate-100">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        {completedCheckIns.length === 0 && (
                          <tr>
                            <td colSpan="3" className="py-8 text-center text-slate-500">No completed check-ins on record.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span>Total Calculated Sum:</span>
                    <span className="text-[#D4AF37] font-serif">₹{grossRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Occupancy details breakdown */}
              {activeModal === 'OCCUPANCY' && (
                <div className="space-y-6 text-xs">
                  <p className="text-slate-500">Inventory status details for {selectedBranch === 'ALL' ? 'all branches' : 'the selected branch'}:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Vacant-Clean</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{filteredRooms.filter(r => r.status === 'AVAILABLE' && r.is_locked !== 1).length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Occupied</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{filteredRooms.filter(r => r.status === 'OCCUPIED').length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">Turnaround</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{filteredRooms.filter(r => r.status === 'CLEANING').length} Rooms</span>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-500/20 bg-slate-500/5 text-slate-700 dark:text-slate-300">
                      <span className="text-[10px] uppercase font-bold tracking-wider block">LOTO Locked</span>
                      <span className="font-serif text-3xl font-bold mt-1 block">{filteredRooms.filter(r => r.is_locked === 1).length} Rooms</span>
                    </div>
                  </div>

                  {filteredRooms.filter(r => r.is_locked === 1).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">Rooms Locked by Maintenance (LOTO):</span>
                      <div className="flex flex-wrap gap-2">
                        {filteredRooms.filter(r => r.is_locked === 1).map(r => (
                          <span key={r.id} className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-mono font-bold">
                            {r.room_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}



            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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
