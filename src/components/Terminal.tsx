import { useEffect, useRef, useCallback } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import "@xterm/xterm/css/xterm.css";

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
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "Menlo, Monaco, 'Courier New', monospace",
        theme: {
          background: "#1e1e1e",
          foreground: "#cccccc",
          cursor: "#cccccc",
          cursorAccent: "#1e1e1e",
          selectionBackground: "#264f78",
          black: "#000000",
          red: "#f14c4c",
          green: "#89d185",
          yellow: "#e5c07b",
          blue: "#0e639c",
          magenta: "#c586c0",
          cyan: "#89d185",
          white: "#cccccc",
          brightBlack: "#858585",
          brightRed: "#f14c4c",
          brightGreen: "#89d185",
          brightYellow: "#e5c07b",
          brightBlue: "#1177bb",
          brightMagenta: "#c586c0",
          brightCyan: "#89d185",
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
        console.log("[Terminal] onData:", JSON.stringify({ id: terminalId, data }));
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
    };
  }, [terminalId, onResize, handleResize]);

  return (
    <div className="terminal-container">
      <div ref={containerRef} className="terminal-wrapper" />
    </div>
  );
}