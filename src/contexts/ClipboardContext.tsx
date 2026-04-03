import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FileNode } from "../state/types";

interface ClipboardState {
  node: FileNode | null;
  action: "cut" | "copy" | null;
}

interface ClipboardContextValue extends ClipboardState {
  cut: (node: FileNode) => void;
  copy: (node: FileNode) => void;
  paste: (destDir: FileNode) => { sourcePath: string; destDir: string } | null;
  clear: () => void;
}

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<FileNode | null>(null);
  const [action, setAction] = useState<"cut" | "copy" | null>(null);

  const cut = useCallback((fileNode: FileNode) => {
    setNode(fileNode);
    setAction("cut");
  }, []);

  const copy = useCallback((fileNode: FileNode) => {
    setNode(fileNode);
    setAction("copy");
  }, []);

  const paste = useCallback((destDir: FileNode): { sourcePath: string; destDir: string } | null => {
    if (!node || !action || !destDir.is_dir) {
      return null;
    }
    const result = { sourcePath: node.path, destDir: destDir.path };
    if (action === "cut") {
      setNode(null);
      setAction(null);
    }
    return result;
  }, [node, action]);

  const clear = useCallback(() => {
    setNode(null);
    setAction(null);
  }, []);

  return (
    <ClipboardContext.Provider value={{ node, action, cut, copy, paste, clear }}>
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard(): ClipboardContextValue {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error("useClipboard must be used within ClipboardProvider");
  }
  return context;
}
