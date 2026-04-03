import { useEffect, useState } from "react";
import { readTextFile } from "@tauri-apps/plugin-fs";

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
      <pre style={{ padding: "16px", margin: 0, overflow: "auto" }}>
        {content}
      </pre>
    </div>
  );
}
