import React from 'react';
import { X, Lock } from 'lucide-react';
import DemoSwitcher from './DemoSwitcher';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4">
      <div className="glass-card w-full max-w-4xl overflow-hidden rounded-3xl border border-[#D4AF37]/40 shadow-2xl bg-white dark:bg-[#0B1D3A] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#D4AF37]/20 p-6 bg-[#08203E] text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif text-2xl font-bold tracking-wide gold-gradient-text">Seeded Test Accounts (Simulated JWT)</h3>
            </div>
            <p className="text-xs text-amber-200/80 mt-1">
              Production-grade Demo Mode: Click any account to execute `login(email, password)` & issue Base64 JWT token (`sessionStorage`)
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
            <X className="w-5 h-5 text-amber-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <DemoSwitcher onClose={onClose} />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 shrink-0">
          All reviewer sessions are securely isolated in `sessionStorage` with Base64 JWT headers, expiration claims, and RBAC protection.
        </div>
      </div>
    </div>
  );
}

