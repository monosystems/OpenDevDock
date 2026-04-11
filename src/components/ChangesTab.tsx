import { useMemo } from "react";
import { Session, ChangedFile } from "../state/types";
import { computeDiff, getChangeTypeLabel, type DiffLine } from "../utils/diff";
import { DiffIcon, EditIcon, FileIcon, PlusIcon, TrashIcon } from "./ui/Icons";

function ChangeTypeIcon({ type }: { type: ChangedFile["changeType"] }) {
  if (type === "created") {
    return <PlusIcon size={14} />;
  }

  if (type === "deleted") {
    return <TrashIcon size={14} />;
  }

  return <EditIcon size={14} />;
}

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
  const filePath = changedFile.path;

  if (changedFile.changeType === "deleted") {
    return (
      <div className="diff-file">
        <div className="diff-file-header">
          <span className="diff-file-icon"><ChangeTypeIcon type={changedFile.changeType} /></span>
          <div className="diff-file-meta">
            <span className="diff-file-name">{fileName}</span>
            <span className="diff-file-path" title={filePath}>{filePath}</span>
          </div>
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
          <span className="diff-file-icon"><ChangeTypeIcon type={changedFile.changeType} /></span>
          <div className="diff-file-meta">
            <span className="diff-file-name">{fileName}</span>
            <span className="diff-file-path" title={filePath}>{filePath}</span>
          </div>
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
        <span className="diff-file-icon"><ChangeTypeIcon type={changedFile.changeType} /></span>
        <div className="diff-file-meta">
          <span className="diff-file-name">{fileName}</span>
          <span className="diff-file-path" title={filePath}>{filePath}</span>
        </div>
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
      <div className="content-panel-header changes-panel-header">
        <div className="content-panel-meta">
          <span className="content-panel-icon"><DiffIcon size={14} /></span>
          <div className="content-panel-copy">
            <span className="content-panel-title">Changes in this Session</span>
            <span className="content-panel-subtitle">Tracked file edits for the active workspace session</span>
          </div>
        </div>
        <div className="content-panel-badges">
          <span className="content-panel-badge">{changedFiles.length} files</span>
        </div>
      </div>
      <div className="changes-surface">
        <div className="changes-list">
        {sortedFiles.length === 0 ? (
          <div className="changes-empty">
            <span className="changes-empty-icon"><FileIcon size={18} /></span>
            <p>No changes tracked yet</p>
            <p>Edit, create, or delete files in this session to see a history here.</p>
          </div>
        ) : (
          sortedFiles.map((file) => (
            <ChangedFileView key={file.path} changedFile={file} />
          ))
        )}
        </div>
      </div>
    </div>
  );
}
