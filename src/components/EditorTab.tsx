import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { editor } from "monaco-editor";

interface EditorTabProps {
  path: string;
  onSave?: () => void;
  onContentChange?: (isDirty: boolean) => void;
  onMount?: (saveHandler: () => void) => void;
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

export function EditorTab({ path, onSave, onContentChange, onMount }: EditorTabProps) {
  // State hooks - always called in same order
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const contentRef = useRef<string>("");
  const isDirtyRef = useRef(false);
  const saveHandlerRef = useRef<(() => void) | null>(null);
  const pathRef = useRef(path);
  
  // Keep path ref updated
  pathRef.current = path;

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
      } catch (e) {
        if (cancelled) return;
        console.error("Failed to read file:", e);
        setError(`Failed to load file: ${e}`);
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
      })
      .catch((e) => {
        console.error("Failed to save file:", e);
        setError(`Failed to save file: ${e}`);
      });
  }, [onSave]);

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
    onContentChange?.(dirty);
  }, [originalContent, onContentChange]);

  // Memoize options to prevent recreation
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "Menlo, Monaco, 'Courier New', monospace",
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

  return (
    <div className="editor-tab-container">
      <Editor
        height="100%"
        language={language}
        value={content}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={editorOptions}
      />
    </div>
  );
}