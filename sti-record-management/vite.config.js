import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  server: {
    proxy: {
      "/student": "http://localhost:5000",
      "/slip": "http://localhost:5000",
      "/referral": "http://localhost:5000",
      "/violation": "http://localhost:5000",
      "/teacher": "http://localhost:5000",
      "/user": "http://localhost:5000",
    },
  },
})
