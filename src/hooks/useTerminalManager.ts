import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface TerminalInfo {
  id: string;
  terminalId: string;
  title: string;
  workingDirectory: string;
}

interface TerminalOutput {
  id: string;
  data: string;
}

export function useTerminalManager() {
  const [terminals, setTerminals] = useState<Map<string, TerminalInfo>>(new Map());
  const [outputs, setOutputs] = useState<Map<string, string>>(new Map());
  const [listeners, setListeners] = useState<UnlistenFn[]>([]);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<TerminalOutput>("terminal-output", (event) => {
        const { id, data } = event.payload;
        setOutputs((prev) => {
          const next = new Map(prev);
          const existing = next.get(id) || "";
          next.set(id, existing + data);
          return next;
        });
      });
      setListeners((prev) => [...prev, unlisten]);
    };

    setupListener();

    return () => {
      listeners.forEach((unlisten) => unlisten());
    };
  }, []);

  const createTerminal = useCallback(
    async (workingDirectory: string, title?: string) => {
      const terminalId = `terminal-${Date.now()}`;
      // Use terminalId as the key for Rust - we'll pass this consistently
      const id = terminalId;

      try {
        await invoke("create_terminal", {
          id: terminalId,
          workingDir: workingDirectory,
        });

        const info: TerminalInfo = {
          id: terminalId,
          terminalId,
          title: title || "Terminal",
          workingDirectory,
        };

        setTerminals((prev) => {
          const next = new Map(prev);
          next.set(id, info);
          return next;
        });

        setOutputs((prev) => {
          const next = new Map(prev);
          next.set(id, "");
          return next;
        });

        return { id: terminalId, terminalId };
      } catch (e: unknown) {
        console.error("Failed to create terminal:", e);
        throw e;
      }
    },
    []
  );

  const closeTerminal = useCallback(async (id: string) => {
    const info = terminals.get(id);
    if (!info) return;

    try {
      await invoke("close_terminal", { id: info.terminalId });
    } catch (e: unknown) {
      console.error("Failed to close terminal:", e);
    }

    setTerminals((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    setOutputs((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, [terminals]);

  const writeToTerminal = useCallback(async (id: string, data: string) => {
    const info = terminals.get(id);
    if (!info) return;

    try {
      await invoke("write_terminal", {
        id: info.terminalId,
        data,
      });
    } catch (e: unknown) {
      console.error("Failed to write to terminal:", e);
    }
  }, [terminals]);

  const resizeTerminal = useCallback(async (id: string, cols: number, rows: number) => {
    const info = terminals.get(id);
    if (!info) return;

    try {
      await invoke("resize_terminal", {
        id: info.terminalId,
        cols,
        rows,
      });
    } catch (e: unknown) {
      console.error("Failed to resize terminal:", e);
    }
  }, [terminals]);

  const renameTerminal = useCallback((id: string, title: string) => {
    setTerminals((prev) => {
      const next = new Map(prev);
      const info = next.get(id);
      if (info) {
        next.set(id, { ...info, title });
      }
      return next;
    });
  }, []);

  const getOutput = useCallback((id: string) => {
    return outputs.get(id) || "";
  }, [outputs]);

  const clearOutput = useCallback((id: string) => {
    setOutputs((prev) => {
      const next = new Map(prev);
      next.set(id, "");
      return next;
    });
  }, []);

  return {
    terminals,
    createTerminal,
    closeTerminal,
    writeToTerminal,
    resizeTerminal,
    renameTerminal,
    getOutput,
    clearOutput,
  };
}