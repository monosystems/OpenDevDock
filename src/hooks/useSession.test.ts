import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStorageKey, loadSessionsFromStorage, saveSessionsToStorage } from "./useSession";
import type { Session } from "../state/types";

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("getStorageKey", () => {
  it("should encode project path in storage key", () => {
    const result = getStorageKey("/path/to/project");
    expect(result).toBe("opendevdock_sessions_%2Fpath%2Fto%2Fproject");
  });

  it("should handle special characters in path", () => {
    const result = getStorageKey("/path with spaces/project");
    expect(result).toBe("opendevdock_sessions_%2Fpath%20with%20spaces%2Fproject");
  });

  it("should handle empty path", () => {
    const result = getStorageKey("");
    expect(result).toBe("opendevdock_sessions_");
  });

  it("should handle path with unicode characters", () => {
    const result = getStorageKey("/proj/üñíćödé");
    expect(result).toBe("opendevdock_sessions_%2Fproj%2F%C3%BC%C3%B1%C3%AD%C4%87%C3%B6d%C3%A9");
  });
});

describe("loadSessionsFromStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array when no data in storage", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const result = loadSessionsFromStorage("/test/project");

    expect(result).toEqual([]);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith("opendevdock_sessions_%2Ftest%2Fproject");
  });

  it("should parse and return sessions from storage", () => {
    const sessions: Session[] = [
      {
        id: "session-1",
        projectPath: "/test/project",
        projectName: "Test Project",
        createdAt: 1704067200000,
        name: "Test Project (main) - 1/1/2024",
        changedFiles: [],
      },
    ];
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessions));

    const result = loadSessionsFromStorage("/test/project");

    expect(result).toEqual(sessions);
  });

  it("should return empty array when localStorage throws", () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = loadSessionsFromStorage("/test/project");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load sessions from storage:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should return empty array when JSON is invalid", () => {
    mockLocalStorage.getItem.mockReturnValue("invalid json");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = loadSessionsFromStorage("/test/project");

    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
});

describe("saveSessionsToStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save sessions to localStorage", () => {
    const sessions: Session[] = [
      {
        id: "session-1",
        projectPath: "/test/project",
        projectName: "Test Project",
        createdAt: 1704067200000,
        name: "Test Project (main) - 1/1/2024",
        changedFiles: [],
      },
    ];

    saveSessionsToStorage("/test/project", sessions);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      "opendevdock_sessions_%2Ftest%2Fproject",
      JSON.stringify(sessions)
    );
  });

  it("should handle localStorage error gracefully", () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    saveSessionsToStorage("/test/project", []);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to save sessions to storage:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});