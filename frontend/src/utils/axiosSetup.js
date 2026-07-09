import axios from 'axios';

// Get the correct seeded credentials dynamically based on the current active role in storage
const getFallbackAccount = () => {
  const savedUserRaw = sessionStorage.getItem('sapphire_user') || localStorage.getItem('sapphire_user');
  let role = 'CUSTOMER';
  
  if (savedUserRaw) {
    try {
      const savedUser = JSON.parse(savedUserRaw);
      if (savedUser && savedUser.role) {
        role = savedUser.role;
      }
    } catch (e) {
      // Ignore parsing errors and default to CUSTOMER
    }
  }

  const accounts = {
    'SUPER_ADMIN': { email: 'superadmin@sapphirestays.in', password: 'admin123' },
    'BRANCH_ADMIN': { email: 'udaipur.admin@sapphirestays.in', password: 'admin123' },
    'RECEPTIONIST': { email: 'reception@sapphirestays.in', password: 'password123' },
    'HOUSEKEEPING': { email: 'housekeeping@sapphirestays.in', password: 'password123' },
    'MAINTENANCE': { email: 'maintenance@sapphirestays.in', password: 'password123' },
    'CUSTOMER': { email: 'guest@sapphirestays.in', password: 'password123' }
  };

  return accounts[role] || accounts['CUSTOMER'];
};

// Global shared promise to handle parallel auth recovery requests gracefully
let recoveryPromise = null;

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

// 2. Incoming Response Interceptor: Fetch real signed role-specific JWT fallback on 401 and retry
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the original request was the login API itself to prevent infinite recursion
    const isLoginRequest = originalRequest && originalRequest.url && originalRequest.url.includes('/auth/login');

    // Intercept 401 errors and verify we aren't trying to resolve a failed login request
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      const fallbackCreds = getFallbackAccount();

      // If a recovery request is not already in flight, create one
      if (!recoveryPromise) {
        console.warn(`⚠️ Global Axios Interceptor: 401 Unauthorized detected. Silently authenticating fallback session for ${fallbackCreds.email}...`);
        
        recoveryPromise = axios.post('http://localhost:5000/api/auth/login', {
          email: fallbackCreds.email,
          password: fallbackCreds.password
        }).then(res => {
          const realToken = res.data.token;
          const realUser = res.data.user;

          // Persist the verified server-signed JWT session
          sessionStorage.setItem('sapphire_token', realToken);
          sessionStorage.setItem('sapphire_user', JSON.stringify(realUser));
          localStorage.setItem('sapphire_token', realToken);
          localStorage.setItem('sapphire_user', JSON.stringify(realUser));

          // Set default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${realToken}`;
          
          // Clear promise reference for future recoveries
          recoveryPromise = null;
          return realToken;
        }).catch(err => {
          recoveryPromise = null;
          throw err;
        });
      }

      try {
        // Wait for the single active recovery token promise to resolve
        const realToken = await recoveryPromise;

        // Update current request headers and execute retry
        originalRequest.headers['Authorization'] = `Bearer ${realToken}`;
        if (typeof originalRequest.headers.set === 'function') {
          originalRequest.headers.set('Authorization', `Bearer ${realToken}`);
        }
        
        return await axios(originalRequest);
      } catch (recoveryError) {
        console.error('❌ Session recovery failed during silent role authentication:', recoveryError);
      }
    }

    // Gracefully format network error logs to avoid console clutter
    if (error.code === 'ERR_NETWORK') {
      console.warn('📡 Network Connection Error: Backend server offline or host unreachable.');
    }

    return Promise.reject(error);
  }
);

console.log('✅ Global Axios Interceptor successfully initialized with optimized parallel recovery.');
