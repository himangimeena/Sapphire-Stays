import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    }
  }
});
