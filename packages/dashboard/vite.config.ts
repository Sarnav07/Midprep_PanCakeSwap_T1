import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: if deploying to https://sarnav07.github.io/nexus-dashboard/
// set base: '/nexus-dashboard/'
// For Vercel or root deployment: base: '/'
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'charts-vendor':  ['recharts'],
          'motion-vendor':  ['framer-motion'],
        },
      },
    },
  },
})