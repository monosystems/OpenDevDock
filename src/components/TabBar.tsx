import { useState, useRef, useEffect } from "react";
import { TabItem } from "../views/WorkspaceView";
import { CloseIcon, DiffIcon, FileIcon, PlusIcon, TerminalIcon } from "./ui/Icons";

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename: (tabId: string, newTitle: string) => void;
  onAddTerminal: () => void;
  hasChanges: boolean;
  onOpenChangesTab: () => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabRename,
  onAddTerminal,
  hasChanges,
  onOpenChangesTab,
}: TabBarProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleStartEdit = (tabId: string, currentTitle: string) => {
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  };

  const handleFinishEdit = () => {
    if (editingTabId && editingTitle.trim()) {
      onTabRename(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingTabId(null);
    setEditingTitle("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFinishEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const changesTab = tabs.find((t) => t.type === "changes");
  const otherTabs = tabs.filter((t) => t.type !== "changes");

  return (
    <div className="tabs-container">
      <div className="tabs-track">
        <div className="tabs-list">
          <div className="tabs-left">
            {otherTabs.map((tab) => (
              <div
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={tab.id === activeTabId}
                aria-controls={`panel-${tab.id}`}
                tabIndex={tab.id === activeTabId ? 0 : -1}
                className={`tab tab-${tab.type} ${tab.id === activeTabId ? "active" : ""} ${tab.isDirty ? "tab-has-dirty" : ""}`}
                onClick={() => !editingTabId && onTabSelect(tab.id)}
                onDoubleClick={() => {
                  if (tab.type === "terminal") {
                    handleStartEdit(tab.id, tab.title);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onTabSelect(tab.id);
                  }
                }}
              >
                <span className="tab-icon">
                  {tab.type === "terminal" ? <TerminalIcon size={14} /> : <FileIcon size={14} />}
                </span>
                {editingTabId === tab.id ? (
                  <input
                    ref={inputRef}
                    type="text"
                    className="tab-rename-input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleFinishEdit}
                    onKeyDown={handleInputKeyDown}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="tab-title">
                    {tab.isDirty && <span className="tab-dirty-indicator">●</span>}
                    <span className="tab-title-label">{tab.title}</span>
                  </span>
                )}
                <button
                  className="tab-close"
                  aria-label={`Close ${tab.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tabs-right">
        {hasChanges && !changesTab && (
          <button
            className="tab-add changes-tab-btn"
            onClick={onOpenChangesTab}
            title="Show Changes"
          >
            <DiffIcon size={14} />
            Changes
          </button>
        )}
        {changesTab && (
          <div
            role="tab"
            id={`tab-${changesTab.id}`}
            aria-selected={changesTab.id === activeTabId}
            aria-controls={`panel-${changesTab.id}`}
            tabIndex={changesTab.id === activeTabId ? 0 : -1}
            className={`tab changes-tab ${changesTab.id === activeTabId ? "active" : ""}`}
            onClick={() => onTabSelect(changesTab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onTabSelect(changesTab.id);
              }
            }}
          >
            <span className="tab-icon"><DiffIcon size={14} /></span>
            <span className="tab-title">
              <span className="tab-title-label">Changes</span>
            </span>
          </div>
        )}
        <button className="tab-add" onClick={onAddTerminal} title="Add terminal" aria-label="Add terminal tab">
          <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}
