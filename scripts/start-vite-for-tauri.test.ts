// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { isDevServerAvailable } from "./start-vite-for-tauri.mjs";

describe("isDevServerAvailable", () => {
  it("returns true when the dev server responds successfully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });

    await expect(isDevServerAvailable(fetchMock)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:1420");
  });

  it("falls back from localhost to 127.0.0.1", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connect ECONNREFUSED"))
      .mockResolvedValueOnce({ ok: true });

    await expect(isDevServerAvailable(fetchMock)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:1420");
    expect(fetchMock).toHaveBeenNthCalledWith(2, "http://127.0.0.1:1420");
  });

  it("returns false when the port is occupied but not serving the app", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });

    await expect(isDevServerAvailable(fetchMock)).resolves.toBe(false);
  });

  it("returns false when nothing is reachable on the dev port", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED"));

    await expect(isDevServerAvailable(fetchMock)).resolves.toBe(false);
  });
});
