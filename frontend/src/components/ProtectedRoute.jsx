import React, { useContext } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
        <p className="font-serif text-lg font-semibold text-gray-500">Verifying Royal Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 animate-fade-in">
        <div className="glass-card max-w-lg w-full p-8 sm:p-10 rounded-3xl border-2 border-red-500/30 text-center space-y-6 shadow-2xl bg-[#08203E] text-white">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto text-red-400 shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">RBAC Security Enforcement</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Access Denied</h1>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your logged-in identity (<span className="text-[#D4AF37] font-semibold">{user.email}</span> with role <span className="text-amber-400 font-mono font-bold">{user.role}</span>) does not have authorization to access this portal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400">
            Required Role(s): <span className="font-mono text-white font-bold">{allowedRoles.join(', ')}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/login" className="btn-gold !py-3 !px-6 text-xs flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" /> Switch Role Account
            </Link>
            <Link to="/" className="btn-luxury !py-3 !px-6 text-xs flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
