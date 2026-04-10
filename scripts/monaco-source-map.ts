export const EMPTY_SOURCE_MAP = JSON.stringify({
  version: 3,
  file: "loader.js",
  sources: [],
  names: [],
  mappings: "",
});

const MONACO_LOADER_PATHS = ["/monaco-editor/min/vs/loader.js", "/monaco-editor/dev/vs/loader.js"];

export function isMonacoLoaderSourceMapRequest(url: string): boolean {
  return url.includes("/min-maps/vs/loader.js.map") || url.includes("loader.js.map");
}

export function stripMonacoLoaderSourceMapComment(code: string, id: string): string {
  if (!MONACO_LOADER_PATHS.some((path) => id.includes(path))) {
    return code;
  }

  return code.replace(/\n\/\/#[#]? sourceMappingURL=.*loader\.js\.map\s*$/m, "");
}
