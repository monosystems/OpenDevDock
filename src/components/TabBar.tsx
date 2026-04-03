import { TabItem } from "../views/WorkspaceView";

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
  const changesTab = tabs.find((t) => t.type === "changes");
  const otherTabs = tabs.filter((t) => t.type !== "changes");

  return (
    <div className="tabs-container">
      <div className="tabs-list">
        <div className="tabs-left">
          {otherTabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? "active" : ""}`}
              onClick={() => onTabSelect(tab.id)}
              onDoubleClick={() => {
                if (tab.type === "terminal") {
                  const newTitle = prompt("Rename tab:", tab.title);
                  if (newTitle) onTabRename(tab.id, newTitle);
                }
              }}
            >
              <span className="tab-icon">
                {tab.type === "terminal" ? ">" : "📄"}
              </span>
              <span className="tab-title">
                {tab.isDirty && <span className="tab-dirty-indicator">●</span>}
                {tab.title}
              </span>
              <button
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="tabs-right">
          {hasChanges && !changesTab && (
            <button
              className="tab-add changes-tab-btn"
              onClick={onOpenChangesTab}
              title="Show Changes"
            >
              ◆ Changes
            </button>
          )}
          {changesTab && (
            <div
              className={`tab changes-tab ${changesTab.id === activeTabId ? "active" : ""}`}
              onClick={() => onTabSelect(changesTab.id)}
            >
              <span className="tab-icon">◆</span>
              <span className="tab-title">Changes</span>
            </div>
          )}
        </div>
      </div>
      <button className="tab-add" onClick={onAddTerminal}>
        +
      </button>
    </div>
  );
}
