import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Parse backend port dynamically from backend/.env if it exists
let backendPort = 5000;
try {
  const envPath = path.resolve(__dirname, '../backend/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (match) {
      backendPort = parseInt(match[1], 10);
    }
  }
} catch (e) {
  console.warn('Could not parse backend port, using default 5000:', e);
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
    },
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        secure: false
      }
    }
  }
});

