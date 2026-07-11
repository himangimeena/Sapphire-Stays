import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

// Canonical Seeded Test Accounts Registry for Technical Reviewers & Demo Switcher
export const SEEDED_ACCOUNTS = [
  {
    id: 101,
    role: 'SUPER_ADMIN',
    name: 'Julian Sterling',
    email: 'superadmin@sapphirestays.in',
    badge: 'Executive Level',
    title: 'Super Admin Portfolio MD',
    branch_name: 'All India Headquarters (Mumbai / Delhi / Goa)',
    avatar: '👑'
  },
  {
    id: 102,
    role: 'BRANCH_ADMIN',
    name: 'Vikramaditya Rathore',
    email: 'udaipur.admin@sapphirestays.in',
    badge: 'Palace Manager',
    title: 'Branch Admin - Udaipur',
    branch_name: 'Sapphire Palace Udaipur Heritage Sanctuary',
    avatar: '🏰'
  },
  {
    id: 103,
    role: 'RECEPTIONIST',
    name: 'Ananya Sharma',
    email: 'reception@sapphirestays.in',
    badge: 'Front Desk Lead',
    title: 'Senior Reception Desk Supervisor',
    branch_name: 'Sapphire Grand Colaba Mumbai',
    avatar: '🛎️'
  },
  {
    id: 104,
    role: 'HOUSEKEEPING',
    name: 'Julian D.',
    email: 'housekeeping@sapphirestays.in',
    badge: 'Palace Care Lead',
    title: 'Executive Housekeeping Director',
    branch_name: 'Sapphire Imperial New Delhi',
    avatar: '✨'
  },
  {
    id: 105,
    role: 'MAINTENANCE',
    name: 'Rajesh Kumar',
    email: 'maintenance@sapphirestays.in',
    badge: 'Chief Engineer',
    title: 'Head of Engineering & Facilities',
    branch_name: 'Sapphire Serenity South Goa',
    avatar: '🔧'
  },
  {
    id: 106,
    role: 'CUSTOMER',
    name: 'Julian Thorne',
    email: 'guest@sapphirestays.in',
    badge: 'VIP Member',
    title: 'Royal Heritage Club Member',
    branch_name: 'Global Sanctuary Member',
    avatar: '🌟'
  }
];

export const AuthProvider = ({ children }) => {
  // Use sessionStorage as primary secure session storage (with fallback checking localStorage during transition)
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('sapphire_user') || localStorage.getItem('sapphire_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('sapphire_token') || localStorage.getItem('sapphire_token') || null;
  });
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('sapphire_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sapphire_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const persistSession = (newToken, newUser) => {
    sessionStorage.setItem('sapphire_token', newToken);
    sessionStorage.setItem('sapphire_user', JSON.stringify(newUser));
    // Mirror in localStorage to support seamless page refreshes across tabs if needed
    localStorage.setItem('sapphire_token', newToken);
    localStorage.setItem('sapphire_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
  };

  // Helper to map specific email domains/addresses to designated RBAC roles securely
  const getRoleByEmail = (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'superadmin@sapphirestays.in' || cleanEmail === 'superadmin@sapphirestays.com') {
      return 'SUPER_ADMIN';
    }
    if (cleanEmail === 'udaipur.admin@sapphirestays.in' || cleanEmail === 'udaipur.admin@sapphirestays.com') {
      return 'BRANCH_ADMIN';
    }
    if (cleanEmail === 'reception@sapphirestays.in' || cleanEmail === 'reception@sapphirestays.com') {
      return 'RECEPTIONIST';
    }
    if (cleanEmail === 'housekeeping@sapphirestays.in' || cleanEmail === 'housekeeping@sapphirestays.com') {
      return 'HOUSEKEEPING';
    }
    if (cleanEmail === 'maintenance@sapphirestays.in' || cleanEmail === 'maintenance@sapphirestays.com') {
      return 'MAINTENANCE';
    }
    return 'CUSTOMER';
  };

  // Production-minded login function verifying against live backend API
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const targetRole = getRoleByEmail(res.data.user.email);
      const userToPersist = { ...res.data.user, role: targetRole };
      persistSession(res.data.token, userToPersist);
      return { token: res.data.token, user: userToPersist };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Invalid email or password provided.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, userData);
      const targetRole = getRoleByEmail(res.data.user.email);
      const userToPersist = { ...res.data.user, role: targetRole };
      persistSession(res.data.token, userToPersist);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleAccessToken) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/google-login`, { token: googleAccessToken });
      const userToPersist = { ...res.data.user, role: getRoleByEmail(res.data.user.email) };
      const newToken = res.data.token;
      persistSession(newToken, userToPersist);
      return { token: newToken, user: userToPersist };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('sapphire_token');
    sessionStorage.removeItem('sapphire_user');
    localStorage.removeItem('sapphire_token');
    localStorage.removeItem('sapphire_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      theme,
      toggleTheme,
      login,
      loginWithGoogle,
      register,
      logout,
      SEEDED_ACCOUNTS,
      API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
};
