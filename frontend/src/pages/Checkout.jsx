import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Smartphone, Calendar, Users } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const roomTypeId = searchParams.get('roomTypeId') || 1;
  const branchId = searchParams.get('branchId') || 1;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState('2026-07-15');
  const [checkOut, setCheckOut] = useState('2026-07-18');
  const [roomsCount, setRoomsCount] = useState(1);
  const [couponCode, setCouponCode] = useState('ROYALINDIA20');
  const [calc, setCalc] = useState(null);

  // Form fields
  const [firstName, setFirstName] = useState(user ? user.name.split(' ')[0] : 'Julian');
  const [lastName, setLastName] = useState(user ? user.name.split(' ')[1] || '' : 'Thorne');
  const [email, setEmail] = useState(user ? user.email : 'julian.thorne@example.com');
  const [phone, setPhone] = useState(user ? user.phone : '+91 99220 44556');
  const [specialRequests, setSpecialRequests] = useState('Dietary requirements, lake view preference, airport Maybach pickup.');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('julian.thorne@okaxis');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    axios.post('http://localhost:5000/api/bookings/calculate', {
      roomTypeId,
      checkIn,
      checkOut,
      roomsCount,
      couponCode
    })
    .then(res => setCalc(res.data))
    .catch(err => console.error(err));
  }, [roomTypeId, checkIn, checkOut, roomsCount, couponCode]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in or use the Demo Role Switcher before booking.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bookings', {
        branchId,
        roomTypeId,
        checkIn,
        checkOut,
        roomsCount,
        couponCode,
        specialRequests,
        guestDetails: { firstName, lastName, email, phone },
        paymentMethod,
        upiId
      });
      setConfirmation(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (confirmation) {
    return (
      <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 sm:px-6 text-center animate-fade-in space-y-6">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold">Reservation Confirmed</h1>
        <p className="text-gray-500 text-sm sm:text-base">Thank you for choosing Sapphire Stays India. Your royal reservation has been finalized.</p>
        
        <div className="glass-card p-6 rounded-2xl border border-[#D4AF37]/40 text-left space-y-4 shadow-xl">
          <div className="flex justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <span className="text-xs uppercase text-gray-400 font-semibold">Booking Reference</span>
            <span className="font-mono font-bold text-base sm:text-lg text-[#0F3D6E] dark:text-amber-300">{confirmation.bookingRef}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Paid (incl. India GST)</span>
            <span className="font-bold">₹{Number(confirmation.totalAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Payment Mode</span>
            <span className="font-semibold uppercase">{paymentMethod}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link to="/portal/customer" className="btn-gold !py-3 !px-6 text-xs w-full sm:w-auto">
            View My Dashboard & Invoice
          </Link>
          <Link to="/" className="btn-luxury !py-3 !px-6 text-xs w-full sm:w-auto">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in overflow-x-hidden">
      <Link to="/rooms" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 sm:mb-8 transition">
        <ArrowLeft className="w-4 h-4" /> Return to Selection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Left Column: Guest & Payment details */}
        <form onSubmit={handleBooking} className="lg:col-span-2 space-y-8 sm:space-y-10 min-w-0 w-full">
          {/* Stay Dates Box inside container matching Requirement 3 */}
          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold font-serif border-b border-gray-200 dark:border-gray-800 pb-3">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Modify Royal Stay Dates</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0 w-full">
                <label className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">Check-In Date</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                />
              </div>
              <div className="min-w-0 w-full">
                <label className="text-[11px] font-semibold text-gray-500 uppercase block mb-1">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="w-full max-w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold border-b border-gray-200 dark:border-gray-800 pb-4">Guest Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
              </div>
              <div className="min-w-0 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
              </div>
              <div className="min-w-0 w-full">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Indian Mobile (+91)</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
              </div>
            </div>

            <div className="min-w-0 w-full">
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Special Requests (Optional)</label>
              <textarea rows={3} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold">Payment Information (India)</h2>
              <div className="flex gap-2 text-gray-400">
                <CreditCard className="w-5 h-5" />
                <Smartphone className="w-5 h-5" />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['UPI', 'Credit / Debit Card', 'Net Banking'].map(pm => (
                <button
                  type="button"
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold uppercase transition border text-center truncate ${
                    paymentMethod === pm ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#0F3D6E] dark:text-amber-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="p-4 sm:p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3 min-w-0 w-full">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block">Enter Virtual Payment Address (VPA / UPI ID)</label>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@okaxis or 9876543210@paytm" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37] box-border" />
                <p className="text-[11px] text-gray-500">Supported apps: Google Pay, PhonePe, Paytm, BHIM UPI.</p>
              </div>
            ) : (
              <div className="space-y-4 min-w-0 w-full">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Cardholder Name</label>
                  <input type="text" defaultValue="Julian Thorne" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm box-border" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Card Number</label>
                  <input type="text" defaultValue="4532 •••• •••• 8891" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-sm box-border" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Your payment information is encrypted with industry-standard TLS 1.3 & RBI compliance.</span>
            </div>
          </div>
        </form>

        {/* Right Column: Stay Summary Card */}
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/30 shadow-2xl lg:sticky lg:top-28 space-y-6 min-w-0 w-full">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold">Stay Summary</h3>
            <span className="px-2.5 py-1 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px] uppercase">Royal Tier</span>
          </div>

          <div className="flex items-center gap-4">
            <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=200&q=80" alt="Room" className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-base sm:text-lg truncate">Lakeview Royal Suite</h4>
              <p className="text-xs text-gray-500 truncate">Sapphire Palace Udaipur</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Duration ({calc?.nights || 3} Nights)</span>
              <span className="font-semibold">{checkIn} → {checkOut}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Suite Rate (x{calc?.roomsCount || 1} Room)</span>
              <span className="font-semibold">₹{Number(calc?.baseAmount || 135000).toLocaleString('en-IN')}</span>
            </div>
            {calc?.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Coupon ({couponCode})</span>
                <span>- ₹{Number(calc.discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">India GST (CGST 9% + SGST 9%)</span>
              <span className="font-semibold">₹{Number((calc?.cgstAmount || 12150) + (calc?.sgstAmount || 12150)).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="font-serif text-base sm:text-lg font-bold">Total Amount</span>
            <div className="text-right">
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#0F3D6E] dark:text-amber-300">
                ₹{Number(calc?.totalAmount || 159300).toLocaleString('en-IN')}
              </span>
              <span className="block text-[10px] text-gray-400">All India taxes included</span>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full btn-gold !py-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xl"
          >
            <span>{loading ? 'Confirming Royal Stay...' : `Confirm & Pay ₹${Number(calc?.totalAmount || 159300).toLocaleString('en-IN')}`}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
