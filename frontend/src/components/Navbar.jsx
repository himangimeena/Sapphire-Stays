import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, Shield, User, LogOut, Menu, X, Sparkles } from 'lucide-react';
import RoleSwitcherModal from './RoleSwitcherModal';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const getPortalLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN': return '/portal/superadmin';
      case 'BRANCH_ADMIN': return '/portal/branchadmin';
      case 'RECEPTIONIST': return '/portal/reception';
      case 'HOUSEKEEPING': return '/portal/housekeeping';
      case 'MAINTENANCE': return '/portal/maintenance';
      default: return '/portal/customer';
    }
  };

  return (
    <>
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

          {/* Desktop Navigation Links with generous luxury spacing */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-10 text-sm font-medium tracking-wider">
            <Link to="/" className="hover:text-[#D4AF37] transition py-2">Sanctuaries</Link>
            <Link to="/branches" className="hover:text-[#D4AF37] transition py-2">Palaces</Link>
            <Link to="/rooms" className="hover:text-[#D4AF37] transition py-2">Suites</Link>
            <Link to="/offers" className="hover:text-[#D4AF37] transition flex items-center gap-1.5 py-2">
              Offers <span className="px-2 py-0.5 text-[9px] bg-[#D4AF37] text-[#08203E] rounded font-bold uppercase tracking-normal">Royal</span>
            </Link>
            <Link to="/gallery" className="hover:text-[#D4AF37] transition py-2">Gallery</Link>
            <Link to="/about" className="hover:text-[#D4AF37] transition py-2">Heritage</Link>
          </nav>

          {/* Right Action Bar spaced comfortably */}
          <div className="hidden md:flex items-center gap-4 xl:gap-6 shrink-0">
            {/* Instant Demo Switcher */}
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] text-xs font-semibold flex items-center gap-2 transition shadow-sm"
              title="Switch demo role instantly"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Role: {user ? user.role.replace('_', ' ') : 'Guest'}</span>
            </button>

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
              <div className="flex items-center gap-3 pl-3 border-l border-white/20">
                <Link to={getPortalLink()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#14355E] hover:bg-[#1A5494] transition border border-[#D4AF37]/40 shadow-md">
                  {user.role !== 'CUSTOMER' ? <Shield className="w-4 h-4 text-[#D4AF37]" /> : <User className="w-4 h-4 text-[#D4AF37]" />}
                  <span className="text-xs font-semibold truncate max-w-[130px]">{user.name.split(' ')[0]}</span>
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
              <Link to="/login" className="btn-gold !py-2.5 !px-6 text-xs shadow-lg">
                Reserve Sanctuary
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setModalOpen(true)} className="px-3 py-1.5 text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg border border-[#D4AF37]">
              Demo Role
            </button>
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
          <div className="lg:hidden bg-[#08203E] border-t border-[#D4AF37]/20 px-6 py-6 flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Sanctuaries</Link>
            <Link to="/branches" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Palaces & Resorts</Link>
            <Link to="/rooms" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Curated Suites</Link>
            <Link to="/offers" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Offers & Privileges</Link>
            <Link to="/gallery" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Gallery</Link>
            <Link to="/about" onClick={() => setMobileMenu(false)} className="hover:text-[#D4AF37] py-1 font-medium">Heritage</Link>
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              {user ? (
                <div className="flex items-center justify-between w-full">
                  <Link to={getPortalLink()} onClick={() => setMobileMenu(false)} className="btn-gold !py-2 !px-4 text-xs">
                    My Portal ({user.role})
                  </Link>
                  <button onClick={() => { logout(); setMobileMenu(false); navigate('/'); }} className="text-red-400 text-xs font-semibold">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenu(false)} className="btn-gold !py-2.5 !px-6 text-xs w-full text-center">
                  Sign In / Reserve
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <RoleSwitcherModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
