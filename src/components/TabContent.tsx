import { Session } from "../state/types";
import { TabItem } from "../views/WorkspaceView";
import { Terminal } from "./Terminal";
import { EditorTab } from "./EditorTab";
import { ChangesTab } from "./ChangesTab";

interface TabContentProps {
  tabs: TabItem[];
  activeTabId: string | null;
  session: Session | null;
  onTerminalResize: (tabId: string, cols: number, rows: number) => void;
  onEditorSave: (path: string) => void;
  onEditorContentChange: (path: string, isDirty: boolean) => void;
  onEditorMount: (path: string, saveHandler: () => void) => void;
  onOriginalContentLoaded: (path: string, content: string) => void;
}

export function TabContent({
  tabs,
  activeTabId,
  session,
  onTerminalResize,
  onEditorSave,
  onEditorContentChange,
  onEditorMount,
  onOriginalContentLoaded,
}: TabContentProps) {
  const getPanelClassName = (isActive: boolean): string =>
    `tab-panel ${isActive ? "is-active" : ""}`;

  return (
    <div className="tab-content">
      {tabs.map((tab) => {
        if (tab.type === "terminal") {
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              hidden={tab.id !== activeTabId}
              className={getPanelClassName(tab.id === activeTabId)}
            >
              <Terminal
                terminalId={tab.id}
                onResize={(cols, rows) => onTerminalResize(tab.id, cols, rows)}
              />
            </div>
          );
        }
        if (tab.type === "file" && tab.path && tab.id === activeTabId) {
          const filePath = tab.path;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              hidden={tab.id !== activeTabId}
              className={getPanelClassName(tab.id === activeTabId)}
            >
              <EditorTab
                path={filePath}
                onSave={() => onEditorSave(filePath)}
                onContentChange={(_isDirty, _content) => onEditorContentChange(filePath, _isDirty)}
                onMount={(saveHandler) => onEditorMount(filePath, saveHandler)}
                onOriginalContentLoaded={(content) => onOriginalContentLoaded(filePath, content)}
              />
            </div>
          );
        }
        if (tab.type === "changes" && tab.id === activeTabId && session) {
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              hidden={tab.id !== activeTabId}
              className={getPanelClassName(tab.id === activeTabId)}
            >
              <ChangesTab session={session} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
