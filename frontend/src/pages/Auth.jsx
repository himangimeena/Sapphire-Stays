import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Briefcase, Key, Sparkles, Wrench, User, ArrowLeft, Lock, Mail, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const roleCards = [
    {
      id: 'CUSTOMER',
      title: 'Guest / Customer',
      badge: 'VIP Member',
      desc: 'Browse Indian sanctuaries, reserve royal suites, manage bookings & GST invoices.',
      icon: <User className="w-6 h-6 text-teal-400" />,
      demoEmail: 'guest@sapphirestays.in',
      demoPass: 'password123',
      allowSignUp: true
    },
    {
      id: 'SUPER_ADMIN',
      title: 'Super Admin',
      badge: 'Executive Level',
      desc: 'Company-wide portfolio dashboard, INR revenue analytics, staff & branch management.',
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      demoEmail: 'superadmin@sapphirestays.in',
      demoPass: 'admin123',
      allowSignUp: false
    },
    {
      id: 'BRANCH_ADMIN',
      title: 'Branch Admin',
      badge: 'Palace Manager',
      desc: 'Assigned branch room inventory, local pricing control, bookings & staff roster.',
      icon: <Briefcase className="w-6 h-6 text-blue-400" />,
      demoEmail: 'udaipur.admin@sapphirestays.in',
      demoPass: 'admin123',
      allowSignUp: false
    },
    {
      id: 'RECEPTIONIST',
      title: 'Reception Desk',
      badge: 'Front Office',
      desc: "Today's arrivals/departures, walk-in reservations, guest verification & check-in/out.",
      icon: <Key className="w-6 h-6 text-emerald-400" />,
      demoEmail: 'reception@sapphirestays.in',
      demoPass: 'password123',
      allowSignUp: false
    },
    {
      id: 'HOUSEKEEPING',
      title: 'Housekeeping',
      badge: 'Palace Care',
      desc: 'Inspect dirty vs ready suites, turn-down service schedule & room status tracking.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      demoEmail: 'housekeeping@sapphirestays.in',
      demoPass: 'password123',
      allowSignUp: false
    },
    {
      id: 'MAINTENANCE',
      title: 'Engineering & Maintenance',
      badge: 'Facility Care',
      desc: 'Urgent plumbing, AC repairs, room maintenance ticketing & work history.',
      icon: <Wrench className="w-6 h-6 text-orange-400" />,
      demoEmail: 'maintenance@sapphirestays.in',
      demoPass: 'password123',
      allowSignUp: false
    }
  ];

  const handleSelectRoleCard = (roleObj) => {
    setSelectedRole(roleObj);
    setEmail(roleObj.demoEmail);
    setPassword(roleObj.demoPass);
    setIsLogin(true);
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
      if (isLogin) {
        const res = await login(email, password);
        // Automatic Role Verification per Requirement 6
        if (res.user.role !== selectedRole.id) {
          logout();
          setErrorMsg(`Role Mismatch: Your account belongs to the role of '${res.user.role}', but you selected '${selectedRole.id}'. Access Denied.`);
          setLoading(false);
          return;
        }
        navigate(getPortalPath(res.user.role));
      } else {
        const res = await register({ name, email, password, phone });
        navigate(getPortalPath(res.user.role));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in min-h-[85vh] flex flex-col justify-center overflow-x-hidden">
      {!selectedRole ? (
        /* SCREEN 1: 6 LUXURY ROLE SELECTION CARDS */
        <div className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37]">Identity & Access Control</span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold">Select Your Sapphire Portal Role</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Please identify your designated role within Sapphire Stays India to access your secured role-based portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roleCards.map((rc) => (
              <div
                key={rc.id}
                onClick={() => handleSelectRoleCard(rc)}
                className="glass-card p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between group bg-[#051329] text-white"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-2xl bg-[#08203E] border border-[#D4AF37]/30 group-hover:border-[#D4AF37] group-hover:scale-110 transition duration-300">
                      {rc.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                      {rc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold group-hover:text-[#D4AF37] transition">
                      {rc.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      {rc.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs font-bold text-[#D4AF37] group-hover:translate-x-1 transition">
                  <span>Enter {rc.title} Portal</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SCREEN 2: DEDICATED AUTHENTICATION FORM */
        <div className="max-w-md mx-auto w-full space-y-6">
          <button
            onClick={() => setSelectedRole(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Choose a different portal role
          </button>

          <div className="glass-card p-8 sm:p-10 rounded-3xl border-2 border-[#D4AF37]/40 shadow-2xl space-y-6 bg-[#08203E] text-white">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#051329] border border-[#D4AF37] flex items-center justify-center mx-auto shadow-lg">
                {selectedRole.icon}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest block">{selectedRole.badge}</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">{selectedRole.title} Portal</h2>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Guest Tab Switcher (Only visible for CUSTOMER role per Req 6) */}
            {selectedRole.allowSignUp ? (
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#051329] border border-white/10">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                  className={`py-2 rounded-lg text-xs font-bold transition ${isLogin ? 'bg-[#D4AF37] text-[#08203E]' : 'text-gray-400 hover:text-white'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                  className={`py-2 rounded-lg text-xs font-bold transition ${!isLogin ? 'bg-[#D4AF37] text-[#08203E]' : 'text-gray-400 hover:text-white'}`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-[11px] text-amber-300">
                <Lock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Staff & Admin accounts require corporate authorization. Sign-Up is disabled.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && selectedRole.allowSignUp && (
                <>
                  <div>
                    <label className="text-xs uppercase font-semibold text-gray-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#051329] text-white text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-gray-300 block mb-1">Indian Mobile (+91)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#051329] text-white text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs uppercase font-semibold text-gray-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={selectedRole.demoEmail}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#051329] text-white text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-gray-300 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#051329] text-white text-sm focus:outline-none focus:border-[#D4AF37] box-border"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold !py-3.5 text-xs font-bold shadow-xl hover:scale-[1.01] transition"
              >
                {loading ? 'Verifying Credentials...' : isLogin ? `Authenticate as ${selectedRole.title}` : 'Register Royal Identity'}
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Pre-loaded Test Credentials</span>
              <button
                type="button"
                onClick={() => { setEmail(selectedRole.demoEmail); setPassword(selectedRole.demoPass); }}
                className="text-xs text-[#D4AF37] font-mono bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-lg border border-white/10 transition"
              >
                Auto-fill: {selectedRole.demoEmail}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
