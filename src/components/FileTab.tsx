import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { FileIcon } from "./ui/Icons";

interface FileTabProps {
  path: string;
}

export function FileTab({ path }: FileTabProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      setError(null);
      try {
        const text = await readTextFile(path);
        setContent(text);
      } catch (e: unknown) {
        console.error("Failed to read file:", e);
        setError(e instanceof Error ? `Failed to load file: ${e.message}` : "Failed to load file");
        setContent("");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [path]);

  if (loading) {
    return (
      <div className="tab-content-loading">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tab-content-error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="file-tab-content">
      <div className="content-panel-header file-preview-header">
        <div className="content-panel-meta">
          <span className="content-panel-icon"><FileIcon size={14} /></span>
          <div className="content-panel-copy">
            <span className="content-panel-title">{path.split("/").pop() || path}</span>
            <span className="content-panel-subtitle" title={path}>{path}</span>
          </div>
        </div>
      </div>
      <div className="file-preview-surface">
        <pre className="file-preview-content">{content}</pre>
      </div>
    </div>
  );
}
