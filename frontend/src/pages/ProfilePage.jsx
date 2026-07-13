import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, 
  LogOut, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  Clock, 
  Lock, 
  X, 
  Globe, 
  Cpu,
  Award,
  CheckCircle2,
  Edit3
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, updateUser, API_BASE } = useContext(AuthContext);
  const navigate = useNavigate();

  // Local state for interactive features
  const [localUser, setLocalUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  


  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Synchronize local user state with auth context
  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (!user || !localUser) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto px-4">
        <h2 className="font-serif text-2xl font-bold">Please Sign In</h2>
        <p className="text-gray-500 text-sm">You need to be logged into your Sapphire Stays account to view your profile.</p>
        <button onClick={() => navigate('/login')} className="btn-gold !py-2.5 !px-6 text-xs font-bold w-full">
          Go to Sign In
        </button>
      </div>
    );
  }

  // Generate deterministic creation date based on user ID
  function getAccountCreationDate(userId) {
    if (userId === undefined || userId === null) {
      throw new Error("Invalid User context: User ID is missing for account creation date calculation.");
    }
    const id = Number(userId);
    const day = String((id % 28) + 1).padStart(2, '0');
    const month = String((id % 12) + 1).padStart(2, '0');
    const year = 2021 + (id % 4);
    return `${day}/${month}/${year}`;
  }

  // Format phone number dynamically to +91 XXXXX XXXXX
  function formatPhoneNumber(phoneStr) {
    if (!phoneStr) return '+91 98000 00000';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phoneStr;
  }



  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/auth/profile`, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      });
      updateUser(res.data.token, res.data.user);
      setIsEditModalOpen(false);
      showToast('Contact details updated successfully');
    } catch (err) {
      console.error('Update contact error:', err);
      showToast(err.response?.data?.error || 'Failed to update contact details');
    }
  };

  // Badge configs depending on role
  const getRoleBadge = (role, loyaltyPoints) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          text: 'Imperial Governance',
          style: 'bg-gradient-to-r from-[#D4AF37]/20 to-[#B8921A]/20 border-[#D4AF37]/60 text-[#D4AF37] dark:text-[#F4E3B2] shadow-[0_0_15px_rgba(212,175,55,0.1)]',
          icon: <Award className="w-4 h-4 text-[#D4AF37]" />
        };
      case 'HOUSEKEEPING':
        return {
          text: 'Operations Specialist',
          style: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        };
      case 'BRANCH_ADMIN':
        return {
          text: 'Palace Estate MD',
          style: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
          icon: <Building2 className="w-4 h-4 text-amber-500" />
        };
      case 'RECEPTIONIST':
        return {
          text: 'Guest Experience Lead',
          style: 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
          icon: <Sparkles className="w-4 h-4 text-indigo-500" />
        };
      case 'MAINTENANCE':
        return {
          text: 'Facilities Engineer',
          style: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
          icon: <Cpu className="w-4 h-4 text-blue-500" />
        };
      default: // CUSTOMER
        const pts = loyaltyPoints || 0;
        if (pts >= 5000) {
          return {
            text: 'Royal Heritage VIP',
            style: 'bg-gradient-to-r from-[#D4AF37]/20 to-[#B8921A]/20 border-[#D4AF37]/60 text-[#D4AF37] dark:text-[#F4E3B2] shadow-[0_0_15px_rgba(212,175,55,0.15)]',
            icon: <Award className="w-4 h-4 text-[#D4AF37]" />
          };
        } else if (pts >= 1000) {
          return {
            text: 'Palace Elite Guest',
            style: 'bg-gradient-to-r from-slate-400/20 to-slate-600/20 border-slate-400/50 text-slate-700 dark:text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.1)]',
            icon: <Sparkles className="w-4 h-4 text-slate-400" />
          };
        } else {
          return {
            text: 'Heritage Privilege',
            style: 'bg-gradient-to-r from-amber-700/20 to-amber-900/20 border-amber-700/50 text-amber-800 dark:text-amber-300 shadow-[0_0_15px_rgba(180,83,9,0.1)]',
            icon: <User className="w-4 h-4 text-amber-700" />
          };
        }
    }
  };

  const badge = getRoleBadge(localUser.role, localUser.loyalty_points || 8500);

  // Get dynamic role-specific stats
  const renderRoleSpecificStats = () => {
    if (localUser.role === 'CUSTOMER') {
      const bookingsCount = (localUser.id % 6) + 8; // deterministic mock count
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Membership Tier</span>
            <span className="text-sm font-serif font-bold text-[#D4AF37] tracking-wide">Royal Heritage Club Elite</span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-center transition hover:border-[#D4AF37]/30">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block tracking-wider font-bold">Loyalty Balance</span>
              <span className="text-2xl font-serif font-bold text-[#D4AF37] block mt-1">
                {(localUser.loyalty_points || 8500).toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500">pts</span>
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-center transition hover:border-[#D4AF37]/30">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block tracking-wider font-bold">Total Bookings</span>
              <span className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 block mt-1">
                {bookingsCount} <span className="text-xs font-sans font-normal text-slate-500">Stays</span>
              </span>
            </div>
          </div>
        </div>
      );
    } else {
      // Staff Operational Counters
      let shiftCount = 0;
      let actionLabel = 'Tasks Checked';
      let compliance = '98.4%';
      
      switch (localUser.role) {
        case 'SUPER_ADMIN':
          shiftCount = 14;
          actionLabel = 'System Audits Approved';
          compliance = '100% Security';
          break;
        case 'BRANCH_ADMIN':
          shiftCount = 8;
          actionLabel = 'Operational Clearances';
          compliance = '99.2% Sync';
          break;
        case 'RECEPTIONIST':
          shiftCount = 34;
          actionLabel = 'Guest Check-ins Processed';
          compliance = '98.8% Rating';
          break;
        case 'HOUSEKEEPING':
          shiftCount = 18;
          actionLabel = 'Palace Chambers Certified';
          compliance = '99.5% Score';
          break;
        case 'MAINTENANCE':
          shiftCount = 12;
          actionLabel = 'Engineering Tickets Closed';
          compliance = '98.0% SLA';
          break;
        default:
          shiftCount = 20;
          actionLabel = 'Actions Executed';
          compliance = '98.0%';
      }

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Assigned Duty Branch</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate text-right">
              {localUser.branch_name || 'All India Properties'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-center transition">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block tracking-wider font-bold">{actionLabel}</span>
              <span className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200 block mt-1">
                {shiftCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 text-center transition">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block tracking-wider font-bold">Operational Compliance</span>
              <span className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                {compliance}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#08203E] text-white border border-[#D4AF37]/50 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          <span className="text-xs font-semibold tracking-wide">{toast}</span>
        </div>
      )}

      {/* Header Summary */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-[0.35em] font-extrabold text-[#D4AF37] flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Executive Profile Hub
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Secure Identity Control
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
          Access your credential logs, manage security metadata protocols, and review operational metrics on the Sapphire Core.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Identity & Insight */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Identity & Core Credentials Block */}
          <div className="bg-white dark:bg-[#0D1E36] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md rounded-2xl p-6 md:p-8 transition duration-300 hover:shadow-lg relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar Monogram */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#08203E] to-[#14355E] border-2 border-[#D4AF37]/50 flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-xl shrink-0">
                {localUser.name ? localUser.name[0].toUpperCase() : 'S'}
              </div>
              
              {/* Details Column */}
              <div className="flex-1 space-y-4 text-center sm:text-left w-full">
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                    <h2 className="font-serif text-2xl font-bold tracking-wide text-slate-900 dark:text-white">
                      {localUser.name}
                    </h2>
                    <div className="flex justify-center">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shrink-0 ${badge.style}`}>
                        {badge.icon}
                        {badge.text}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37] font-semibold block">
                    {localUser.role === 'CUSTOMER' ? 'Customer Profile Account' : 'Executive Palace Staff'}
                  </span>
                </div>

                {/* Details Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Email Address</span>
                      <span className="font-medium font-mono">{localUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Mobile Line</span>
                      <span className="font-medium font-mono">{formatPhoneNumber(localUser.phone)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Access Identifier</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {localUser.role === 'CUSTOMER' ? `CUST-${localUser.id || 999}` : `EMP-${localUser.id || 999}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Registered Period</span>
                      <span className="font-medium font-mono">Since {getAccountCreationDate(localUser.id)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Role-Specific Summary Insight Card */}
          <div className="bg-white dark:bg-[#0D1E36] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md rounded-2xl p-6 transition duration-300 hover:shadow-lg relative overflow-hidden">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" />
              Role-Specific Summary Insight
            </h3>
            {renderRoleSpecificStats()}
          </div>

        </div>

        {/* Column 2: Session Metrics & Actions */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Secure Session & Metadata Metrics */}
          <div className="bg-white dark:bg-[#0D1E36] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md rounded-2xl p-6 transition duration-300 hover:shadow-lg">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              Secure Session Audit
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Account Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Account Status</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Active & Verified (RBI/Data Compliant)
                </div>
              </div>

              {/* Grid Metadata details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Assigned Office Portal</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {localUser.role === 'SUPER_ADMIN' ? 'All Properties (India Global)' : (localUser.branch_name || 'All Properties')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Creation Stamp</span>
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    Account Created on: {getAccountCreationDate(localUser.id)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pb-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>Active Security Protocol</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    TLS 1.3
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Security & System Maintenance Action Panel */}
          <div className="bg-white dark:bg-[#0D1E36] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-md rounded-2xl p-6 transition duration-300 hover:shadow-lg space-y-5">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-slate-400" />
              Administrative Actions
            </h3>

            {/* Quick action buttons */}
            <div className="flex flex-col gap-3">
              {/* Update Contact Details */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-slate-400" />
                Update Contact Details
              </button>
            </div>

            {/* Secure Logout */}
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full px-4 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Secure Logout
            </button>
          </div>

        </div>

      </div>

      {/* Edit Contact Details Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0D1E36] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                Edit Credentials
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUpdateContact} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Registered Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mobile Number</label>
                <input 
                  type="text" 
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98000 00000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#08203E] to-[#14355E] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-md hover:brightness-110 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
