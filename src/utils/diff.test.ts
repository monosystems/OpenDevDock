import { describe, it, expect } from "vitest";
import { computeDiff, getChangeTypeLabel, getChangeTypeIcon } from "./diff";

describe("computeDiff", () => {
  it("should return empty array for identical content", () => {
    const result = computeDiff("line1\nline2", "line1\nline2");
    expect(result).toEqual([
      { type: "unchanged", content: "line1", oldLineNum: 1, newLineNum: 1 },
      { type: "unchanged", content: "line2", oldLineNum: 2, newLineNum: 2 },
    ]);
  });

  it("should handle empty original (file created)", () => {
    const result = computeDiff("", "new content");
    expect(result).toEqual([
      { type: "removed", content: "", oldLineNum: 1 },
      { type: "added", content: "new content", newLineNum: 1 },
    ]);
  });

  it("should handle empty current (file deleted)", () => {
    const result = computeDiff("old content", "");
    expect(result).toEqual([
      { type: "removed", content: "old content", oldLineNum: 1 },
      { type: "added", content: "", newLineNum: 1 },
    ]);
  });

  it("should handle both empty strings", () => {
    const result = computeDiff("", "");
    expect(result).toEqual([
      { type: "unchanged", content: "", oldLineNum: 1, newLineNum: 1 },
    ]);
  });

  it("should add new line at end", () => {
    const result = computeDiff("line1", "line1\nline2");
    expect(result).toEqual([
      { type: "unchanged", content: "line1", oldLineNum: 1, newLineNum: 1 },
      { type: "added", content: "line2", newLineNum: 2 },
    ]);
  });

  it("should remove last line", () => {
    const result = computeDiff("line1\nline2", "line1");
    expect(result).toEqual([
      { type: "unchanged", content: "line1", oldLineNum: 1, newLineNum: 1 },
      { type: "removed", content: "line2", oldLineNum: 2 },
    ]);
  });

  it("should modify a line in the middle", () => {
    const result = computeDiff("line1\nline2\nline3", "line1\nmodified\nline3");
    expect(result).toEqual([
      { type: "unchanged", content: "line1", oldLineNum: 1, newLineNum: 1 },
      { type: "removed", content: "line2", oldLineNum: 2 },
      { type: "added", content: "modified", newLineNum: 2 },
      { type: "unchanged", content: "line3", oldLineNum: 3, newLineNum: 3 },
    ]);
  });

  it("should handle multiple consecutive changes", () => {
    const result = computeDiff("a\nb\nc", "x\ny\nz");
    expect(result).toEqual([
      { type: "removed", content: "a", oldLineNum: 1 },
      { type: "added", content: "x", newLineNum: 1 },
      { type: "removed", content: "b", oldLineNum: 2 },
      { type: "added", content: "y", newLineNum: 2 },
      { type: "removed", content: "c", oldLineNum: 3 },
      { type: "added", content: "z", newLineNum: 3 },
    ]);
  });

  it("should handle line reorder at beginning", () => {
    const result = computeDiff("a\nb\nc", "b\na\nc");
    expect(result).toEqual([
      { type: "added", content: "b", newLineNum: 1 },
      { type: "unchanged", content: "a", oldLineNum: 1, newLineNum: 2 },
      { type: "removed", content: "b", oldLineNum: 2 },
      { type: "unchanged", content: "c", oldLineNum: 3, newLineNum: 3 },
    ]);
  });

  it("should handle line reorder at end", () => {
    const result = computeDiff("a\nb\nc", "a\nc\nb");
    expect(result).toEqual([
      { type: "unchanged", content: "a", oldLineNum: 1, newLineNum: 1 },
      { type: "added", content: "c", newLineNum: 2 },
      { type: "unchanged", content: "b", oldLineNum: 2, newLineNum: 3 },
      { type: "removed", content: "c", oldLineNum: 3 },
    ]);
  });
});

describe("getChangeTypeLabel", () => {
  it("should return 'Created' for created type", () => {
    expect(getChangeTypeLabel("created")).toBe("Created");
  });

  it("should return 'Edited' for edited type", () => {
    expect(getChangeTypeLabel("edited")).toBe("Edited");
  });

  it("should return 'Deleted' for deleted type", () => {
    expect(getChangeTypeLabel("deleted")).toBe("Deleted");
  });
});

describe("getChangeTypeIcon", () => {
  it("should return sparkle emoji for created type", () => {
    expect(getChangeTypeIcon("created")).toBe("✨");
  });

  it("should return memo emoji for edited type", () => {
    expect(getChangeTypeIcon("edited")).toBe("📝");
  });

  it("should return trash emoji for deleted type", () => {
    expect(getChangeTypeIcon("deleted")).toBe("🗑️");
  });
});