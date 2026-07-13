import axios from 'axios';

// Configure default Axios base URL based on the environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
const apiBaseRoot = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

axios.defaults.baseURL = apiBaseRoot;

// 1. Outgoing Request Interceptor: Auto-attach authorization token and rewrite URLs
axios.interceptors.request.use(
  (config) => {
    // Dynamically replace hardcoded localhost:5000 with the environment API_BASE_URL if configured
    if (config.url && config.url.startsWith('http://localhost:5001')) {
      config.url = config.url.replace('http://localhost:5001', apiBaseRoot);
    }

    const token = sessionStorage.getItem('sapphire_token') || localStorage.getItem('sapphire_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Incoming Response Interceptor: Clean error logging
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gracefully format network error logs to avoid console clutter (Removed warning as requested)
    return Promise.reject(error);
  }
);

console.log('✅ Global Axios Interceptor successfully initialized.');
