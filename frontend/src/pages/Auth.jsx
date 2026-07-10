import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Sparkles, AlertTriangle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 98000 00000');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await login(email, password);
      } else {
        res = await register({ name, email, password, phone });
      }

      const role = res.user.role;
      if (role === 'SUPER_ADMIN') {
        navigate('/portal/superadmin');
      } else if (role === 'BRANCH_ADMIN') {
        navigate('/portal/branchadmin');
      } else if (role === 'RECEPTIONIST') {
        navigate('/portal/reception');
      } else if (role === 'HOUSEKEEPING') {
        navigate('/portal/housekeeping');
      } else if (role === 'MAINTENANCE') {
        navigate('/portal/maintenance');
      } else {
        navigate('/portal/customer');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMsg('');

    if (!window.google) {
      setErrorMsg('Google login library is still loading. Please try again in a few seconds.');
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID') {
      setErrorMsg('Google Client ID is not configured. Please define VITE_GOOGLE_CLIENT_ID in your frontend .env file.');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            setLoading(true);
            try {
              const res = await loginWithGoogle(tokenResponse.access_token);
              const role = res.user.role;
              if (role === 'SUPER_ADMIN') {
                navigate('/portal/superadmin');
              } else if (role === 'BRANCH_ADMIN') {
                navigate('/portal/branchadmin');
              } else if (role === 'RECEPTIONIST') {
                navigate('/portal/reception');
              } else if (role === 'HOUSEKEEPING') {
                navigate('/portal/housekeeping');
              } else if (role === 'MAINTENANCE') {
                navigate('/portal/maintenance');
              } else {
                navigate('/portal/customer');
              }
            } catch (err) {
              setErrorMsg(err.message || 'Google Authentication failed on the backend server.');
            } finally {
              setLoading(false);
            }
          } else {
            setErrorMsg('Access request was not authorized by Google.');
          }
        },
        error_callback: (err) => {
          setErrorMsg(err?.message || 'An error occurred during Google sign-in.');
        }
      });

      client.requestAccessToken();
    } catch (err) {
      console.error('Google Auth Init Error:', err);
      setErrorMsg('Failed to initialize Google Auth process. Please contact admin.');
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-md mx-auto px-4 animate-fade-in min-h-[85vh] flex flex-col justify-center text-slate-900 dark:text-slate-100">
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6 bg-white/95 dark:bg-[#08203E] text-slate-900 dark:text-slate-100">
        
        {/* Luxury Brand Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#D4AF37] flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Sapphire Stays
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-100">
            {isLogin ? 'Royal Member Sign In' : 'Create Heritage Account'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isLogin ? 'Sign in to access your reserved suites & privileges.' : 'Join the Sapphire Society to unlock member benefits.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-[#051329] border border-gray-200 dark:border-gray-800/40">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${isLogin ? 'bg-[#D4AF37] text-[#08203E] shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`py-2 rounded-lg text-xs font-bold transition ${!isLogin ? 'bg-[#D4AF37] text-[#08203E] shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="E.g. Julian Thorne"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#051329] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+91 99220 44556"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#051329] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="guest@sapphirestays.in"
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
            {loading ? 'Processing Royal Access...' : isLogin ? 'Sign In to Account' : 'Register Heritage Account'}
          </button>
        </form>

        {/* Premium Google OAuth Button */}
        <div className="relative flex py-2 items-center text-xs">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          <span className="flex-shrink mx-4 text-slate-500">Or continue with</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#051329] hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold flex items-center justify-center gap-2.5 transition text-slate-800 dark:text-slate-200"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-center mt-3 pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setErrorMsg('');
              try {
                const res = await loginWithGoogle('MOCK_GOOGLE_OAUTH_TOKEN');
                const role = res.user.role;
                if (role === 'SUPER_ADMIN') {
                  navigate('/portal/superadmin');
                } else if (role === 'BRANCH_ADMIN') {
                  navigate('/portal/branchadmin');
                } else if (role === 'RECEPTIONIST') {
                  navigate('/portal/reception');
                } else if (role === 'HOUSEKEEPING') {
                  navigate('/portal/housekeeping');
                } else if (role === 'MAINTENANCE') {
                  navigate('/portal/maintenance');
                } else {
                  navigate('/portal/customer');
                }
              } catch (err) {
                setErrorMsg(err.message || 'Google Auth simulation failed.');
              } finally {
                setLoading(false);
              }
            }}
            className="text-[10px] uppercase tracking-wider text-[#D4AF37] hover:underline font-bold"
          >
            🛡️ Demo Bypass: Simulate Google Login
          </button>
        </div>

      </div>
    </div>
  );
}
