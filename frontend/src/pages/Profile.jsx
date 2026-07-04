import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, User, Shield, CheckCircle, LogOut, ArrowRight } from 'lucide-react';

export default function Profile() {
  const { user, switchDemoRole, logout } = useContext(AuthContext);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  if (!user) {
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

  const roles = [
    { id: 'CUSTOMER', label: 'Customer / Guest', desc: 'Book luxury stays, view invoices & manage reservations.', icon: '👑', portal: '/portal/customer' },
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full estate oversight, revenue KPIs, analytics & staff control.', icon: '🏛️', portal: '/portal/superadmin' },
    { id: 'BRANCH_ADMIN', label: 'Branch Admin', desc: 'Manage specific Indian palace branches, inventory & rooms.', icon: '🏢', portal: '/portal/branchadmin' },
    { id: 'RECEPTIONIST', label: 'Receptionist', desc: 'Front desk check-ins, guest verification & room assignment.', icon: '🛎️', portal: '/portal/reception' },
    { id: 'HOUSEKEEPING', label: 'Housekeeping', desc: 'Room cleanliness status, maintenance logs & turndown service.', icon: '🧹', portal: '/portal/housekeeping' },
    { id: 'MAINTENANCE', label: 'Maintenance', desc: 'Facility repairs, HVAC logs & urgent engineering tickets.', icon: '🛠️', portal: '/portal/maintenance' }
  ];

  const handleRoleSwitch = async (targetRole, portalRoute) => {
    if (targetRole === user.role) {
      navigate(portalRoute);
      return;
    }
    setSwitching(true);
    try {
      await switchDemoRole(targetRole);
      setSwitching(false);
      navigate(portalRoute);
    } catch (err) {
      console.error('Failed to switch demo role:', err);
      alert('Failed to switch role. Please try again.');
      setSwitching(false);
    }
  };

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Sapphire Society
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold">Account Profile & Access</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          Manage your personal identity, review membership privileges, or switch role access for demonstration.
        </p>
      </div>

      {/* Personal Details Card */}
      <div className="glass-card p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-r from-[#08203E] to-[#14355E] text-white">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center text-2xl font-bold text-[#D4AF37] shadow-lg shrink-0">
            {user.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">Active Session</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">{user.name}</h2>
            <p className="text-xs text-gray-300 font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-center">
            <span className="text-[10px] uppercase text-gray-300 block">Current Role Access</span>
            <span className="font-serif font-bold text-lg text-amber-300 uppercase tracking-wider block mt-0.5">
              {user.role.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-5 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Demo Role Switcher Grid */}
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-[#0F3D6E] dark:text-amber-300">
              <Shield className="w-6 h-6 text-[#D4AF37]" /> Demo Role Switcher
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select any role below to instantly adjust your session privileges and explore the respective portal.
            </p>
          </div>
          {switching && (
            <span className="text-xs font-bold text-[#D4AF37] animate-pulse">Switching session privileges...</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => {
            const isCurrent = user.role === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleRoleSwitch(r.id, r.portal)}
                className={`glass-card p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:scale-[1.02] ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-[#08203E] text-white ring-2 ring-[#D4AF37]/50'
                    : 'border-gray-200 dark:border-gray-800 hover:border-[#D4AF37]/50 bg-white dark:bg-[#0B1D3A]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">{r.icon}</span>
                    {isCurrent ? (
                      <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#08203E] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active Role
                      </span>
                    ) : (
                      <span className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        Switch <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h4 className={`font-serif text-xl font-bold ${isCurrent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {r.label}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isCurrent ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {r.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/50 flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isCurrent ? 'text-amber-300' : 'text-gray-400'}`}>
                    {r.portal}
                  </span>
                  <button
                    type="button"
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-[#D4AF37] text-[#08203E]'
                        : 'bg-[#08203E] text-white dark:bg-white/10 dark:text-white hover:bg-[#D4AF37] hover:text-[#08203E]'
                    }`}
                  >
                    {isCurrent ? 'Enter Portal →' : 'Switch & Enter'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
