import { beforeEach, describe, expect, it, vi } from "vitest";

const loaderInitMock = vi.fn();

vi.mock("@monaco-editor/react", () => ({
  __esModule: true,
  default: () => null,
  loader: {
    init: loaderInitMock,
  },
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

describe("EditorTab module loading", () => {
  beforeEach(() => {
    loaderInitMock.mockReset();
    vi.resetModules();
  });

  it("does not initialize Monaco during module import", async () => {
    await import("./EditorTab");

    expect(loaderInitMock).not.toHaveBeenCalled();
  });
});
