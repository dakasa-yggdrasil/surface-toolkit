import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "YggdrasilSurfaceToolkit",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-router-dom",
        "@tanstack/react-query",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled"
      ],
      output: {
        // Emit the single bundled stylesheet as dist/styles.css to match the
        // package's "./styles" export.
        assetFileNames: (asset) => {
          const name = asset.name ?? asset.names?.[0] ?? "";
          return name.endsWith(".css") ? "styles.css" : "[name][extname]";
        }
      }
    },
    cssCodeSplit: false,
    sourcemap: true
  }
});
