import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, Shield, User, LogOut, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPortalLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN': return '/portal/superadmin';
      case 'BRANCH_ADMIN': return '/portal/branchadmin';
      case 'RECEPTIONIST':
      case 'HOUSEKEEPING':
      case 'MAINTENANCE':
        return '/portal/reception';
      default: return '/portal/customer';
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) => `py-2 transition duration-300 font-medium relative ${
    isActive(path)
      ? 'text-[#D4AF37] font-bold after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5 after:bg-[#D4AF37] after:shadow-[0_0_10px_#D4AF37]'
      : 'text-white/90 hover:text-[#D4AF37]'
  }`;

  const mobileLinkClass = (path) => `py-2 px-3 rounded-lg transition duration-300 font-medium ${
    isActive(path)
      ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold border-l-4 border-[#D4AF37]'
      : 'text-white/90 hover:text-[#D4AF37] hover:bg-white/5'
  } min-h-[44px] flex items-center`;

  return (
    <header className="sticky top-0 z-40 w-full glass-navbar text-white shadow-lg">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-8 lg:px-12 h-22 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8E6D18] flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <span className="font-serif font-bold text-xl text-[#08203E]">S</span>
          </div>
          <div>
            <span className="font-serif font-bold text-2xl tracking-widest text-white block leading-none">SAPPHIRE</span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold block mt-1">Stays • India</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm tracking-wider">
          <Link to="/" className={navLinkClass('/')}>Sanctuaries</Link>
          <Link to="/branches" className={navLinkClass('/branches')}>Palaces</Link>
          <Link to="/offers" className={navLinkClass('/offers')}>
            <span className="flex items-center gap-1.5">
              Offers <span className="px-1.5 py-0.5 text-[9px] bg-[#D4AF37] text-[#08203E] rounded font-bold uppercase tracking-normal">Royal</span>
            </span>
          </Link>
          <Link to="/gallery" className={navLinkClass('/gallery')}>Gallery</Link>
          <Link to="/about" className={navLinkClass('/about')}>Heritage</Link>
        </nav>

        {/* Right Action Bar */}
        <div className="hidden md:flex items-center gap-4 xl:gap-6 shrink-0">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-full hover:bg-white/10 transition text-amber-300 border border-white/10"
            title="Toggle Light / Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Account / Portal Link */}
          {user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-white/20">
              <Link to={getPortalLink()} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition border shadow-md ${
                location.pathname.startsWith('/portal') ? 'bg-[#D4AF37] text-[#08203E] font-bold border-[#D4AF37]' : 'bg-[#14355E] hover:bg-[#1A5494] border-[#D4AF37]/40 text-white'
              }`}>
                {user.role !== 'CUSTOMER' ? <Shield className="w-4 h-4 shrink-0" /> : <User className="w-4 h-4 shrink-0" />}
                <span className="text-xs font-semibold truncate max-w-[130px]">{user.name.split(' ')[0]}</span>
              </Link>
              <Link
                to="/profile"
                className={`p-2 rounded-lg transition border ${
                  location.pathname === '/profile' ? 'bg-[#D4AF37] text-[#08203E] border-[#D4AF37]' : 'text-gray-300 hover:text-[#D4AF37] hover:bg-white/10 border-transparent'
                }`}
                title="Account Profile & Role Settings"
              >
                <User className="w-4 h-4" />
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-white/10 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className={`btn-gold !py-2.5 !px-6 text-xs shadow-lg ${isActive('/login') ? 'ring-2 ring-white' : ''}`}>
              Sign In / Create Account
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 text-amber-300">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-white">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenu && (
        <div className="absolute left-0 right-0 top-full lg:hidden bg-[#08203E] border-t border-[#D4AF37]/20 px-4 py-4 flex flex-col gap-1.5 max-h-[calc(100vh-5.5rem)] overflow-y-auto shadow-2xl z-50 animate-slide-down">
          <Link to="/" onClick={() => setMobileMenu(false)} className={mobileLinkClass('/')}>Sanctuaries</Link>
          <Link to="/branches" onClick={() => setMobileMenu(false)} className={mobileLinkClass('/branches')}>Palaces & Resorts</Link>
          <Link to="/offers" onClick={() => setMobileMenu(false)} className={mobileLinkClass('/offers')}>Offers & Privileges</Link>
          <Link to="/gallery" onClick={() => setMobileMenu(false)} className={mobileLinkClass('/gallery')}>Gallery</Link>
          <Link to="/about" onClick={() => setMobileMenu(false)} className={mobileLinkClass('/about')}>Heritage</Link>
          <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <Link to={getPortalLink()} onClick={() => setMobileMenu(false)} className="btn-gold !py-2 !px-4 text-xs flex-1 text-center">
                    My Portal ({user.role})
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenu(false)} className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold text-center">
                    Profile
                  </Link>
                </div>
                <button onClick={() => { logout(); setMobileMenu(false); navigate('/'); }} className="text-red-400 text-xs font-semibold text-right">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenu(false)} className="btn-gold !py-2.5 !px-6 text-xs w-full text-center">
                Sign In / Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
