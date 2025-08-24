import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/student": "http://localhost:5000",
      "/slip": "http://localhost:5000",
      "/referral": "http://localhost:5000",
      "/violation": "http://localhost:5000",
      "/teacher": "http://localhost:5000",
      "/user": "http://localhost:5000",
      "/exam": "http://localhost:5000",
      "/email": "http://localhost:5000",
    },
  },
})
