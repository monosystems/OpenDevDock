// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
  EMPTY_SOURCE_MAP,
  isMonacoLoaderSourceMapRequest,
  stripMonacoLoaderSourceMapComment,
} from "./monaco-source-map";

describe("isMonacoLoaderSourceMapRequest", () => {
  it("matches the Monaco min-maps loader request", () => {
    expect(isMonacoLoaderSourceMapRequest("/node_modules/monaco-editor/min-maps/vs/loader.js.map")).toBe(true);
  });

  it("matches generic loader.js.map requests from transformed Monaco assets", () => {
    expect(isMonacoLoaderSourceMapRequest("/node_modules/.vite/deps/loader.js.map?v=123")).toBe(true);
  });

  it("does not match unrelated source maps", () => {
    expect(isMonacoLoaderSourceMapRequest("/assets/index.js.map")).toBe(false);
  });
});

describe("EMPTY_SOURCE_MAP", () => {
  it("is valid empty sourcemap json", () => {
    expect(JSON.parse(EMPTY_SOURCE_MAP)).toEqual({
      version: 3,
      file: "loader.js",
      sources: [],
      names: [],
      mappings: "",
    });
  });
});

describe("stripMonacoLoaderSourceMapComment", () => {
  it("removes the sourcemap comment from Monaco min loader files", () => {
    const input = "line1\n//# sourceMappingURL=../../min-maps/vs/loader.js.map\n";

    expect(
      stripMonacoLoaderSourceMapComment(input, "/node_modules/monaco-editor/min/vs/loader.js")
    ).toBe("line1");
  });

  it("leaves unrelated files unchanged", () => {
    const input = "line1\n//# sourceMappingURL=index.js.map\n";

    expect(stripMonacoLoaderSourceMapComment(input, "/src/main.ts")).toBe(input);
  });
});
