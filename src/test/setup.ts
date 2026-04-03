import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, "beforeunload", {
  value: null,
  writable: true,
});

window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();