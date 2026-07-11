import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Briefcase, Key, Sparkles, Wrench, User, CheckCircle, Lock, ArrowRight } from 'lucide-react';

export default function DemoSwitcher({ onClose, compact = false }) {
  const { user, loginWithSeededAccount, SEEDED_ACCOUNTS } = useContext(AuthContext);
  const [switchingRoleId, setSwitchingRoleId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getPortalRoute = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '/portal/superadmin';
      case 'BRANCH_ADMIN': return '/portal/branchadmin';
      case 'RECEPTIONIST': return '/portal/reception';
      case 'HOUSEKEEPING': return '/portal/housekeeping';
      case 'MAINTENANCE': return '/portal/maintenance';
      default: return '/portal/customer';
    }
  };

  const handleSelectAccount = async (account) => {
    setSwitchingRoleId(account.role);
    setError(null);

    try {
      // Redirect cleanly to login page with autofill query parameter
      navigate(`/staff/login?autofill=${account.role}`);
      if (onClose) onClose();
    } catch (err) {
      setError('Failed to route to demo login page.');
    } finally {
      setSwitchingRoleId(null);
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span>Seeded Test Accounts (Simulated JWT Auth)</span>
          <span className="text-[#D4AF37]">🔒 Reviewer Mode</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SEEDED_ACCOUNTS.map((acc) => {
            const isCurrent = user?.role === acc.role;
            const isSwitching = switchingRoleId === acc.role;
            return (
              <button
                key={acc.id}
                onClick={() => handleSelectAccount(acc)}
                disabled={isSwitching}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-gray-900 dark:text-white font-bold shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#D4AF37] bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{acc.avatar}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold truncate">{acc.title}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">{acc.email}</div>
                  </div>
                </div>
                {isCurrent ? (
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                ) : isSwitching ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-[#08203E] border border-[#D4AF37]/30 text-white space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
          <Lock className="w-3.5 h-3.5" /> Production-Grade Demo Switcher
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Select a **Seeded Test Account** below. Clicking will redirect to the secure login console, autofill the credentials, authenticate with the backend via standard JWT, and route to the corresponding RBAC portal.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-300 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SEEDED_ACCOUNTS.map((acc) => {
          const isCurrent = user?.role === acc.role;
          const isSwitching = switchingRoleId === acc.role;

          return (
            <div
              key={acc.id}
              onClick={() => handleSelectAccount(acc)}
              className={`p-5 rounded-2xl border transition duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                isCurrent
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 shadow-lg ring-1 ring-[#D4AF37]/50'
                  : 'border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] bg-white/95 dark:bg-[#132135] text-slate-900 dark:text-slate-100 hover:shadow-xl'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:scale-110 transition duration-300">{acc.avatar}</span>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        {acc.badge}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 group-hover:text-[#D4AF37] transition">
                        {acc.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>User:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[180px]">{acc.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Email:</span>
                    <span className="font-semibold text-[#D4AF37] truncate max-w-[180px]">{acc.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold">
                {isCurrent ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <CheckCircle className="w-4 h-4" /> Active JWT Session
                  </span>
                ) : isSwitching ? (
                  <span className="inline-flex items-center gap-1.5 text-[#D4AF37] animate-pulse">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
                    Issuing simulated JWT...
                  </span>
                ) : (
                  <span className="text-gray-500 group-hover:text-[#D4AF37] transition flex items-center gap-1">
                    Sign in & Enter Portal →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
