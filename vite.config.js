import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Production builds target GitHub Pages at /full-mpos/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/full-mpos/" : "/",
}));
