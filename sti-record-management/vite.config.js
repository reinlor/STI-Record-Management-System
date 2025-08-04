import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/student": "http://localhost:5000",
      "/slip": "http://localhost:5000",
      "/referral": "http://localhost:5000",
      "/violation": "http://localhost:5000",
    },
  },
});
