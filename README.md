# OpenDevDock

Terminal-first Developer Workspace für macOS und Linux.

## Features

- **Terminal-first**: Direkter Zugriff auf professionelle Terminal-Funktionen mit xterm.js und PTY-Unterstützung
- **Workspace-Management**: Projekte öffnen und verwalten mit integriertem Dateibaum
- **Multi-Tab Terminal**: Mehrere Terminal-Sessions in Tabs parallel nutzen
- **Dateieditor**: Dateien direkt im Workspace öffnen und bearbeiten mit Syntax-Highlighting
- **Session-Tracking**: Änderungen verfolgen und vergangene Sessions wiederherstellen

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Tauri 2.0
- **Terminal**: @xterm/xterm + portable-pty
- **Editor**: Monaco Editor

## Development

```bash
# Dependencies installieren
pnpm install

# Frontend Dev Server starten
pnpm run dev

# Tauri App entwickeln
pnpm run tauri dev

# Produktion bauen
pnpm run tauri build
```

## Projektstruktur

```
src/                    # React Frontend
  ├── components/       # UI Komponenten
  ├── views/            # Seitenansichten
  ├── state/            # State Management
  ├── hooks/            # Custom Hooks
  └── commands/         # Tauri Command Wrapper

src-tauri/              # Rust Backend
  ├── src/lib.rs        # Hauptlogik und Commands
  └── capabilities/     # Tauri 2.0 Permissions
```

## Lizenz

MIT License - siehe [LICENSE](LICENSE)
