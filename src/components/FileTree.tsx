import { useState, useCallback } from "react";
import { FileNode } from "../state/types";

interface FileTreeProps {
  nodes: FileNode[];
  onFileClick: (node: FileNode) => void;
  level?: number;
}

export function FileTree({ nodes, onFileClick, level = 0 }: FileTreeProps) {
  return (
    <div>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          onFileClick={onFileClick}
          level={level}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  onFileClick: (node: FileNode) => void;
  level: number;
}

function FileTreeNode({ node, onFileClick, level }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = useCallback(() => {
    if (node.is_dir) {
      setIsExpanded((prev) => !prev);
    } else {
      onFileClick(node);
    }
  }, [node, onFileClick]);

  return (
    <div>
      <div
        className={`file-node ${node.is_dir ? "file-node-dir" : "file-node-file"}`}
        onClick={handleClick}
        style={{ paddingLeft: level * 16 + 12 }}
      >
        {node.is_dir && (
          <span className="file-node-indent">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!node.is_dir && <span className="file-node-indent" />}
        <span className="file-node-icon">
          {node.is_dir ? "📁" : "📄"}
        </span>
        <span className="file-node-name">{node.name}</span>
      </div>
      {node.is_dir && isExpanded && node.children && (
        <FileTree nodes={node.children} onFileClick={onFileClick} level={level + 1} />
      )}
    </div>
  );
}
