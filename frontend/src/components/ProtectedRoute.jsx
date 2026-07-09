import React, { useContext, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import DemoSwitcher from './DemoSwitcher';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useContext(AuthContext);
  const [showDemoSwitcher, setShowDemoSwitcher] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
        <p className="font-serif text-lg font-semibold text-gray-500 dark:text-gray-400">Verifying JWT Session Authorization...</p>
      </div>
    );
  }

  // Strict session check per Requirement 3: both user object and JWT session token must exist
  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-Based Access Control (RBAC) verification against allowed roles
  if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="glass-card max-w-2xl w-full p-8 sm:p-10 rounded-3xl border-2 border-red-500/30 text-center space-y-6 shadow-2xl bg-[#08203E] text-white">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto text-red-400 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">HTTP 403 • RBAC Security Enforcement</span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">Access Denied to Portal</h1>
            <p className="text-sm text-gray-300 leading-relaxed max-w-lg mx-auto">
              Your active JWT session claim (<span className="text-[#D4AF37] font-semibold">{user.email}</span> with role <span className="text-amber-400 font-mono font-bold">{user.role}</span>) is not authorized for this route.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              Required Role(s): <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/20">{allowedRoles.join(' or ')}</span>
            </div>
            <div>
              Session status: <span className="text-emerald-400 font-bold">JWT Verified (`sessionStorage`)</span>
            </div>
          </div>

          {!showDemoSwitcher ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button 
                onClick={() => setShowDemoSwitcher(true)}
                className="btn-gold !py-3 !px-6 text-xs flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" /> Switch Seeded Account (Demo Mode)
              </button>
              <Link to="/" className="btn-luxury !py-3 !px-6 text-xs flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Return Home
              </Link>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-white/10 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Select an authorized account to enter instantly:</span>
                <button onClick={() => setShowDemoSwitcher(false)} className="text-xs text-gray-400 hover:text-white underline">Close</button>
              </div>
              <DemoSwitcher compact={true} onClose={() => setShowDemoSwitcher(false)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return children;
}

