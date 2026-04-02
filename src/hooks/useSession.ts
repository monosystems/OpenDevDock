import { useState, useCallback, useRef } from "react";
import { Session, ChangedFile, ChangeType, Project } from "../state/types";
import { readFileContent } from "../commands/fileOperations";

export function useSession() {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = activeSession;

  const createSession = useCallback((project: Project): Session => {
    const session: Session = {
      id: `session-${Date.now()}`,
      projectPath: project.path,
      projectName: project.name,
      createdAt: Date.now(),
      name: `${project.name} - ${new Date().toLocaleString()}`,
      changedFiles: [],
    };
    setActiveSession(session);
    return session;
  }, []);

  const clearSession = useCallback(() => {
    setActiveSession(null);
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
      } catch (e) {
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

  const getChangedFilePaths = useCallback((): Set<string> => {
    if (!activeSession) return new Set();
    return new Set(activeSession.changedFiles.map(f => f.path));
  }, [activeSession]);

  const hasChanges = activeSession && activeSession.changedFiles.length > 0;

  return {
    activeSession,
    createSession,
    clearSession,
    trackFileChange,
    trackFileCreated,
    trackFileEdited,
    trackFileDeleted,
    getChangedFilePaths,
    hasChanges,
  };
}
