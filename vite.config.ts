import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // The server proxy is useful for local development to avoid CORS issues
  // when the frontend (Vite dev server) and backend run on different ports.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your local backend server
        changeOrigin: true,
      },
    },
  },
})
