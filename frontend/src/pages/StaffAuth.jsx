import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Briefcase, Key, Sparkles, Wrench, User, ArrowLeft, Mail, Lock, AlertTriangle } from 'lucide-react';

export default function StaffAuth() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const roleCards = [
    {
      id: 'SUPER_ADMIN',
      title: 'Super Admin',
      badge: 'Executive Level',
      desc: 'Company-wide portfolio dashboard, INR revenue analytics, staff & branch management.',
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      demoEmail: 'superadmin@sapphirestays.in',
      demoPass: 'admin123'
    },
    {
      id: 'BRANCH_ADMIN',
      title: 'Branch Admin',
      badge: 'Palace Manager',
      desc: 'Assigned branch room inventory, local pricing control, bookings & staff roster.',
      icon: <Briefcase className="w-6 h-6 text-blue-400" />,
      demoEmail: 'udaipur.admin@sapphirestays.in',
      demoPass: 'admin123'
    },
    {
      id: 'RECEPTIONIST',
      title: 'Reception Desk',
      badge: 'Front Office',
      desc: "Today's arrivals/departures, walk-in reservations, guest verification & check-in/out.",
      icon: <Key className="w-6 h-6 text-emerald-400" />,
      demoEmail: 'reception@sapphirestays.in',
      demoPass: 'password123'
    },
    {
      id: 'HOUSEKEEPING',
      title: 'Housekeeping',
      badge: 'Palace Care',
      desc: 'Inspect dirty vs ready suites, turn-down service schedule & room status tracking.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      demoEmail: 'housekeeping@sapphirestays.in',
      demoPass: 'password123'
    },
    {
      id: 'MAINTENANCE',
      title: 'Engineering & Maintenance',
      badge: 'Facility Care',
      desc: 'Urgent plumbing, AC repairs, room maintenance ticketing & work history.',
      icon: <Wrench className="w-6 h-6 text-orange-400" />,
      demoEmail: 'maintenance@sapphirestays.in',
      demoPass: 'password123'
    },
    {
      id: 'CUSTOMER',
      title: 'Guest / Customer',
      badge: 'VIP Member',
      desc: 'Browse Indian sanctuaries, reserve royal suites, manage bookings & GST invoices.',
      icon: <User className="w-6 h-6 text-teal-400" />,
      demoEmail: 'guest@sapphirestays.in',
      demoPass: 'password123'
    }
  ];

  const handleSelectRoleCard = (roleObj) => {
    setSelectedRole(roleObj);
    setEmail(roleObj.demoEmail);
    setPassword(roleObj.demoPass);
    setErrorMsg('');
  };

  const getPortalPath = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '/portal/superadmin';
      case 'BRANCH_ADMIN': return '/portal/branchadmin';
      case 'RECEPTIONIST': return '/portal/reception';
      case 'HOUSEKEEPING': return '/portal/housekeeping';
      case 'MAINTENANCE': return '/portal/maintenance';
      default: return '/portal/customer';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      
      // Double check role matching for security
      if (res.user.role !== selectedRole.id) {
        setErrorMsg(`Role Mismatch: This account belongs to the role of '${res.user.role}', but you requested staff access as '${selectedRole.id}'.`);
        setLoading(false);
        return;
      }

      navigate(getPortalPath(res.user.role));
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in min-h-[85vh] flex flex-col justify-center text-slate-900 dark:text-slate-100">
      {!selectedRole ? (
        /* SCREEN 1: 6 STAFF PORTAL ROLE SELECTION CARDS */
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Reviewer & Examiner Access Doorway</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold">Designated Portal Access Console</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Securely authenticate as a preloaded staff or executive role to verify backend RBAC systems and UI views.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCards.map((rc) => (
              <div
                key={rc.id}
                onClick={() => handleSelectRoleCard(rc)}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between group bg-white/90 dark:bg-[#051329] text-slate-900 dark:text-slate-100"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-[#08203E] border border-[#D4AF37]/30 group-hover:border-[#D4AF37] group-hover:scale-110 transition duration-300">
                      {rc.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      {rc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#D4AF37] transition">
                      {rc.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                      {rc.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition">
                  <span>Enter {rc.title} Portal</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SCREEN 2: DEDICATED AUTHENTICATION FORM FOR THE EXAM ROLE */
        <div className="max-w-md mx-auto w-full space-y-6">
          <button
            onClick={() => setSelectedRole(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Staff Doorway
          </button>

          <div className="glass-card p-8 sm:p-10 rounded-3xl border-2 border-[#D4AF37]/40 shadow-2xl space-y-6 bg-white/95 dark:bg-[#08203E] text-slate-900 dark:text-slate-100">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-[#051329] border border-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
                {selectedRole.icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">{selectedRole.badge}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">{selectedRole.title} Setup</h2>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={selectedRole.demoEmail}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#051329] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#051329] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold !py-3.5 text-xs font-bold shadow-xl hover:scale-[1.01] transition"
              >
                {loading ? 'Authorizing Reviewer Access...' : `Authenticate as ${selectedRole.title}`}
              </button>
            </form>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 block">Pre-loaded Reviewer Credentials</span>
              <button
                type="button"
                onClick={() => { setEmail(selectedRole.demoEmail); setPassword(selectedRole.demoPass); }}
                className="text-xs text-[#D4AF37] font-mono bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 py-1.5 px-3 rounded-lg border border-gray-300 dark:border-white/10 transition"
              >
                Auto-fill Reviewer Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
