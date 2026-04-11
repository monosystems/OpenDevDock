import { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import "@xterm/xterm/css/xterm.css";
import { TerminalIcon } from "./ui/Icons";

interface TerminalInstance {
  term: XTerm | null;
  fitAddon: FitAddon | null;
  unlisten: (() => void) | null;
  containerId: string | null;
}

interface TerminalProps {
  terminalId: string;
  onResize: (cols: number, rows: number) => void;
}

const terminalRegistry: Map<string, TerminalInstance> = new Map();
const openedTerminals: Set<string> = new Set();

export function Terminal({ terminalId, onResize }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpenedRef = useRef(false);
  
  const handleResize = useCallback(() => {
    const instance = terminalRegistry.get(terminalId);
    if (instance?.fitAddon && instance?.term) {
      instance.fitAddon.fit();
      const cols = instance.term.cols;
      const rows = instance.term.rows;
      onResize(cols, rows);
    }
  }, [terminalId, onResize]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!terminalRegistry.has(terminalId)) {
      terminalRegistry.set(terminalId, {
        term: null,
        fitAddon: null,
        unlisten: null,
        containerId: null,
      });
    }
    
    const instance = terminalRegistry.get(terminalId)!;
    
    if (isOpenedRef.current && openedTerminals.has(terminalId)) {
      return;
    }
    
    if (!instance.term) {
      const fontSize = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--terminal-font-size") || "14",
        10
      );
      const term = new XTerm({
        cursorBlink: true,
        fontSize: isNaN(fontSize) ? 14 : fontSize,
        fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
        theme: {
          background: "#0b0f15",
          foreground: "#e5edf8",
          cursor: "#93c5fd",
          cursorAccent: "#0b0f15",
          selectionBackground: "rgba(147, 197, 253, 0.16)",
          black: "#0b0f15",
          red: "#f87171",
          green: "#86efac",
          yellow: "#fcd34d",
          blue: "#93c5fd",
          magenta: "#c4b5fd",
          cyan: "#7dd3fc",
          white: "#e5edf8",
          brightBlack: "#7f8ba1",
          brightRed: "#fca5a5",
          brightGreen: "#bbf7d0",
          brightYellow: "#fde68a",
          brightBlue: "#bfdbfe",
          brightMagenta: "#ddd6fe",
          brightCyan: "#bae6fd",
          brightWhite: "#ffffff",
        },
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      
      instance.term = term;
      instance.fitAddon = fitAddon;
      
      listen<{ id: string; data: string }>(
        "terminal-output",
        (event) => {
          if (event.payload.id === terminalId && instance.term) {
            instance.term.write(event.payload.data);
          }
        }
      ).then((unlisten) => {
        instance.unlisten = unlisten;
      });
      
      term.onData((data) => {
        invoke("write_terminal", { id: terminalId, data }).catch((e) => console.error("[Terminal] write_terminal error:", e));
      });
    }
    
    instance.term!.open(containerRef.current);
    instance.fitAddon!.fit();
    instance.containerId = terminalId;
    openedTerminals.add(terminalId);
    isOpenedRef.current = true;
    
    const cols = instance.term!.cols;
    const rows = instance.term!.rows;
    onResize(cols, rows);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (instance.unlisten) {
        instance.unlisten();
      }
      terminalRegistry.delete(terminalId);
      openedTerminals.delete(terminalId);
    };
  }, [terminalId, onResize, handleResize]);

  return (
    <div className="terminal-container">
      <div className="content-panel-header terminal-panel-header">
        <div className="content-panel-meta">
          <span className="content-panel-icon"><TerminalIcon size={14} /></span>
          <div className="content-panel-copy">
            <span className="content-panel-title">Terminal</span>
            <span className="content-panel-subtitle">Interactive shell session</span>
          </div>
        </div>
      </div>
      <div className="terminal-surface">
        <div ref={containerRef} className="terminal-wrapper" />
      </div>
    </div>
  );
}
