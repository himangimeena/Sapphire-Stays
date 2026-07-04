import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sapphire_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('sapphire_token') || null);
  const [loading, setLoading] = useState(true);
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
      if (!user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      setUser(res.data.user);
      localStorage.setItem('sapphire_user', JSON.stringify(res.data.user));
    } catch (err) {
      console.warn('Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    const newToken = res.data.token;
    const newUser = res.data.user;
    localStorage.setItem('sapphire_token', newToken);
    localStorage.setItem('sapphire_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_BASE}/auth/register`, userData);
    const newToken = res.data.token;
    const newUser = res.data.user;
    localStorage.setItem('sapphire_token', newToken);
    localStorage.setItem('sapphire_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const switchDemoRole = async (targetRole) => {
    const res = await axios.post(`${API_BASE}/auth/demo-switch-role`, { targetRole });
    const newToken = res.data.token;
    const newUser = res.data.user;
    localStorage.setItem('sapphire_token', newToken);
    localStorage.setItem('sapphire_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = () => {
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
      register,
      switchDemoRole,
      logout,
      API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
};
