import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Project, FileNode, Session } from "../state/types";
import { FileTree } from "../components/FileTree";
import { useTerminalManager } from "../hooks/useTerminalManager";
import { TabBar } from "../components/TabBar";
import { TabContent } from "../components/TabContent";
import { Resizer } from "../components/Resizer";
import { useToast } from "../contexts/ToastContext";
import { ArrowLeftIcon, FolderIcon } from "../components/ui/Icons";

import {
  createFile,
  createDirectory,
  renamePath,
  deletePath,
  movePath,
  readFileContent,
} from "../commands/fileOperations";

interface WorkspaceViewProps {
  project: Project;
  onClose: () => void;
  session: Session | null;
  trackFileCreated: (path: string, name: string) => void;
  trackFileEdited: (path: string, name: string, originalContent: string) => void;
  trackFileDeleted: (path: string, name: string, originalContent: string) => void;
  trackDirectoryDeleted: (node: FileNode) => Promise<void>;
  changedFilePaths: Set<string>;
  hasChanges: boolean;
  openInChangesView?: boolean;
}

export interface TabItem {
  id: string;
  type: "terminal" | "file" | "changes";
  title: string;
  path?: string;
  terminalId?: string;
  isDirty?: boolean;
}

interface SessionDisplayInfo {
  branch: string | null;
  timestamp: string | null;
}

function stripProjectPrefix(sessionName: string, projectName: string): string {
  if (sessionName.startsWith(`${projectName}_`)) {
    return sessionName.slice(projectName.length + 1);
  }

  if (sessionName.startsWith(`${projectName} - `)) {
    return sessionName.slice(projectName.length + 3);
  }

  return sessionName;
}

function parseSessionDisplayInfo(sessionName: string, projectName: string): SessionDisplayInfo {
  const match = sessionName.match(/^(.*?)\s*\(([^)]+)\)\s*-\s*(.+)$/);

  if (!match) {
    return {
      branch: null,
      timestamp: null,
    };
  }

  const [, primary, branch, timestamp] = match;

  const cleanedPrimary = stripProjectPrefix(primary.trim(), projectName);

  return {
    branch: branch.trim() || cleanedPrimary || null,
    timestamp: timestamp.trim(),
  };
}

