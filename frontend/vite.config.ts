import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In dev, `npm run dev` serves the SPA on :5173 and proxies /api to the Django
// REST API on :8001. `npm run build` emits a static bundle into dist/, which
// Django serves in production (see config/urls.py).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
      },
    },
  },
});
