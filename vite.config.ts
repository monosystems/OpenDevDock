import { defineConfig, type Connect, type Plugin, type ViteDevServer } from "vite";
import type { ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import {
  EMPTY_SOURCE_MAP,
  isMonacoLoaderSourceMapRequest,
  stripMonacoLoaderSourceMapComment,
} from "./scripts/monaco-source-map";

const host = process.env.TAURI_DEV_HOST;

const monacoLoaderSourceMapPlugin: Plugin = {
  name: "serve-missing-monaco-loader-sourcemap",
  transform(code, id) {
    return stripMonacoLoaderSourceMapComment(code, id);
  },
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
      if (!req.url || !isMonacoLoaderSourceMapRequest(req.url)) {
        next();
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(EMPTY_SOURCE_MAP);
    });
  },
};

export default defineConfig(async () => ({
  plugins: [react(), monacoLoaderSourceMapPlugin],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  optimizeDeps: {
    exclude: ["@monaco-editor/react", "monaco-editor"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
}));
