import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const rawPort = process.env.PORT || process.env.DEV_PORT || "5173";
const port = Number(rawPort);

export default defineConfig({
  root,
  base: process.env.BASE_PATH || "/",
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: path.resolve(root, "src/routes"),
      generatedRouteTree: path.resolve(root, "src/routeTree.gen.ts"),
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@tanstack/react-start": path.resolve(root, "src/shims/react-start.js"),
      "@": path.resolve(root, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: path.resolve(root, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    allowedHosts: true,
  },
});
