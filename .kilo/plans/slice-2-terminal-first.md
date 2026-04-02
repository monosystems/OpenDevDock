# Slice 2 - Terminal First Arbeitskern

## Ziel
Die App wird als Terminal-Workspace real arbeitsfähig mit echtem PTY.

## Klärung mit Nutzer
- Shell: System-Standard-Shell (zsh macOS, bash Linux)
- Arbeitsverzeichnis: Projektverzeichnis
- Tab-Verhalten: Alle Tabs schließbar, immer neu öffenbar

## Technischer Ansatz

### Stack
- **Frontend**: xterm.js + @xterm/addon-fit (bereits vorhanden)
- **Backend**: `portable-pty` crate für plattformübergreifendes PTY
- **Kommunikation**: Tauri Events (Rust → JS) + invoke (JS → Rust)

### Rust Backend Änderungen

#### Dependencies (Cargo.toml)
```toml
portable-pty = "0.8"
```

#### lib.rs - PTY Manager
```rust
use portable_pty::{native PtyPair, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

pub struct PtyManager {
    terminals: Mutex<HashMap<String, PtyPair>>,
    writers: Mutex<HashMap<String, Box<dyn Write + Send>>>,
}

#[derive(Clone, serde::Serialize)]
struct TerminalOutput {
    id: String,
    data: String,
}

#[tauri::command]
fn create_terminal(
    id: String,
    working_dir: String,
    manager: State<PtyManager>,
    app: AppHandle,
) -> Result<(), String> {
    let mut cmd = CommandBuilder::new_default_prog();
    cmd.cwd(&working_dir);
    
    let pty_pair = portable_pty::fork().map_err(|e| e.to_string())?;
    let _child = pty_pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    
    let writer = pty_pair.master.take_writer().map_err(|e| e.to_string())?;
    let reader = pty_pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    
    manager.terminals.lock().unwrap().insert(id.clone(), pty_pair);
    manager.writers.lock().unwrap().insert(id.clone(), writer);
    
    // Spawn reader thread
    let id_clone = id.clone();
    let app_clone = app.clone();
    std::thread::spawn(move || {
        let mut reader = reader;
        let mut buf = [0u8; 1024];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_clone.emit("terminal-output", TerminalOutput {
                        id: id_clone.clone(),
                        data,
                    });
                }
                Err(_) => break,
            }
        }
    });
    
    Ok(())
}

#[tauri::command]
fn write_terminal(id: String, data: String, manager: State<PtyManager>) -> Result<(), String> {
    let mut writers = manager.writers.lock().unwrap();
    if let Some(writer) = writers.get_mut(&id) {
        writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn resize_terminal(id: String, cols: u16, rows: u16, manager: State<PtyManager>) -> Result<(), String> {
    let terminals = manager.terminals.lock().unwrap();
    if let Some(pty) = terminals.get(&id) {
        pty.master.resize(PtySize { rows, cols }).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn close_terminal(id: String, manager: State<PtyManager>) -> Result<(), String> {
    manager.terminals.lock().unwrap().remove(&id);
    manager.writers.lock().unwrap().remove(&id);
    Ok(())
}
```

### React Frontend Änderungen

#### state/types.ts - TerminalTab erweitern
```typescript
export interface TerminalTab extends Tab {
  type: "terminal";
  terminalId: string;
  workingDirectory: string;
}
```

#### TerminalManager Hook
- Zustand für alle aktiven Terminals
- createTerminal(projectPath) → terminalId
- closeTerminal(terminalId)
- writeToTerminal(terminalId, data)
- resizeTerminal(terminalId, cols, rows)

#### Terminal.tsx Komponente
- Accept terminalId prop
- Event-Listener für terminal-output
- Write auf input via invoke
- FitAddon für resize

#### WorkspaceView.tsx Änderungen
- TerminalTabs mit terminalId
- createTerminal beim Plus-Button
- Tab-Schließen → closeTerminal
- Tab-Auswahl → anderes Terminal anzeigen
- Rename UI (Double-Click oder Kontextmenü)

## Features umgesetzt

| Feature | Beschreibung |
|---------|--------------|
| Echte PTY-Shells | System-Shell mit voller Interaktivität |
| Projekt-Arbeitsverzeichnis | Jedes Terminal startet im Projektordner |
| Mehrere Tabs | Beliebig viele Terminal-Instanzen |
| Plus-Button | Neuen Terminal-Tab erstellen |
| Tab umbenennen | Manuell via Double-Click |
| Tab schließen | X-Button, letzter Tab schließt nicht (stattdessen neu erstellen) |
| Tab wechseln | Click auf Tab |
| Tab-Verhalten | Konsistent: immer schließbar, immer neu erstellbar |

## Dateiänderungen

1. `src-tauri/Cargo.toml` - portable-pty hinzufügen
2. `src-tauri/src/lib.rs` - PtyManager + Commands
3. `src/state/types.ts` - TerminalTab Interface erweitern
4. `src/hooks/useTerminalManager.ts` - neuer Hook
5. `src/components/Terminal.tsx` - mit PTY-Anbindung
6. `src/views/WorkspaceView.tsx` - Terminal-Tab-Management

## Erfolgskriterium
- Echte interaktive Shell funktioniert (vim, htop, etc.)
- Mehrere Terminals parallel nutzbar
- Tab-Wechsel funktioniert ohne Datenverlust
- Arbeitsverzeichnis korrekt
