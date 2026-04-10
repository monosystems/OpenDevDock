import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const DEV_SERVER_URLS = ["http://localhost:1420", "http://127.0.0.1:1420"];

export async function isDevServerAvailable(fetchImpl = fetch, urls = DEV_SERVER_URLS) {
  for (const url of urls) {
    try {
      const response = await fetchImpl(url);
      if (response.ok) {
        return true;
      }
    } catch {
      // Try the next loopback URL before deciding the server is down.
    }
  }

  return false;
}

async function main() {
  if (await isDevServerAvailable()) {
    process.exit(0);
  }

  const child = spawn("pnpm", ["run", "dev"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Failed to prepare Vite dev server:", error);
    process.exit(1);
  });
}
