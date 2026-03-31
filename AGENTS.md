# AGENTS.md - OpenDevDock Development Guide

## Project Overview

OpenDevDock is a terminal-first developer workspace built with **Tauri 2.0 + React**. The app uses a slice-based roadmap defined in `docs/TODO.md`.

**Tech Stack:**
- Frontend: React 18 + TypeScript (strict mode)
- Backend: Tauri 2.0 (Rust)
- Terminal: xterm.js (`@xterm/xterm`) + portable-pty
- Styling: Plain CSS (no framework)

---

## Build Commands

```bash
# Install dependencies (use pnpm, NOT npm)
pnpm install

# Frontend only
pnpm run dev          # Start Vite dev server (hot reload)
pnpm run build        # TypeScript check + Vite production build
pnpm run preview      # Preview production build

# Tauri (full app)
pnpm run tauri dev    # Start Tauri development build
pnpm run tauri build  # Build production Tauri app

# Run a single test (if tests are added)
pnpm vitest run src/components/Terminal.test.ts
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** (`"strict": true` in tsconfig.json)
- Use **explicit types** for function parameters and return values
- Use **interfaces** for object shapes, **type aliases** for unions/primitives
- No `any` — use `unknown` and narrow appropriately

### React Components

- **Functional components** with hooks only (no class components)
- **Named exports** for components: `export function ComponentName()`
- Props interfaces defined above the component
- Event handlers use `useCallback` when passed as props or in dependencies

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `FileTree.tsx` |
| Hooks | camelCase with `use` prefix | `useTerminalManager` |
| Functions/variables | camelCase | `handleResize` |
| Types/interfaces | PascalCase | `TerminalTab` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TAB_COUNT` |
| Rust functions | snake_case | `read_directory` |
| Rust structs | PascalCase | `PtyManager` |

### File Structure

```
src/
├── components/     # Reusable UI components
├── views/          # Page-level components (StartView, WorkspaceView)
├── state/          # State types and context
├── hooks/          # Custom React hooks
├── commands/       # Tauri invoke wrappers
└── App.tsx         # Root component

src-tauri/
├── src/lib.rs      # Main Rust logic + commands
├── capabilities/   # Tauri 2.0 permission files
└── tauri.conf.json # App configuration
```

### Imports

**Frontend (React/TypeScript):**
```typescript
// External packages
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "@xterm/xterm/css/xterm.css";  // xterm.js CSS is required!

// Local files (relative)
import { Terminal } from "../components/Terminal";
import type { Tab } from "../state/types";
```

**Order:** External → Internal → Types (grouped, blank line between)

### Tauri Event Handling

**CRITICAL:** Event listeners receive `event.payload` (NOT `event.data`):
```typescript
listen<{ id: string; data: string }>("terminal-output", (event) => {
  const { id, data } = event.payload;  // Correct!
});
```

### Tauri Commands (Rust → TypeScript)

Commands are invoked with `invoke()` and return Promises:
```typescript
// TypeScript call
const result = await invoke<ReturnType>("command_name", { param1, param2 });

// Rust definition
#[tauri::command]
fn command_name(param1: String, param2: u32) -> Result<ReturnType, String> {
    // Return Err(String) on error
}
```

### Error Handling

- **Tauri commands:** Return `Result<T, String>` — use `?` operator, convert errors to strings
- **Frontend:** Use `try/catch` with `console.error` for logging
- **No silent failures:** Always log or handle errors explicitly

```typescript
try {
  await invoke("some_command", { id: 123 });
} catch (e) {
  console.error("Failed to execute command:", e);
}
```

### Rust Conventions

- Use `serde` derive macros for serialization (`Serialize`, `Deserialize`)
- Use `log::info!` / `log::error!` for logging (already initialized in `run()`)
- Thread safety: Use `Mutex` for shared state, lock before access
- PTY lifecycle: Store `PtyPair` first, then extract reader/writer

---

## Tauri 2.0 Plugin Setup

When adding new Tauri plugins:

1. Add to `src-tauri/Cargo.toml` dependencies
2. Initialize plugin in `lib.rs`: `.plugin(plugin_name::init())`
3. **Add capability** in `src-tauri/capabilities/default.json`

```json
{
  "permissions": [
    "plugin:plugin-name:allow-some-action"
  ]
}
```



## Preferences

- User communicates in **German** (concise responses)
- **Explain commands before running**, ask before architectural changes
- **Commit with Conventional Commits** format
- **80% test coverage** required
- Use **pnpm** (not npm) for package management
