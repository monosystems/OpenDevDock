import { useState, useCallback, useRef, useEffect } from "react";
import { Session, ChangedFile, ChangeType, Project } from "../state/types";
import { readFileContent, getGitBranch } from "../commands/fileOperations";

export const MAX_SESSIONS_DISPLAY = 3;

export function getStorageKey(projectPath: string): string {
  return `opendevdock_sessions_${encodeURIComponent(projectPath)}`;
}

export function loadSessionsFromStorage(projectPath: string): Session[] {
  try {
    const saved = localStorage.getItem(getStorageKey(projectPath));
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e: unknown) {
    console.error("Failed to load sessions from storage:", e);
  }
  return [];
}

export function saveSessionsToStorage(projectPath: string, sessions: Session[]): void {
  try {
    localStorage.setItem(getStorageKey(projectPath), JSON.stringify(sessions));
  } catch (e: unknown) {
    console.error("Failed to save sessions to storage:", e);
  }
}

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionsByProject, setSessionsByProject] = useState<Record<string, Session[]>>({});
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = activeSession;

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeSession && activeSession.changedFiles.length > 0) {
        const existingSessions = loadSessionsFromStorage(activeSession.projectPath);
        const filteredSessions = existingSessions.filter(s => s.id !== activeSession.id);
        const updatedSessions = [activeSession, ...filteredSessions];
        saveSessionsToStorage(activeSession.projectPath, updatedSessions);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeSession]);

  const loadSessionsForProject = useCallback((projectPath: string): Session[] => {
    if (!sessionsByProject[projectPath]) {
      const loaded = loadSessionsFromStorage(projectPath);
      setSessionsByProject(prev => ({
        ...prev,
        [projectPath]: loaded,
      }));
      return loaded;
    }
    return sessionsByProject[projectPath];
  }, [sessionsByProject]);

  const createSession = useCallback(async (project: Project): Promise<Session> => {
    let branchName = "";
    try {
      branchName = await getGitBranch(project.path) || "";
    } catch {
      // Not a git repository
    }

    const name = branchName
      ? `${project.name} (${branchName}) - ${new Date().toLocaleString()}`
      : `${project.name} - ${new Date().toLocaleString()}`;

    const session: Session = {
      id: `session-${Date.now()}`,
      projectPath: project.path,
      projectName: project.name,
      createdAt: Date.now(),
      name,
      changedFiles: [],
    };
    setActiveSession(session);
    return session;
  }, []);

  const clearSession = useCallback(() => {
    if (activeSession && activeSession.changedFiles.length > 0) {
      const existingSessions = sessionsByProject[activeSession.projectPath] || [];
      const filteredSessions = existingSessions.filter(s => s.id !== activeSession.id);
      const updatedSessions = [activeSession, ...filteredSessions];

      setSessionsByProject(prev => ({
        ...prev,
        [activeSession.projectPath]: updatedSessions,
      }));
      saveSessionsToStorage(activeSession.projectPath, updatedSessions);
    }
    setActiveSession(null);
  }, [activeSession, sessionsByProject]);

  const setActiveSessionFromHistory = useCallback((session: Session) => {
    setActiveSession(session);
  }, []);

  const trackFileChange = useCallback(async (
    path: string,
    name: string,
    changeType: ChangeType,
    originalContent: string | null = null
  ) => {
    const session = sessionRef.current;
    if (!session) return;

    let currentContent: string | null = null;
    if (changeType !== "deleted") {
      try {
        currentContent = await readFileContent(path);
      } catch (e: unknown) {
        console.error("Failed to read current content:", e);
      }
    }

    const changedFile: ChangedFile = {
      path,
      name,
      changeType,
      originalContent,
      currentContent,
      timestamp: Date.now(),
    };

    setActiveSession((prev) => {
      if (!prev) return prev;
      const existingIndex = prev.changedFiles.findIndex(f => f.path === path);
      const newChangedFiles = [...prev.changedFiles];
      if (existingIndex >= 0) {
        newChangedFiles[existingIndex] = changedFile;
      } else {
        newChangedFiles.push(changedFile);
      }
      return { ...prev, changedFiles: newChangedFiles };
    });
  }, []);

  const trackFileCreated = useCallback(async (path: string, name: string) => {
    await trackFileChange(path, name, "created", null);
  }, [trackFileChange]);

  const trackFileEdited = useCallback(async (
    path: string,
    name: string,
    originalContent: string
  ) => {
    await trackFileChange(path, name, "edited", originalContent);
  }, [trackFileChange]);

  const trackFileDeleted = useCallback(async (
    path: string,
    name: string,
    originalContent: string
  ) => {
    await trackFileChange(path, name, "deleted", originalContent);
  }, [trackFileChange]);

  const trackDirectoryDeleted = useCallback(async (
    node: { path: string; name: string; is_dir: boolean; children?: { path: string; name: string; is_dir: boolean; children?: unknown[] }[] }
  ) => {
    const session = sessionRef.current;
    if (!session) return;

    const trackNode = async (n: { path: string; name: string; is_dir: boolean; children?: unknown[] }) => {
      if (!n.is_dir) {
        let originalContent = "";
        try {
          originalContent = await readFileContent(n.path);
        } catch {
          // File might not exist or be readable
        }
        await trackFileChange(n.path, n.name, "deleted", originalContent);
      }
      if (n.children) {
        for (const child of n.children) {
          await trackNode(child as { path: string; name: string; is_dir: boolean; children?: unknown[] });
        }
      }
    };

    await trackNode(node);
    await trackFileChange(node.path, node.name, "deleted", null);
  }, [trackFileChange]);

  const getChangedFilePaths = useCallback((): Set<string> => {
    if (!activeSession) return new Set();
    return new Set(activeSession.changedFiles.map(f => f.path));
  }, [activeSession]);

  const hasChanges = activeSession && activeSession.changedFiles.length > 0;

  const deleteSession = useCallback((sessionId: string, projectPath: string) => {
    console.log("[useSession] deleteSession called:", { sessionId, projectPath });
    setSessionsByProject(prev => {
      const projectSessions = prev[projectPath] || [];
      console.log("[useSession] Current sessions:", projectSessions.map(s => s.id));
      const updatedSessions = projectSessions.filter(s => s.id !== sessionId);
      console.log("[useSession] After filter:", updatedSessions.map(s => s.id));
      saveSessionsToStorage(projectPath, updatedSessions);
      return {
        ...prev,
        [projectPath]: updatedSessions,
      };
    });
  }, []);

  const updateSessionName = useCallback((sessionId: string, projectPath: string, newName: string) => {
    if (activeSession && activeSession.id === sessionId) {
      setActiveSession(prev => prev ? { ...prev, name: newName } : prev);
    }
    setSessionsByProject(prev => {
      const projectSessions = prev[projectPath] || [];
      const updatedSessions = projectSessions.map(s =>
        s.id === sessionId ? { ...s, name: newName } : s
      );
      saveSessionsToStorage(projectPath, updatedSessions);
      return {
        ...prev,
        [projectPath]: updatedSessions,
      };
    });
  }, [activeSession]);

  return {
    activeSession,
    sessionsByProject,
    createSession,
    clearSession,
    setActiveSessionFromHistory,
    trackFileChange,
    trackFileCreated,
    trackFileEdited,
    trackFileDeleted,
    trackDirectoryDeleted,
    getChangedFilePaths,
    hasChanges,
    loadSessionsForProject,
    deleteSession,
    updateSessionName,
  };
}