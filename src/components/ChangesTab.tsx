import { useMemo } from "react";
import { Session, ChangedFile } from "../state/types";
import { computeDiff, getChangeTypeLabel, getChangeTypeIcon, type DiffLine } from "../utils/diff";

function DiffView({ diffLines }: { diffLines: DiffLine[] }) {
  return (
    <div className="diff-view">
      <div className="diff-content">
        {diffLines.map((line, index) => (
          <div key={index} className={`diff-line diff-line-${line.type}`}>
            <span className="diff-line-num">
              {line.oldLineNum ?? ""}
            </span>
            <span className="diff-line-num">
              {line.newLineNum ?? ""}
            </span>
            <span className="diff-line-marker">
              {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
            </span>
            <span className="diff-line-content">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangedFileView({ changedFile }: { changedFile: ChangedFile }) {
  const fileName = changedFile.name;

  if (changedFile.changeType === "deleted") {
    return (
      <div className="diff-file">
        <div className="diff-file-header">
          <span className="diff-file-icon">{getChangeTypeIcon(changedFile.changeType)}</span>
          <span className="diff-file-name">{fileName}</span>
          <span className="diff-file-badge deleted">{getChangeTypeLabel(changedFile.changeType)}</span>
        </div>
        <div className="diff-deleted-notice">
          File was deleted
        </div>
        {changedFile.originalContent && (
          <DiffView diffLines={computeDiff(changedFile.originalContent, "")} />
        )}
      </div>
    );
  }

  if (changedFile.changeType === "created") {
    return (
      <div className="diff-file">
        <div className="diff-file-header">
          <span className="diff-file-icon">{getChangeTypeIcon(changedFile.changeType)}</span>
          <span className="diff-file-name">{fileName}</span>
          <span className="diff-file-badge created">{getChangeTypeLabel(changedFile.changeType)}</span>
        </div>
        {changedFile.currentContent && (
          <DiffView diffLines={computeDiff("", changedFile.currentContent)} />
        )}
      </div>
    );
  }

  // For edited files
  const diffLines = useMemo(() => {
    if (changedFile.originalContent === null && changedFile.currentContent === null) {
      return [];
    }
    return computeDiff(
      changedFile.originalContent || "",
      changedFile.currentContent || ""
    );
  }, [changedFile.originalContent, changedFile.currentContent]);

  return (
    <div className="diff-file">
      <div className="diff-file-header">
        <span className="diff-file-icon">{getChangeTypeIcon(changedFile.changeType)}</span>
        <span className="diff-file-name">{fileName}</span>
        <span className="diff-file-badge edited">{getChangeTypeLabel(changedFile.changeType)}</span>
      </div>
      <DiffView diffLines={diffLines} />
    </div>
  );
}

interface ChangesTabProps {
  session: Session;
}

export function ChangesTab({ session }: ChangesTabProps) {
  const { changedFiles } = session;

  const sortedFiles = useMemo(() => {
    return [...changedFiles].sort((a, b) => b.timestamp - a.timestamp);
  }, [changedFiles]);

  return (
    <div className="changes-tab-container">
      <div className="changes-header">
        <h3>Changes in this Session</h3>
        <span className="changes-count">{changedFiles.length} file(s) changed</span>
      </div>
      <div className="changes-list">
        {sortedFiles.length === 0 ? (
          <p className="changes-empty">No changes tracked yet</p>
        ) : (
          sortedFiles.map((file) => (
            <ChangedFileView key={file.path} changedFile={file} />
          ))
        )}
      </div>
    </div>
  );
}
