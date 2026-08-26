
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // --- SMART KEY DETECTION ---
  // Support both API_KEY (Standard) and GEMINI_API_KEY (User preference)
  // Auto-trim whitespace to prevent copy-paste errors (e.g. " key" vs "key")
  const rawKey = env.API_KEY || env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim();

  // --- DEBUG LOGGING ---
  if (apiKey) {
      console.log('\x1b[32m%s\x1b[0m', `✅ [Vite Config] API Key loaded successfully! (Length: ${apiKey.length})`);
  } else {
      console.log('\x1b[31m%s\x1b[0m', '❌ [Vite Config] API_KEY or GEMINI_API_KEY NOT FOUND in .env files.');
  }

  return {
    plugins: [react()],
    define: {
      // Vital: Map the system env variable to the code's process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        // Fix: Externalize dependencies that are loaded via CDN (importmap)
        // This prevents Rollup from failing when it can't find them in local node_modules
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          'zustand',
          'lucide-react',
          '@google/genai',
          'firebase/app',
          'firebase/auth',
          'firebase/firestore',
          'firebase/storage',
          'firebase/analytics'
        ],
        output: {
          // Ensure external imports are kept as-is for the importmap to handle
          format: 'es'
        }
      }
    }
  };
});
