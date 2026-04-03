import { useState, useCallback, useRef, useEffect } from "react";
import { FileNode } from "../state/types";
import { useClipboard } from "../contexts/ClipboardContext";

interface FileTreeProps {
  nodes: FileNode[];
  onFileClick: (node: FileNode) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateDirectory: (parentPath: string, name: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  onMove: (sourcePath: string, destDir: string) => void;
  level?: number;
  rootPath?: string;
  onRootDragOverChange?: (isOver: boolean) => void;
  changedFilePaths?: Set<string>;
}

export function FileTree({ nodes, onFileClick, onCreateFile, onCreateDirectory, onRename, onDelete, onMove, level = 0, rootPath, onRootDragOverChange, changedFilePaths = new Set() }: FileTreeProps) {
  const { node: clipboardNode, action: clipboardAction, cut, copy, paste } = useClipboard();
  const clipboardInfo = clipboardNode && clipboardAction ? { node: clipboardNode, action: clipboardAction } : null;

  const handleCut = useCallback((node: FileNode) => {
    cut(node);
  }, [cut]);

  const handleCopy = useCallback((node: FileNode) => {
    copy(node);
  }, [copy]);

  const handlePaste = useCallback((destDir: FileNode) => {
    const result = paste(destDir);
    if (result) {
      onMove(result.sourcePath, result.destDir);
    }
  }, [paste, onMove]);

  return (
    <div>
      {clipboardInfo && (
        <div className="clipboard-indicator">
          {clipboardInfo.action === "cut" ? "Ausschneiden" : "Kopieren"}: {clipboardInfo.node.name}
        </div>
      )}
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          onFileClick={onFileClick}
          onCreateFile={onCreateFile}
          onCreateDirectory={onCreateDirectory}
          onRename={onRename}
          onDelete={onDelete}
          onMove={onMove}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          clipboardInfo={clipboardInfo}
          level={level}
          rootPath={rootPath}
          onRootDragOverChange={onRootDragOverChange}
          changedFilePaths={changedFilePaths}
        />
      ))}
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  onFileClick: (node: FileNode) => void;
  onCreateFile: (parentPath: string, name: string) => void;
  onCreateDirectory: (parentPath: string, name: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  onMove: (sourcePath: string, destDir: string) => void;
  onCut: (node: FileNode) => void;
  onCopy: (node: FileNode) => void;
  onPaste: (destDir: FileNode) => void;
  clipboardInfo: { node: FileNode; action: "cut" | "copy" } | null;
  level: number;
  rootPath?: string;
  onRootDragOverChange?: (isOver: boolean) => void;
  changedFilePaths?: Set<string>;
}

