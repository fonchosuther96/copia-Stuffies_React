import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // 🔴 CLAVE para Nginx + EC2
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./test/setup.js",
  },
});
  