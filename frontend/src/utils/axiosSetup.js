import axios from 'axios';

// Configure default Axios base URL based on the environment configuration
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// 1. Outgoing Request Interceptor: Auto-attach authorization token and rewrite URLs
axios.interceptors.request.use(
  (config) => {
    // Dynamically replace hardcoded localhost:5000 with the environment VITE_API_BASE_URL if configured
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    if (config.url && config.url.startsWith('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', apiBase);
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
    // Gracefully format network error logs to avoid console clutter
    if (error.code === 'ERR_NETWORK') {
      console.warn('📡 Network Connection Error: Backend server offline or host unreachable.');
    }
    return Promise.reject(error);
  }
);

console.log('✅ Global Axios Interceptor successfully initialized.');
