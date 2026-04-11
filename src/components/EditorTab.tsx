import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { OnMount, OnChange, loader } from "@monaco-editor/react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { FileIcon } from "./ui/Icons";

let monacoThemeInitialization: Promise<void> | null = null;

function ensureMonacoThemeInitialized(): Promise<void> {
  if (monacoThemeInitialization) {
    return monacoThemeInitialization;
  }

  monacoThemeInitialization = loader.init().then(
    (monaco) => {
      monaco.editor.defineTheme("opendevdock-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "7f8ba1", fontStyle: "italic" },
          { token: "keyword", foreground: "c4b5fd" },
          { token: "string", foreground: "86efac" },
          { token: "number", foreground: "7dd3fc" },
          { token: "type", foreground: "93c5fd" },
          { token: "function", foreground: "bfdbfe" },
          { token: "variable", foreground: "e5edf8" },
          { token: "constant", foreground: "7dd3fc" },
        ],
        colors: {
          "editor.background": "#0b0f15",
          "editor.foreground": "#e5edf8",
          "editor.lineHighlightBackground": "#121924",
          "editor.selectionBackground": "rgba(147, 197, 253, 0.16)",
          "editor.inactiveSelectionBackground": "rgba(147, 197, 253, 0.08)",
          "editorCursor.foreground": "#93c5fd",
          "editorLineNumber.foreground": "#6f7b90",
          "editorLineNumber.activeForeground": "#dce8f8",
          "editorIndentGuide.background1": "#182130",
          "editorIndentGuide.activeBackground1": "#93c5fd",
          "editor.selectionHighlightBackground": "rgba(147, 197, 253, 0.08)",
          "editorBracketMatch.background": "rgba(147, 197, 253, 0.12)",
          "editorBracketMatch.border": "#93c5fd",
          "scrollbar.shadow": "#0b0f15",
          "scrollbarSlider.background": "rgba(147, 197, 253, 0.22)",
          "scrollbarSlider.hoverBackground": "rgba(147, 197, 253, 0.32)",
          "scrollbarSlider.activeBackground": "rgba(147, 197, 253, 0.42)",
        },
      });
    },
    (e: unknown) => {
      console.error("Failed to initialize Monaco editor:", e);
    }
  );

  return monacoThemeInitialization;
}

interface EditorTabProps {
  path: string;
  onSave?: () => void;
  onContentChange?: (isDirty: boolean, content: string) => void;
  onMount?: (saveHandler: () => void) => void;
  onOriginalContentLoaded?: (content: string) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

// Map file extensions to Monaco language IDs
function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    php: "php",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    markdown: "markdown",
    sql: "sql",
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    ps1: "powershell",
    dockerfile: "dockerfile",
    toml: "toml",
    ini: "ini",
    conf: "ini",
    config: "ini",
    gitignore: "ini",
    env: "ini",
    txt: "plaintext",
    log: "plaintext",
    csv: "plaintext",
  };
  return languageMap[ext] || "plaintext";
}

export function EditorTab({ 
  path, 
  onSave, 
  onContentChange, 
  onMount, 
  onOriginalContentLoaded,
  autoSave = false,
  autoSaveDelay = 2000,
}: EditorTabProps) {
  // State hooks - always called in same order
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const contentRef = useRef<string>("");
  const isDirtyRef = useRef(false);
  const saveHandlerRef = useRef<(() => void) | null>(null);
  const pathRef = useRef(path);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Keep path ref updated
  pathRef.current = path;

  // Load file content once on mount
  useEffect(() => {
    void ensureMonacoThemeInitialized();
  }, []);

  // Load file content once on mount
  useEffect(() => {
    let cancelled = false;
    
    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const text = await readTextFile(path);
        if (cancelled) return;
        setContent(text);
        setOriginalContent(text);
        contentRef.current = text;
        isDirtyRef.current = false;
        onOriginalContentLoaded?.(text);
      } catch (e: unknown) {
        if (cancelled) return;
        console.error("Failed to read file:", e);
        setError(e instanceof Error ? `Failed to load file: ${e.message}` : "Failed to load file");
        setContent("");
        setOriginalContent("");
        contentRef.current = "";
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFile();
    
    return () => {
      cancelled = true;
    };
  }, [path]);

  // Handle save - defined with useCallback to maintain stability
  const handleSave = useCallback(() => {
    if (!isDirtyRef.current) return;

    const currentContent = contentRef.current;
    
    writeTextFile(pathRef.current, currentContent)
      .then(() => {
        setOriginalContent(currentContent);
        contentRef.current = currentContent;
        isDirtyRef.current = false;
        onSave?.();
        onContentChange?.(false, currentContent);
      })
      .catch((e: unknown) => {
        console.error("Failed to save file:", e);
        setError(e instanceof Error ? `Failed to save file: ${e.message}` : "Failed to save file");
      });
  }, [onSave, onContentChange]);

  // Store save handler ref for external access
  useEffect(() => {
    saveHandlerRef.current = handleSave;
    onMount?.(handleSave);
  }, [handleSave, onMount]);

  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editorInstance) => {
    editorRef.current = editorInstance;
    
    // Add Ctrl+S / Cmd+S handler for saving
    editorInstance.addCommand(
      2048 | 49, // Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyS
      () => {
        if (saveHandlerRef.current) {
          saveHandlerRef.current();
        }
      }
    );

    // Focus the editor
    editorInstance.focus();
    
    // Expose save handler to parent
    onMount?.(handleSave);
  }, [handleSave, onMount]);

  // Handle content change
  const handleChange: OnChange = useCallback((value) => {
    const newContent = value || "";
    setContent(newContent);
    contentRef.current = newContent;
    
    const dirty = newContent !== originalContent;
    isDirtyRef.current = dirty;
    onContentChange?.(dirty, newContent);

    if (autoSave && dirty) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        if (saveHandlerRef.current) {
          saveHandlerRef.current();
        }
      }, autoSaveDelay);
    }
  }, [originalContent, onContentChange, autoSave, autoSaveDelay]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, []);

  // Memoize options to prevent recreation
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
    lineNumbers: "on" as const,
    wordWrap: "off" as const,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    cursorStyle: "line" as const,
    cursorBlinking: "smooth" as const,
    lineNumbersMinChars: 4,
    renderLineHighlight: "all" as const,
    selectionHighlight: true,
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: "never" as const,
      seedSearchStringFromSelection: "always" as const,
    },
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    overviewRulerLanes: 2,
    padding: { top: 8 },
  };

  if (loading) {
    return (
      <div className="tab-content-loading">
        <span>Loading...</span>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="tab-content-error">
        <span>{error}</span>
      </div>
    );
  }

  const language = getLanguageFromPath(path);
  const fileName = path.split("/").pop() || path;
  const isDirty = content !== originalContent;

  return (
    <div className="editor-tab-container">
      <div className="content-panel-header editor-panel-header">
        <div className="content-panel-meta">
          <span className="content-panel-icon"><FileIcon size={14} /></span>
          <div className="content-panel-copy">
            <span className="content-panel-title">{fileName}</span>
            <span className="content-panel-subtitle" title={path}>{path}</span>
          </div>
        </div>
        <div className="content-panel-badges">
          <span className="content-panel-badge">{language}</span>
          <span className={`content-panel-badge ${isDirty ? "is-dirty" : "is-saved"}`}>
            {isDirty ? "Unsaved" : "Saved"}
          </span>
        </div>
      </div>
      <div className="editor-surface">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme="opendevdock-dark"
          options={editorOptions}
        />
      </div>
    </div>
  );
}
