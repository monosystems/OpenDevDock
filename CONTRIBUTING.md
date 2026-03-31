# Contributing to OpenDevDock

Thank you for your interest in contributing to OpenDevDock!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/monosystems/OpenDevDock.git
cd OpenDevDock

# Install dependencies
pnpm install

# Develop the app
pnpm run tauri dev

# Production build
pnpm run tauri build
```

## Branch Strategy

- `main` – stable, release-ready
- Feature branches: `feat/<feature-name>`
- Bugfix branches: `fix/<bug-name>`

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new terminal tab feature
fix: resolve tab closing behavior
docs: update README
refactor: simplify state management
test: add terminal manager tests
```

## Code Style

- TypeScript with strict mode
- Functional components with hooks
- Named exports for components
- Explicit types for all functions

## Pull Requests

1. Create a fork
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and create a PR

PRs are reviewed and merged when they meet the standards.

## Testing

80% test coverage required. New features need tests.

## Questions?

Use GitHub Issues for bugs and feature requests.
