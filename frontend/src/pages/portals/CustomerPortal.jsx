import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Sparkles, Calendar, FileText, Download, XCircle, User, MapPin, CheckCircle } from 'lucide-react';

export default function CustomerPortal() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = () => {
    axios.get('http://localhost:5000/api/bookings/my')
      .then(res => {
        setBookings(res.data.bookings || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this luxury stay?')) return;
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${id}/status`, { status: 'CANCELLED' });
      fetchMyBookings();
    } catch (err) {
      alert('Failed to cancel stay');
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-2xl bg-gradient-to-r from-[#08203E] to-[#14355E] text-white border border-[#D4AF37]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div className="space-y-2">
          <span className="text-xs uppercase font-semibold text-[#D4AF37] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Sapphire Society Member
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Namaste, {user?.name}</h1>
          <p className="text-xs text-gray-300">Welcome to your private Indian portal. Manage upcoming stays, invoices, and royal privileges.</p>
        </div>
        <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center min-w-[160px]">
          <span className="text-[10px] uppercase text-[#D4AF37] block font-bold">Loyalty Balance</span>
          <span className="font-serif font-bold text-2xl text-amber-300">{user?.loyalty_points || 8500} pts</span>
          <span className="block text-[10px] text-gray-300 mt-0.5">Worth ₹{(user?.loyalty_points || 8500) * 10} INR</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'bookings' ? 'border-[#D4AF37] text-[#0F3D6E] dark:text-amber-300' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          My Reservations ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'profile' ? 'border-[#D4AF37] text-[#0F3D6E] dark:text-amber-300' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Account Profile & Preferences
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 text-center font-serif text-lg">Loading your reservations...</div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center glass-card rounded-2xl space-y-4">
              <p className="font-serif text-xl text-gray-500">You currently have no active Indian luxury reservations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map(b => (
                <div key={b.id} className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-xs font-mono text-gray-400">Ref: {b.booking_ref}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold">{b.branch_name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-4">
                      <span>🛏️ {b.room_type_name}</span>
                      <span>📅 {b.check_in_date} → {b.check_out_date}</span>
                      <span>👥 {b.adults} Adults</span>
                    </p>
                  </div>

                  <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                    <div className="md:text-right">
                      <span className="text-[10px] uppercase text-gray-400 block">Total Amount Paid</span>
                      <span className="font-serif font-bold text-xl text-[#0F3D6E] dark:text-amber-300">₹{Number(b.total_amount).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-gray-400 block">Via {b.payment_method || 'UPI'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInvoice(b)}
                        className="px-4 py-2 rounded-lg bg-[#08203E] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#14355E] transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> View GST Invoice
                      </button>
                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-xs font-semibold hover:bg-red-500/20 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="glass-card p-8 rounded-2xl max-w-2xl border border-gray-200 dark:border-gray-800 space-y-6">
          <h3 className="font-serif text-2xl font-bold">Personal Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs uppercase text-gray-400 block">Full Name</label>
              <p className="font-semibold text-base mt-1">{user?.name}</p>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-400 block">Email Address</label>
              <p className="font-semibold text-base mt-1">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-400 block">Role Access</label>
              <p className="font-semibold text-base mt-1 uppercase text-[#D4AF37]">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Printable Indian GST Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-w-lg w-full p-8 rounded-2xl border border-[#D4AF37] bg-white dark:bg-[#132135] space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#08203E] dark:text-white">Tax Invoice (India GST)</h3>
                <p className="text-xs text-gray-500 mt-1">Invoice No: {selectedInvoice.invoice_number || 'INV-2026-IN0091'}</p>
                <p className="text-[11px] font-mono text-gray-400">GSTIN: {selectedInvoice.gstin || '08AAACS9988H1Z5'}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Guest Name</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sanctuary Branch</span>
                <span className="font-semibold">{selectedInvoice.branch_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dates</span>
                <span className="font-semibold">{selectedInvoice.check_in_date} → {selectedInvoice.check_out_date}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Base Room Amount</span>
                <span className="font-semibold">₹{Number(selectedInvoice.base_amount || selectedInvoice.total_amount * 0.82).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CGST (9%)</span>
                <span className="font-semibold">₹{Number(selectedInvoice.cgst_amount || selectedInvoice.total_amount * 0.09).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SGST (9%)</span>
                <span className="font-semibold">₹{Number(selectedInvoice.sgst_amount || selectedInvoice.total_amount * 0.09).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold pt-3 border-t border-gray-200 dark:border-gray-800">
                <span>Total INR Amount</span>
                <span className="text-[#0F3D6E] dark:text-amber-300">₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button onClick={() => { window.print(); setSelectedInvoice(null); }} className="btn-gold !py-3 w-full text-xs font-bold flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Print / Download Tax Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
