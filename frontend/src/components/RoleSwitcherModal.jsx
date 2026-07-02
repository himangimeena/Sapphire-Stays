import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Shield, Briefcase, Key, Wrench, Sparkles, User, X, CheckCircle } from 'lucide-react';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { user, switchDemoRole } = useContext(AuthContext);

  if (!isOpen) return null;

  const roles = [
    {
      id: 'SUPER_ADMIN',
      title: 'Super Admin (Julian Sterling)',
      desc: 'Full portfolio oversight, India-wide INR revenue graphs, branch management.',
      icon: <Shield className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'BRANCH_ADMIN',
      title: 'Branch Admin (Vikramaditya Rathore)',
      desc: 'Manage Udaipur Palace inventory, local pricing, and room operations.',
      icon: <Briefcase className="w-5 h-5 text-blue-500" />
    },
    {
      id: 'RECEPTIONIST',
      title: 'Reception Desk (Ananya Sharma)',
      desc: 'Search reservations, instant check-in/out, GST invoice generator.',
      icon: <Key className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'HOUSEKEEPING',
      title: 'Housekeeping Lead (Julian D.)',
      desc: 'Inspect room clean statuses, Turn-down service, VIP Welcome setups.',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />
    },
    {
      id: 'MAINTENANCE',
      title: 'Maintenance Lead (Rajesh Kumar)',
      desc: 'Urgent plumbing, AC filter replacements, repair progress boards.',
      icon: <Wrench className="w-5 h-5 text-orange-500" />
    },
    {
      id: 'CUSTOMER',
      title: 'VIP Guest (Julian Thorne)',
      desc: 'Explore luxury palaces, book suites with Indian UPI/GST, view stay summary.',
      icon: <User className="w-5 h-5 text-teal-500" />
    }
  ];

  const handleSelect = async (roleId) => {
    try {
      await switchDemoRole(roleId);
      onClose();
    } catch (err) {
      alert('Failed to switch demo role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="glass-card w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D4AF37]/30 shadow-2xl bg-white dark:bg-[#132135]">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 p-6 bg-[#08203E] text-white">
          <div>
            <h3 className="font-serif text-2xl font-bold tracking-wide gold-gradient-text">Instant Role Switcher</h3>
            <p className="text-xs text-amber-200/80 mt-1">Easily preview every dedicated portal of Sapphire Stays India</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
            <X className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {roles.map((r) => {
            const isCurrent = user?.role === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className={`p-4 rounded-xl cursor-pointer border transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 dark:bg-[#D4AF37]/15 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#0F3D6E] hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{r.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.desc}</p>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 self-end">
                    <CheckCircle className="w-4 h-4" /> Active Portal
                  </span>
                ) : (
                  <span className="mt-3 text-xs font-semibold text-[#0F3D6E] dark:text-amber-300 self-end uppercase tracking-wider">
                    Switch to Portal →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500">
          All accounts are pre-loaded with realistic Indian luxury data, pending maintenance tickets, and GST invoices.
        </div>
      </div>
    </div>
  );
}
