# OpenDevDock

**Terminal-first Developer Workspace**

[![CI Status](https://img.shields.io/github/actions/workflow/status/monosystems/OpenDevDock/ci.yml?branch=main)](https://github.com/monosystems/OpenDevDock/actions)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-4B6BF4?logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

**OpenDevDock** is a terminal-first developer workspace for macOS and Linux. Keep your projects in view with an integrated terminal, file editor, and session tracking – all in one desktop app.

[Website](https://github.com/monosystems/OpenDevDock) · [Docs](https://github.com/monosystems/OpenDevDock#development) · [Roadmap](docs/TODO.md)

## Features

- **Terminal-first**: Direct access to professional terminal features with xterm.js and PTY support
- **Workspace Management**: Open and manage projects with an integrated file tree
- **Multi-Tab Terminal**: Multiple terminal sessions in parallel tabs
- **File Editor**: Open and edit files directly in the workspace with syntax highlighting
- **Session Tracking**: Track changes and restore previous sessions

## Quick Start

```bash
# Install dependencies
pnpm install

# Develop the app
pnpm run tauri dev

# Production build
pnpm run tauri build
```

## Tech Stack

- **Frontend**: React 18 + TypeScript (strict mode)
- **Desktop**: Tauri 2.0
- **Terminal**: @xterm/xterm + portable-pty
- **Editor**: Monaco Editor

## Project Structure

```
OpenDevDock/
├── src/                      # React Frontend
│   ├── components/           # UI Components
│   ├── views/                # Page Views
│   ├── state/                # State Management
│   ├── hooks/                # Custom Hooks
│   └── commands/             # Tauri Command Wrappers
│
├── src-tauri/                # Rust Backend
│   ├── src/lib.rs            # Main Logic and Commands
│   └── capabilities/         # Tauri 2.0 Permissions
│
└── docs/                     # Documentation
    └── TODO.md               # Feature Roadmap
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
pnpm run build   # TypeScript check + production build
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
│   - Folders      │   │  Tab Bar (Terminal + Files)    │ │
│   - Files        │   ├─────────────────────────────────┤ │
│                  │   │                                 │ │
│                  │   │    Active Tab Content           │ │
│                  │   │    - Terminal (xterm.js)       │ │
│                  │   │    - Editor (Monaco)          │ │
│                  │   │                                 │ │
│                  │   └─────────────────────────────────┘ │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

## Roadmap

The project follows a slice-based development plan:

- **Slice 1** — Workspace Foundation ✓
- **Slice 2** — Terminal First Workflow (in progress)
- **Slice 3** — Files in the Same Space
- **Slice 4** — File Tree as a Working Tool
- **Slice 5** — Session Change Tracking
- **Slice 6** — Session History

See [docs/TODO.md](docs/TODO.md) for details.

## License

MIT License - see [LICENSE](LICENSE)