function FileTreeNode({
  node,
  onFileClick,
  onCreateFile,
  onCreateDirectory,
  onRename,
  onDelete,
  onMove,
  onCut,
  onCopy,
  onPaste,
  clipboardInfo,
  level,
  rootPath,
  onRootDragOverChange,
  changedFilePaths = new Set(),
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileError, setNewFileError] = useState<string | null>(null);
  const [showNewDirInput, setShowNewDirInput] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [newDirError, setNewDirError] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const newDirInputRef = useRef<HTMLInputElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // === POINTER DRAG STATE (Prototyp) ===
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [pointerDragOverPath, setPointerDragOverPath] = useState<string | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isPointerDragActiveRef = useRef(false);
  const currentPointerDragSourceRef = useRef<string | null>(null);
  const clickCancelledRef = useRef(false);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (showNewFileInput && newFileInputRef.current) {
      newFileInputRef.current.focus();
    }
  }, [showNewFileInput]);

  useEffect(() => {
    if (showNewDirInput && newDirInputRef.current) {
      newDirInputRef.current.focus();
    }
  }, [showNewDirInput]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  useEffect(() => {
    if (contextMenu) {
      menuItemsRef.current[0]?.focus();
    }
  }, [contextMenu]);

  const handleClick = useCallback(() => {
    if (clickCancelledRef.current) {
      clickCancelledRef.current = false;
      return;
    }
    if (isRenaming || showNewFileInput || showNewDirInput) return;
    if (node.is_dir) {
      setIsExpanded((prev) => !prev);
    } else {
      onFileClick(node);
    }
  }, [node, onFileClick, isRenaming, showNewFileInput, showNewDirInput]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setRenameValue(node.name);
      setIsRenaming(true);
    },
    [node.name]
  );

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) {
      onRename(node, trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, node, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleRenameSubmit();
      } else if (e.key === "Escape") {
        setIsRenaming(false);
        setRenameValue(node.name);
      }
    },
    [handleRenameSubmit, node.name]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      menuItemsRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      menuItemsRef.current[index - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setContextMenu(null);
    }
  }, []);

  const handleCreateFileClick = useCallback(() => {
    setContextMenu(null);
    setShowNewFileInput(true);
    setNewFileName("");
    setNewFileError(null);
  }, []);

  const handleCreateDirectoryClick = useCallback(() => {
    setContextMenu(null);
    setShowNewDirInput(true);
    setNewDirName("");
    setNewDirError(null);
  }, []);

  const handleCreateFileSubmit = useCallback(() => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setNewFileError("Name darf nicht leer sein");
      return;
    }
    setNewFileError(null);
    onCreateFile(node.path, trimmed);
    setShowNewFileInput(false);
    setNewFileName("");
  }, [newFileName, node.path, onCreateFile]);

  const handleCreateFileKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreateFileSubmit();
      } else if (e.key === "Escape") {
        setShowNewFileInput(false);
        setNewFileName("");
        setNewFileError(null);
      }
    },
    [handleCreateFileSubmit]
  );

  const handleCreateDirectorySubmit = useCallback(() => {
    const trimmed = newDirName.trim();
    if (!trimmed) {
      setNewDirError("Name darf nicht leer sein");
      return;
    }
    setNewDirError(null);
    onCreateDirectory(node.path, trimmed);
    setShowNewDirInput(false);
    setNewDirName("");
  }, [newDirName, node.path, onCreateDirectory]);

  const handleCreateDirectoryKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreateDirectorySubmit();
      } else if (e.key === "Escape") {
        setShowNewDirInput(false);
        setNewDirName("");
        setNewDirError(null);
      }
    },
    [handleCreateDirectorySubmit]
  );

  const handleRename = useCallback(() => {
    setContextMenu(null);
    setRenameValue(node.name);
    setIsRenaming(true);
  }, [node.name]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    setConfirmDelete(node);
  }, [node]);

  const handleCut = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    onCut(node);
  }, [node, onCut]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    onCopy(node);
  }, [node, onCopy]);

  const handlePaste = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenu(null);
    onPaste(node);
  }, [node, onPaste]);

  const [confirmDelete, setConfirmDelete] = useState<FileNode | null>(null);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      onDelete(confirmDelete);
    }
    setConfirmDelete(null);
  }, [confirmDelete, onDelete]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
  }, []);

  // === POINTER DRAG HELPER ===
  function findDropTargetPath(els: Element[], sourcePath: string, rootPath?: string): string | null {
    const candidates: { path: string; depth: number }[] = [];
    let hasTreeElements = false;
    let isOverFileTreeContent = false;

    for (const el of els) {
      if (el.classList?.contains('file-tree-content')) {
        isOverFileTreeContent = true;
      }
      if (!el.hasAttribute('data-node-path')) continue;

      hasTreeElements = true;
      const path = el.getAttribute('data-node-path')!;
      const isDir = el.getAttribute('data-is-dir') === 'true';

      console.log(`[POINTER-DRAG] DOM element: path=${path} isDir=${isDir} class=${el.className}`);

      if (path === sourcePath) {
        console.log(`[POINTER-DRAG] skip - is source itself`);
        continue;
      }

      if (path.startsWith(sourcePath + '/')) {
        console.log(`[POINTER-DRAG] skip ${path} - is inside source`);
        continue;
      }

      if (!isDir) {
        console.log(`[POINTER-DRAG] skip ${path} - not a directory`);
        continue;
      }

      const depth = path.split('/').filter(Boolean).length;
      candidates.push({ path, depth });
      console.log(`[POINTER-DRAG] candidate dir: ${path} (depth=${depth})`);
    }

    console.log(`[POINTER-DRAG] Summary: candidates=${candidates.length}, hasTreeElements=${hasTreeElements}, isOverFileTreeContent=${isOverFileTreeContent}, rootPath=${rootPath}`);

    if (candidates.length === 0) {
      console.log(`[POINTER-DRAG] no valid dir candidates at point`);
      if (rootPath && rootPath !== sourcePath && !rootPath.startsWith(sourcePath + '/')) {
        console.log(`[POINTER-DRAG] FALLBACK to ROOT: ${rootPath}`);
        return rootPath;
      }
      return null;
    }

    candidates.sort((a, b) => a.depth - b.depth);
    const best = candidates[0];
    console.log(`[POINTER-DRAG] BEST TARGET: ${best.path} (depth=${best.depth})`);

    return best.path;
  }

  // === POINTER DRAG HANDLERS (Prototyp) ===
  const POINTER_DRAG_THRESHOLD = 5;

  const handlePointerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (isRenaming || showNewFileInput || showNewDirInput) return;
      if (contextMenu) return;

      // Prevent text selection immediately
      e.preventDefault();

      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      isPointerDragActiveRef.current = false;
      currentPointerDragSourceRef.current = node.path;

      console.log(`[POINTER-DRAG] mousedown node=${node.name} path=${node.path}`);

      const handlePointerMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartPosRef.current) return;

        const dx = moveEvent.clientX - dragStartPosRef.current.x;
        const dy = moveEvent.clientY - dragStartPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!isPointerDragActiveRef.current && distance < POINTER_DRAG_THRESHOLD) {
          return;
        }

        if (!isPointerDragActiveRef.current) {
          isPointerDragActiveRef.current = true;
          setIsPointerDragging(true);
          document.body.classList.add("pointer-drag-active");
          console.log(`[POINTER-DRAG] STARTED source=${node.path}`);
        }

        const els = document.elementsFromPoint(moveEvent.clientX, moveEvent.clientY);
        const targetPath = findDropTargetPath(els, node.path, rootPath);

        setPointerDragOverPath(targetPath);
        onRootDragOverChange?.(targetPath === rootPath);
      };

      const handlePointerMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener("mousemove", handlePointerMouseMove);
        document.removeEventListener("mouseup", handlePointerMouseUp);
        document.body.classList.remove("pointer-drag-active");

        setIsPointerDragging(false);
        setPointerDragOverPath(null);
        onRootDragOverChange?.(false);

        const wasDragActive = isPointerDragActiveRef.current;
        const sourcePath = currentPointerDragSourceRef.current;

        dragStartPosRef.current = null;
        currentPointerDragSourceRef.current = null;
        isPointerDragActiveRef.current = false;

        if (!wasDragActive || !sourcePath) {
          // No drag happened - let normal click proceed
          return;
        }

        // Drag WAS started - cancel the click that would follow
        clickCancelledRef.current = true;

        const els = document.elementsFromPoint(upEvent.clientX, upEvent.clientY);
        const targetPath = findDropTargetPath(els, sourcePath, rootPath);

        if (!targetPath) {
          console.log(`[POINTER-DRAG] DROP ABORTED - no valid target`);
        } else {
          console.log(`[POINTER-DRAG] DROP EXECUTE onMove(${sourcePath}, ${targetPath})`);
          onMove(sourcePath, targetPath);
        }
      };

      document.addEventListener("mousemove", handlePointerMouseMove);
      document.addEventListener("mouseup", handlePointerMouseUp);
    },
    [node.path, node.name, node.is_dir, isRenaming, showNewFileInput, showNewDirInput, contextMenu, onMove]
  );

  return (
    <div>
      <div
        className={`file-node ${node.is_dir ? "file-node-dir" : "file-node-file"} ${isPointerDragging && currentPointerDragSourceRef.current === node.path ? 'dragging' : ''} ${pointerDragOverPath === node.path ? 'file-node-drag-over' : ''} ${changedFilePaths.has(node.path) ? 'changed' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handlePointerMouseDown}
        data-node-path={node.path}
        data-is-dir={node.is_dir}
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
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            className="file-node-rename-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : showNewFileInput ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
            <input
              ref={newFileInputRef}
              type="text"
              className="file-node-rename-input"
              placeholder="Dateiname..."
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
                if (newFileError) setNewFileError(null);
              }}
              onBlur={handleCreateFileSubmit}
              onKeyDown={handleCreateFileKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={newFileError ? { borderColor: "var(--error)" } : undefined}
            />
            {newFileError && (
              <span style={{ color: "var(--error)", fontSize: "11px" }}>
                {newFileError}
              </span>
            )}
          </div>
        ) : showNewDirInput ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 12px" }}>
            <input
              ref={newDirInputRef}
              type="text"
              className="file-node-rename-input"
              placeholder="Ordnername..."
              value={newDirName}
              onChange={(e) => {
                setNewDirName(e.target.value);
                if (newDirError) setNewDirError(null);
              }}
              onBlur={handleCreateDirectorySubmit}
              onKeyDown={handleCreateDirectoryKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={newDirError ? { borderColor: "var(--error)" } : undefined}
            />
            {newDirError && (
              <span style={{ color: "var(--error)", fontSize: "11px" }}>
                {newDirError}
              </span>
            )}
          </div>
        ) : (
          <span className="file-node-name">{node.name}</span>
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
        >
          {node.is_dir && (
            <>
              <button
                ref={(el) => { menuItemsRef.current[0] = el; }}
                className="context-menu-item"
                onClick={handleCreateFileClick}
                onKeyDown={(e) => handleMenuKeyDown(e, 0)}
                role="menuitem"
              >
                📄 Neue Datei
              </button>
              <button
                ref={(el) => { menuItemsRef.current[1] = el; }}
                className="context-menu-item"
                onClick={handleCreateDirectoryClick}
                onKeyDown={(e) => handleMenuKeyDown(e, 1)}
                role="menuitem"
              >
                📁 Neuer Ordner
              </button>
              <div className="context-menu-divider" role="separator" />
            </>
          )}
          {clipboardInfo && node.is_dir && (
            <button
              ref={(el) => { menuItemsRef.current[2] = el; }}
              className="context-menu-item"
              onClick={handlePaste}
              onKeyDown={(e) => handleMenuKeyDown(e, 2)}
              role="menuitem"
            >
              📋 Einfügen
            </button>
          )}
          <button
            ref={(el) => { menuItemsRef.current[clipboardInfo && node.is_dir ? 3 : 2] = el; }}
            className="context-menu-item"
            onClick={handleCut}
            onKeyDown={(e) => handleMenuKeyDown(e, clipboardInfo && node.is_dir ? 3 : 2)}
            role="menuitem"
          >
            ✂️ Ausschneiden
          </button>
          <button
            ref={(el) => { menuItemsRef.current[clipboardInfo && node.is_dir ? 4 : 3] = el; }}
            className="context-menu-item"
            onClick={handleCopy}
            onKeyDown={(e) => handleMenuKeyDown(e, clipboardInfo && node.is_dir ? 4 : 3)}
            role="menuitem"
          >
            📄 Kopieren
          </button>
          <div className="context-menu-divider" role="separator" />
          <button
            ref={(el) => { menuItemsRef.current[clipboardInfo && node.is_dir ? 5 : 4] = el; }}
            className="context-menu-item"
            onClick={handleRename}
            onKeyDown={(e) => handleMenuKeyDown(e, clipboardInfo && node.is_dir ? 5 : 4)}
            role="menuitem"
          >
            ✏️ Umbenennen
          </button>
          <button
            ref={(el) => { menuItemsRef.current[clipboardInfo && node.is_dir ? 6 : 5] = el; }}
            className="context-menu-item context-menu-item-danger"
            onClick={handleDelete}
            onKeyDown={(e) => handleMenuKeyDown(e, clipboardInfo && node.is_dir ? 6 : 5)}
            role="menuitem"
          >
            🗑️ Löschen
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-dialog-overlay" onClick={handleCancelDelete}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <p>
              Möchten Sie {confirmDelete.is_dir ? "den Ordner" : "die Datei"}{" "}
              <strong>"{confirmDelete.name}"</strong> wirklich löschen
              {confirmDelete.is_dir ? " und alle seine Inhalte" : ""}?
            </p>
            <div className="confirm-dialog-buttons">
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Abbrechen
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmDelete}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {node.is_dir && isExpanded && node.children && (
        <FileTree
          nodes={node.children}
          onFileClick={onFileClick}
          onCreateFile={onCreateFile}
          onCreateDirectory={onCreateDirectory}
          onRename={onRename}
          onDelete={onDelete}
          onMove={onMove}
          level={level + 1}
          changedFilePaths={changedFilePaths}
        />
      )}
    </div>
  );
}
