import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [preact()],
  resolve: {
    alias: {
      "@keel/engine": fileURLToPath(new URL("../engine/src/index.ts", import.meta.url)),
      // Plan fixtures live in the engine (one source; A1). Imported with `?raw`.
      "@keel/examples": fileURLToPath(new URL("../engine/examples", import.meta.url)),
    },
  },
  // Dev server must be allowed to serve ../engine (build is unaffected).
  server: { fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] } },
  build: { target: "es2022", sourcemap: false, cssCodeSplit: false },
});
