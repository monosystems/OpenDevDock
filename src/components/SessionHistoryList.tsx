import { useState, useCallback, useMemo, useEffect } from "react";
import { Session } from "../state/types";
import { MAX_SESSIONS_DISPLAY } from "../hooks/useSession";

interface SessionHistoryListProps {
  projectPath: string;
  sessions: Session[];
  onOpenSession: (session: Session) => void;
  onDeleteSession: (sessionId: string, projectPath: string) => void;
  onUpdateSessionName: (sessionId: string, projectPath: string, newName: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function SessionHistoryList({
  projectPath,
  sessions,
  onOpenSession,
  onDeleteSession,
  onUpdateSessionName,
}: SessionHistoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalEditingId, setModalEditingId] = useState<string | null>(null);
  const [modalEditValue, setModalEditValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{ sessionId: string; sessionName: string } | null>(null);

  const displayedSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_SESSIONS_DISPLAY);
  }, [sessions]);

  const sortedAllSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.createdAt - a.createdAt);
  }, [sessions]);

  const hasMoreSessions = sessions.length > MAX_SESSIONS_DISPLAY;

  const handleStartEdit = useCallback((session: Session) => {
    setEditingId(session.id);
    setEditValue(session.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editValue.trim()) {
      onUpdateSessionName(editingId, projectPath, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue, projectPath, onUpdateSessionName]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  }, [handleSaveEdit, handleCancelEdit]);

  const handleDelete = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setConfirmDelete({ sessionId, sessionName: session.name });
    }
  }, [sessions]);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      onDeleteSession(confirmDelete.sessionId, projectPath);
      setConfirmDelete(null);
    }
  }, [confirmDelete, projectPath, onDeleteSession]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);

  const handleSessionClick = useCallback((session: Session) => {
    if (editingId) return;
    onOpenSession(session);
  }, [editingId, onOpenSession]);

  const handleRename = useCallback((session: Session) => {
    handleStartEdit(session);
  }, [handleStartEdit]);

  const handleModalRename = useCallback((session: Session) => {
    setModalEditingId(session.id);
    setModalEditValue(session.name);
  }, []);

  const handleModalSaveEdit = useCallback(() => {
    if (modalEditingId && modalEditValue.trim()) {
      onUpdateSessionName(modalEditingId, projectPath, modalEditValue.trim());
    }
    setModalEditingId(null);
    setModalEditValue("");
  }, [modalEditingId, modalEditValue, projectPath, onUpdateSessionName]);

  const handleModalCancelEdit = useCallback(() => {
    setModalEditingId(null);
    setModalEditValue("");
  }, []);

  const handleModalKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleModalSaveEdit();
    } else if (e.key === "Escape") {
      handleModalCancelEdit();
    }
  }, [handleModalSaveEdit, handleModalCancelEdit]);

  const handleModalSessionClick = useCallback((session: Session) => {
    if (modalEditingId) return;
    onOpenSession(session);
    setShowModal(false);
  }, [modalEditingId, onOpenSession]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="session-history-list">
        <div className="session-history-header">
          <h3>Recent Sessions</h3>
          <span className="session-count">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
          {hasMoreSessions && (
            <button
              className="show-all-sessions-btn"
              onClick={() => setShowModal(true)}
            >
              Show all ({sessions.length})
            </button>
          )}
        </div>
        <div className="session-history-items">
          {displayedSessions.map((session) => (
            <div key={session.id} className="session-history-item">
              <div className="session-item-info" onClick={() => handleSessionClick(session)}>
                {editingId === session.id ? (
                  <input
                    type="text"
                    className="session-name-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveEdit}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="session-item-name">
                    {session.name}
                  </span>
                )}
                <div className="session-item-meta">
                  <span>{formatTimestamp(session.createdAt)}</span>
                  <span className="session-item-changes">
                    {session.changedFiles.length} change{session.changedFiles.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="session-item-actions">
                <button
                  className="session-action-btn"
                  onClick={(e) => { e.stopPropagation(); handleRename(session); }}
                  title="Rename"
                >
                  ✏️
                </button>
                <button
                  className="session-action-btn delete"
                  onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="session-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="session-modal-header">
              <h2>All Sessions</h2>
              <button className="session-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="session-modal-content">
              {sortedAllSessions.map((session) => (
                <div key={session.id} className="session-history-item">
                  <div className="session-item-info" onClick={() => handleModalSessionClick(session)}>
                    {modalEditingId === session.id ? (
                      <input
                        type="text"
                        className="session-name-input"
                        value={modalEditValue}
                        onChange={(e) => setModalEditValue(e.target.value)}
                        onKeyDown={handleModalKeyDown}
                        onBlur={handleModalSaveEdit}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="session-item-name">
                        {session.name}
                      </span>
                    )}
                    <div className="session-item-meta">
                      <span>{formatTimestamp(session.createdAt)}</span>
                      <span className="session-item-changes">
                        {session.changedFiles.length} change{session.changedFiles.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="session-item-actions">
                    <button
                      className="session-action-btn"
                      onClick={(e) => { e.stopPropagation(); handleModalRename(session); }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="session-action-btn delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="session-modal-overlay" onClick={handleCancelDelete}>
          <div className="session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="session-modal-header">
              <h2>Delete Session</h2>
              <button className="session-modal-close" onClick={handleCancelDelete}>×</button>
            </div>
            <div className="session-modal-content" style={{ padding: "20px" }}>
              <p style={{ marginBottom: "20px", color: "var(--text-primary)" }}>
                Delete session <strong>"{confirmDelete.sessionName}"</strong>?<br />
                This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button className="btn-cancel" onClick={handleCancelDelete}>Cancel</button>
                <button className="btn-danger" onClick={handleConfirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}