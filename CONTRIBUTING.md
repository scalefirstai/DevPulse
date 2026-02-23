# Contributing to DevPulse

## Development Setup

```bash
git clone https://github.com/your-org/devpulse.git
cd devpulse
pnpm install
pnpm build
pnpm test
```

## Coding Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- Single quotes, semicolons, trailing commas
- Tests required for engine logic and connectors

## PR Process

1. Create a feature branch from `main`
2. Make focused, minimal changes
3. Ensure all tests pass: `pnpm test`
4. Ensure type-check passes: `pnpm typecheck`
5. Ensure lint passes: `pnpm lint`
6. Open a PR with a clear description

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Project Structure

- `packages/core/` — Pure types and logic (no side effects)
- `packages/connectors/` — Data source integrations
- `packages/server/` — API and job processing
- `packages/dashboard/` — React UI
