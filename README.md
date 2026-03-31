# OpenDevDock

**Terminal-first Developer Workspace**

[![CI Status](https://img.shields.io/github/actions/workflow/status/monosystems/OpenDevDock/ci.yml?branch=main)](https://github.com/monosystems/OpenDevDock/actions)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-4B6BF4?logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

**OpenDevDock** ist ein terminal-first Developer Workspace für macOS und Linux. Dein Projekt immer im Blick, mit integriertem Terminal, Dateieditor und Session-Tracking – alles in einer Desktop-App.

[Website](https://github.com/monosystems/OpenDevDock) · [Docs](https://github.com/monosystems/OpenDevDock#development) · [Roadmap](docs/TODO.md)

## Features

- **Terminal-first**: Direkter Zugriff auf professionelle Terminal-Funktionen mit xterm.js und PTY-Unterstützung
- **Workspace-Management**: Projekte öffnen und verwalten mit integriertem Dateibaum
- **Multi-Tab Terminal**: Mehrere Terminal-Sessions in Tabs parallel nutzen
- **Dateieditor**: Dateien direkt im Workspace öffnen und bearbeiten mit Syntax-Highlighting
- **Session-Tracking**: Änderungen verfolgen und vergangene Sessions wiederherstellen

## Quick Start

```bash
# Dependencies installieren
pnpm install

# Tauri App entwickeln
pnpm run tauri dev

# Produktion bauen
pnpm run tauri build
```

## Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Desktop**: Tauri 2.0
- **Terminal**: @xterm/xterm + portable-pty
- **Editor**: Monaco Editor

## Projektstruktur

```
OpenDevDock/
├── src/                      # React Frontend
│   ├── components/           # UI Komponenten
│   ├── views/                # Seitenansichten
│   ├── state/                # State Management
│   ├── hooks/                # Custom Hooks
│   └── commands/             # Tauri Command Wrapper
│
├── src-tauri/                # Rust Backend
│   ├── src/lib.rs            # Hauptlogik und Commands
│   └── capabilities/         # Tauri 2.0 Permissions
│
└── docs/                     # Dokumentation
    └── TODO.md                # Feature Roadmap
```

## Development

### From Source

```bash
git clone https://github.com/monosystems/OpenDevDock.git
cd OpenDevDock

pnpm install
pnpm run tauri dev
```

### Frontend Only

```bash
pnpm run dev     # Vite dev server (hot reload)
pnpm run build  # TypeScript check + production build
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start Vite dev server |
| `pnpm run tauri dev` | Start Tauri development build |
| `pnpm run tauri build` | Build production Tauri app |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     OpenDevDock                          │
│                  (Desktop Application)                     │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│   File Tree      │         Main Workspace                 │
│   (280px)        │                                       │
│                  │   ┌─────────────────────────────────┐ │
│   - Ordner       │   │  Tab Bar (Terminal + Files)    │ │
│   - Dateien      │   ├─────────────────────────────────┤ │
│                  │   │                                 │ │
│                  │   │    Active Tab Content           │ │
│                  │   │    - Terminal (xterm.js)        │ │
│                  │   │    - Editor (Monaco)           │ │
│                  │   │                                 │ │
│                  │   └─────────────────────────────────┘ │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

## Roadmap

Das Projekt folgt einem Slice-basierten Entwicklungsplan:

- **Slice 1** — Workspace Grundgerüst ✓
- **Slice 2** — Terminal First Arbeitskern (in progress)
- **Slice 3** — Dateien direkt im selben Raum
- **Slice 4** — File Tree als Arbeitswerkzeug
- **Slice 5** — Session Änderungskern
- **Slice 6** — Session Historie

Siehe [docs/TODO.md](docs/TODO.md) für Details.

## License

MIT License - siehe [LICENSE](LICENSE)
