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
pnpm tauri dev

# Production build
pnpm tauri build
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
chore: maintenance tasks (dependency updates, config changes)
perf: performance improvements
ci: CI/CD changes
```

## Code Style

- TypeScript with strict mode
- Functional components with hooks
- Named exports for components
- Explicit types for all functions

## Code Formatting

We use ESLint and Prettier for consistent code style.

- Linting: `pnpm run lint`
- Format check: `pnpm run format:check`
- Auto-format: `pnpm run format`

## Pull Requests

1. Create a fork
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push and create a PR

PRs are reviewed and merged when they meet the standards.

## Code Review

- All PRs require CI to pass (TypeScript checks + build)
- At least one review approval required before merge
- Reviewers may request changes
- Only maintainers can merge

## Testing

During MVP phase, tests are encouraged but not required:

- **Unit tests**: Required for utility functions and state management
- **Integration tests**: Required for Tauri command handlers
- **UI tests**: Optional but recommended for user-facing features

Run tests locally: `pnpm test`

## Getting Help

- Found a bug? → [Open an Issue](https://github.com/monosystems/OpenDevDock/issues)
- Want to discuss a feature? → [GitHub Discussions](https://github.com/monosystems/OpenDevDock/discussions)
