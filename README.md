# OpenDevDock

**Terminal-first Developer Workspace**

[![CI Status](https://img.shields.io/github/actions/workflow/status/monosystems/OpenDevDock/ci.yml?branch=main&style=flat-square)](https://github.com/monosystems/OpenDevDock/actions)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-4B6BF4?logo=tauri&style=flat-square)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![Stars](https://img.shields.io/github/stars/monosystems/OpenDevDock?style=flat-square)](https://github.com/monosystems/OpenDevDock/stargazers)
[![Version](https://img.shields.io/github/v/release/monosystems/OpenDevDock?include_prereleases&style=flat-square)](https://github.com/monosystems/OpenDevDock/releases)

Stop switching between Terminal, Editor and File Manager. OpenDevDock brings everything into one persistent workspace.

## Why OpenDevDock?

**No context switches.** iTerm + VS Code means jumping between windows. OpenDevDock keeps terminal, file tree, and editor in one window.

**Persistent sessions.** Your terminal sessions survive app restarts. Open a project tomorrow exactly as you left it today.

**All-in-one workspace.** One app, one window, less friction. Built on Tauri 2.0 for native performance on macOS and Linux.

## Features

- **Terminal-first**: Direct access to professional terminal features with xterm.js and PTY support
- **Workspace Management**: Open and manage projects with an integrated file tree
- **Multi-Tab Terminal**: Multiple terminal sessions in parallel tabs
- **File Editor**: Open and edit files directly in the workspace with syntax highlighting
- **Session Tracking**: Track changes and restore previous sessions

## How does it compare?

| Feature | OpenDevDock | iTerm + VS Code |
|---------|:-----------:|:--------------:|
| Terminal | ✓ | ✓ |
| File Tree | ✓ | ✗ |
| Session Restore | ✓ | ✗ |
| File Editor | ✓ | ✓ (Extension) |

## Quick Start

```bash
git clone https://github.com/monosystems/OpenDevDock.git
cd OpenDevDock
pnpm install
pnpm start
```

## Install

### macOS

```bash
brew install --cask opendevdock
```

### Linux

```bash
flatpak install flathub com.opendevdock.OpenDevDock
```

## Requirements

Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

- **OS**: macOS 12+ / Ubuntu 20.04+ / Debian 11+
- **Runtime**: Rust 1.70+
- **Package Manager**: pnpm 8+

## Tech Stack

- **Frontend**: React 19 + TypeScript (strict mode)
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
└── src-tauri/                # Rust Backend
    ├── src/lib.rs            # Main Logic and Commands
    └── capabilities/         # Tauri 2.0 Permissions
```

## Architecture

![Architecture Diagram](docs/screenshots/architecture.png)

## Development

### Frontend Only

```bash
pnpm run dev     # Vite dev server (hot reload)
pnpm run build   # TypeScript check + production build
pnpm preview     # Preview production build
```

### Full App

```bash
pnpm start       # Start Tauri development build
pnpm tauri build # Build production Tauri app
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start Vite dev server |
| `pnpm start` | Start Tauri development build |
| `pnpm tauri build` | Build production Tauri app |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Community

- [GitHub Discussions](https://github.com/monosystems/OpenDevDock/discussions)
- [Bug Reports](https://github.com/monosystems/OpenDevDock/issues)

## License

MIT License - see [LICENSE](LICENSE)
