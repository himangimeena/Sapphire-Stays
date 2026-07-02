import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Sparkles } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('guest@sapphirestays.in');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Julian Thorne');
  const [phone, setPhone] = useState('+91 99220 44556');
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
      navigate('/portal/customer');
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-[#D4AF37]/30 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold">{isLogin ? 'Sign in to Sanctuary' : 'Join The Sapphire Society'}</h2>
          <p className="text-xs text-gray-500">Access your Indian luxury reservations, loyalty benefits, and private invoices.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Mobile Number (+91)</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
              </div>
            </>
          )}

          <div>
            <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-gray-500 block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-[#D4AF37]" />
          </div>

          <button type="submit" className="w-full btn-gold !py-3.5 text-xs font-bold">
            {isLogin ? 'Sign In' : 'Create Royal Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
          {isLogin ? (
            <p>New to Sapphire Stays? <button onClick={() => setIsLogin(false)} className="text-[#D4AF37] font-bold hover:underline">Create Account</button></p>
          ) : (
            <p>Already a Society member? <button onClick={() => setIsLogin(true)} className="text-[#D4AF37] font-bold hover:underline">Sign In</button></p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-700 dark:text-amber-300">
          Tip: You can also use the **Role Switcher** button in the top bar to test any account instantly!
        </div>
      </div>
    </div>
  );
}