export function WorkspaceView({
  project,
  onClose,
  session,
  trackFileCreated,
  trackFileEdited,
  trackFileDeleted,
  trackDirectoryDeleted,
  changedFilePaths,
  hasChanges,
  openInChangesView = false,
}: WorkspaceViewProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [treeWidth, setTreeWidth] = useState(260);
  const [tabList, setTabList] = useState<TabItem[]>([]);
  const [rootDragOver, setRootDragOver] = useState(false);
  
  // Refs for managing editor state - use refs to avoid re-renders
  const editorSaveHandlers = useRef<Map<string, () => void>>(new Map());
  const activeTabIdRef = useRef<string | null>(null);
  const tabListRef = useRef<TabItem[]>([]);
  const originalContentRef = useRef<Map<string, string>>(new Map());
  
  // Keep refs in sync with state
  activeTabIdRef.current = activeTabId;
  tabListRef.current = tabList;

  const {
    createTerminal,
    closeTerminal,
    resizeTerminal,
    renameTerminal,
  } = useTerminalManager();

  const toast = useToast();
  const sessionDisplay = session ? parseSessionDisplayInfo(session.name, project.name) : null;

  useEffect(() => {
    loadFileTree();
    initTerminal();
  }, [project.path]);

  // Global keyboard handler for Ctrl+S / Cmd+S - setup once
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const activeTabId = activeTabIdRef.current;
        const tab = tabListRef.current.find(t => t.id === activeTabId);
        if (tab?.type === "file" && tab.path) {
          const saveHandler = editorSaveHandlers.current.get(tab.path);
          if (saveHandler) {
            saveHandler();
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []); // Empty deps - setup once

  // Auto-open Changes tab when opening a session from history
  useEffect(() => {
    if (openInChangesView && session && !tabList.some(t => t.type === "changes")) {
      handleOpenChangesTab();
    }
  }, [openInChangesView, session]);

  const initTerminal = async () => {
    try {
      const { id } = await createTerminal(project.path, "Terminal");
      setTabList([
        { id, type: "terminal" as const, title: "Terminal", terminalId: id },
      ]);
      setActiveTabId(id);
    } catch (e: unknown) {
      console.error("Failed to create initial terminal:", e);
    }
  };

  const loadFileTree = async () => {
    try {
      const result = await invoke<FileNode[]>("read_directory", {
        path: project.path,
      });
      setFileTree(result);
    } catch (e: unknown) {
      console.error("Failed to load file tree:", e);
      setFileTree([]);
    }
  };

  const handleTreeResize = useCallback((newWidth: number) => {
    setTreeWidth(newWidth);
  }, []);

  const handleFileClick = useCallback((node: FileNode) => {
    if (node.is_dir) return;

    const existingTab = tabListRef.current.find(
      (t) => t.type === "file" && t.path === node.path
    );
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTabId = `file-${Date.now()}`;
    const newTab: TabItem = { id: newTabId, type: "file", title: node.name, path: node.path };
    setTabList((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  }, []);

  const handleCloseTab = useCallback((tabId: string, force: boolean = false) => {
    const tab = tabListRef.current.find((t) => t.id === tabId);
    if (!tab) return;
    
    // Changes tab cannot be closed
    if (tab.type === "changes") {
      return;
    }
    
    // For file tabs with unsaved changes, prompt before closing
    if (tab.type === "file" && tab.isDirty && !force) {
      const confirmed = window.confirm(`${tab.title} has unsaved changes. Close anyway?`);
      if (!confirmed) return;
    }
    
    if (tab.type === "terminal" && tab.terminalId) {
      closeTerminal(tab.terminalId);
    }
    
    // Clean up save handler
    if (tab.path) {
      editorSaveHandlers.current.delete(tab.path);
    }
    
    setTabList((prev) => {
      const newList = prev.filter((t) => t.id !== tabId);
      const currentActive = activeTabIdRef.current;
      
      if (newList.length === 0) {
        // Create new terminal
        createTerminal(project.path, "Terminal").then(({ id }) => {
          const newTab: TabItem = { 
            id, 
            type: "terminal" as const,
            title: "Terminal",
            terminalId: id
          };
          setTabList([newTab]);
          setActiveTabId(id);
        });
        return prev; // Return old list temporarily
      }
      
      if (tabId === currentActive) {
        // Switch to the last tab or the one before the closed one
        const closedIndex = prev.findIndex((t) => t.id === tabId);
        const newActiveIndex = Math.min(closedIndex, newList.length - 1);
        setActiveTabId(newList[newActiveIndex]?.id || null);
      }
      
      return newList;
    });
  }, [closeTerminal, createTerminal, project.path]);

  const handleAddTerminal = useCallback(async () => {
    try {
      const { id } = await createTerminal(project.path, "Terminal");
      const newTab: TabItem = { id, type: "terminal" as const, title: "Terminal", terminalId: id };
      setTabList((prev) => [...prev, newTab]);
      setActiveTabId(id);
    } catch (e: unknown) {
      console.error("Failed to create terminal:", e);
    }
  }, [createTerminal, project.path]);

  const handleOpenChangesTab = useCallback(() => {
    const existingTab = tabListRef.current.find((t) => t.type === "changes");
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    const newTabId = `changes-${Date.now()}`;
    const newTab: TabItem = { id: newTabId, type: "changes" as const, title: "Changes" };
    setTabList((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  }, []);

  const handleRenameTab = useCallback((tabId: string, newTitle: string) => {
    renameTerminal(tabId, newTitle);
    setTabList((prev) =>
      prev.map((t) =>
        t.id === tabId ? { ...t, title: newTitle } : t
      )
    );
  }, [renameTerminal]);

  const handleTerminalResize = useCallback((tabId: string, cols: number, rows: number) => {
    resizeTerminal(tabId, cols, rows);
  }, [resizeTerminal]);

  const handleEditorSave = useCallback((path: string) => {
    const originalContent = originalContentRef.current.get(path) || "";
    const name = path.split("/").pop() || path;
    trackFileEdited(path, name, originalContent);
    
    setTabList((prev) =>
      prev.map((t) =>
        t.path === path ? { ...t, isDirty: false } : t
      )
    );
  }, [trackFileEdited]);

  const handleEditorContentChange = useCallback((path: string, isDirty: boolean) => {
    setTabList((prev) =>
      prev.map((t) =>
        t.path === path ? { ...t, isDirty } : t
      )
    );
  }, []);

  const handleEditorMount = useCallback((path: string, saveHandler: () => void) => {
    editorSaveHandlers.current.set(path, saveHandler);
  }, []);

  const handleOriginalContentLoaded = useCallback((path: string, content: string) => {
    originalContentRef.current.set(path, content);
  }, []);

  const handleCreateFile = useCallback(
    async (parentPath: string, name: string) => {
      try {
        const result = await createFile(parentPath, name);
        trackFileCreated(result.path, name);
        await loadFileTree();
      } catch (e: unknown) {
        console.error("Failed to create file:", e);
        toast.error(e instanceof Error ? `Fehler beim Erstellen der Datei: ${e.message}` : "Fehler beim Erstellen der Datei");
      }
    },
    [trackFileCreated]
  );

  const handleCreateDirectory = useCallback(
    async (parentPath: string, name: string) => {
      try {
        await createDirectory(parentPath, name);
        await loadFileTree();
      } catch (e: unknown) {
        console.error("Failed to create directory:", e);
        toast.error(e instanceof Error ? `Fehler beim Erstellen des Ordners: ${e.message}` : "Fehler beim Erstellen des Ordners");
      }
    },
    []
  );

  const handleRename = useCallback(
    async (node: FileNode, newName: string) => {
      try {
        const result = await renamePath(node.path, newName);
        await loadFileTree();
        setTabList((prev) =>
          prev.map((t) =>
            t.path === node.path
              ? { ...t, title: result.name, path: result.path }
              : t
          )
        );
      } catch (e: unknown) {
        console.error("Failed to rename:", e);
        toast.error(e instanceof Error ? `Fehler beim Umbenennen: ${e.message}` : "Fehler beim Umbenennen");
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (node: FileNode) => {
      try {
        if (node.is_dir) {
          await trackDirectoryDeleted(node);
        } else {
          let originalContent = "";
          try {
            originalContent = await readFileContent(node.path);
          } catch {
            // File might not exist
          }
          trackFileDeleted(node.path, node.name, originalContent);
        }
        await deletePath(node.path);
        await loadFileTree();
        setTabList((prev) => prev.filter((t) => t.path !== node.path));
      } catch (e: unknown) {
        console.error("Failed to delete:", e);
        toast.error(e instanceof Error ? `Fehler beim Löschen: ${e.message}` : "Fehler beim Löschen");
      }
    },
    [trackFileDeleted, trackDirectoryDeleted]
  );

  const handleMove = useCallback(
    async (sourcePath: string, destDir: string) => {
      try {
        await movePath(sourcePath, destDir);
        await loadFileTree();
      } catch (e: unknown) {
        console.error("Failed to move:", e);
        toast.error(e instanceof Error ? `Fehler beim Verschieben: ${e.message}` : "Fehler beim Verschieben");
      }
    },
    []
  );

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-main">
          <button className="header-back-button" onClick={onClose}>
            <ArrowLeftIcon size={14} />
            Projects
          </button>
          <div className="header-project-meta">
            <span className="header-project-name">{project.name}</span>
            <span className="header-project-path" title={project.path}>{project.path}</span>
          </div>
        </div>
        {session && sessionDisplay && (
          <div className="session-name header-session-chip" title={session.name}>
            {sessionDisplay.branch && (
              <span className="header-session-branch">{sessionDisplay.branch}</span>
            )}
            {sessionDisplay.timestamp && (
              <span className="header-session-meta">{sessionDisplay.timestamp}</span>
            )}
          </div>
        )}
      </div>
        <div className="app-content">
          <div className="file-tree" style={{ width: treeWidth }}>
            <div className="file-tree-header">
              <span className="file-tree-header-label">Explorer</span>
              <span className="file-tree-header-caption">Workspace navigation</span>
            </div>
            <div className="file-tree-body">
              <div
                className={`file-tree-root-drop ${rootDragOver ? 'file-node-drag-over' : ''}`}
                data-node-path={project.path}
                data-is-dir="true"
              >
                <span className="file-tree-root-icon">
                  <FolderIcon size={14} />
                </span>
                <div className="file-tree-root-meta">
                  <span className="file-tree-root-name">{project.name}</span>
                  <span className="file-tree-root-path" title={project.path}>{project.path}</span>
                </div>
              </div>
              <div className="file-tree-section-label">Files</div>
              <div className="file-tree-content">
                <FileTree
                  nodes={fileTree}
                  onFileClick={handleFileClick}
                  onCreateFile={handleCreateFile}
                  onCreateDirectory={handleCreateDirectory}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  rootPath={project.path}
                  onRootDragOverChange={setRootDragOver}
                  changedFilePaths={changedFilePaths}
                />
              </div>
            </div>
          </div>
        <Resizer onResize={handleTreeResize} />
        <div className="main-area">
          <TabBar
            tabs={tabList}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={handleCloseTab}
            onTabRename={handleRenameTab}
            onAddTerminal={handleAddTerminal}
            hasChanges={hasChanges}
            onOpenChangesTab={handleOpenChangesTab}
          />
          <TabContent
            tabs={tabList}
            activeTabId={activeTabId}
            session={session}
            onTerminalResize={handleTerminalResize}
            onEditorSave={handleEditorSave}
            onEditorContentChange={handleEditorContentChange}
            onEditorMount={handleEditorMount}
            onOriginalContentLoaded={handleOriginalContentLoaded}
          />
        </div>
      </div>
    </div>
  );
}
