import axios from 'axios';

// 1. Outgoing Request Interceptor: Auto-attach authorization token
axios.interceptors.request.use(
  (config) => {
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
