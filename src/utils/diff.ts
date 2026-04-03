import { ChangeType } from "../state/types";

export interface DiffLine {
  type: "unchanged" | "added" | "removed";
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

export function computeDiff(original: string, current: string): DiffLine[] {
  const oldLines = original.split("\n");
  const newLines = current.split("\n");
  const result: DiffLine[] = [];

  const maxOldLines = oldLines.length;
  const maxNewLines = newLines.length;
  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < maxOldLines || newIdx < maxNewLines) {
    if (oldIdx >= maxOldLines) {
      result.push({
        type: "added",
        content: newLines[newIdx],
        newLineNum: newIdx + 1,
      });
      newIdx++;
    } else if (newIdx >= maxNewLines) {
      result.push({
        type: "removed",
        content: oldLines[oldIdx],
        oldLineNum: oldIdx + 1,
      });
      oldIdx++;
    } else if (oldLines[oldIdx] === newLines[newIdx]) {
      result.push({
        type: "unchanged",
        content: oldLines[oldIdx],
        oldLineNum: oldIdx + 1,
        newLineNum: newIdx + 1,
      });
      oldIdx++;
      newIdx++;
    } else {
      const oldInNew = newLines.indexOf(oldLines[oldIdx], newIdx);
      const newInOld = oldLines.indexOf(newLines[newIdx], oldIdx);

      if (oldInNew === -1 && newInOld === -1) {
        result.push({
          type: "removed",
          content: oldLines[oldIdx],
          oldLineNum: oldIdx + 1,
        });
        result.push({
          type: "added",
          content: newLines[newIdx],
          newLineNum: newIdx + 1,
        });
        oldIdx++;
        newIdx++;
      } else if (oldInNew === -1 || (newInOld !== -1 && newInOld < oldInNew)) {
        result.push({
          type: "removed",
          content: oldLines[oldIdx],
          oldLineNum: oldIdx + 1,
        });
        oldIdx++;
      } else {
        result.push({
          type: "added",
          content: newLines[newIdx],
          newLineNum: newIdx + 1,
        });
        newIdx++;
      }
    }
  }

  return result;
}

export function getChangeTypeLabel(type: ChangeType): string {
  switch (type) {
    case "created": return "Created";
    case "edited": return "Edited";
    case "deleted": return "Deleted";
  }
}

export function getChangeTypeIcon(type: ChangeType): string {
  switch (type) {
    case "created": return "✨";
    case "edited": return "📝";
    case "deleted": return "🗑️";
  }
}