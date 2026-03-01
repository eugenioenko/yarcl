import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: "MyLib",
      fileName: (format) => `my-lib.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@yarcl/config": path.resolve(__dirname, "src/yarcl/yarcl.config.ts"),
      "@yarcl/types": path.resolve(__dirname, "src/yarcl/yarcl.types.ts"),
    },
  },
});
