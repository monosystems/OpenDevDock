# Contributing to OpenDevDock

Danke für dein Interesse, zu OpenDevDock beizutragen!

## Development Setup

```bash
# Repository klonen
git clone https://github.com/monosystems/OpenDevDock.git
cd OpenDevDock

# Dependencies installieren
pnpm install

# App entwickeln
pnpm run tauri dev

# Production build
pnpm run tauri build
```

## Branch Strategy

- `main` – stable, release-ready
- Feature-Branches: `feat/<feature-name>`
- Bugfix-Branches: `fix/<bug-name>`

## Commit Messages

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new terminal tab feature
fix: resolve tab closing behavior
docs: update README
refactor: simplify state management
test: add terminal manager tests
```

## Code Style

- TypeScript mit strict mode
- Functional components mit Hooks
- Named exports für Komponenten
- Explizite Typen für alle Funktionen

## Pull Requests

1. Fork erstellen
2. Feature-Branch anlegen (`git checkout -b feat/my-feature`)
3. Änderungen committen
4. Pushen und PR erstellen

PRs werden reviewed und gemergt wenn sie den Standards entsprechen.

## Testing

80% Test-Coverage erforderlich. Neue Features brauchen Tests.

## Fragen?

GitHub Issues für Bugs und Feature-Requests.
