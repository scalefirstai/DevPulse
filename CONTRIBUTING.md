# Contributing to DevPulse

First off, thank you for considering contributing to DevPulse! Every contribution helps make engineering metrics better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Writing a Connector](#writing-a-connector)
- [Running Tests](#running-tests)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

## How Can I Contribute?

### Report Bugs

Found a bug? [Open an issue](https://github.com/scalefirstai/DevPulse/issues/new?template=bug_report.md) with:

- A clear, descriptive title
- Steps to reproduce the behavior
- Expected vs. actual behavior
- Your environment (Node.js version, OS, browser if relevant)

### Suggest Features

Have an idea? [Open a feature request](https://github.com/scalefirstai/DevPulse/issues/new?template=feature_request.md). We especially welcome:

- New connector integrations (GitLab, Linear, Datadog, etc.)
- Dashboard visualizations and UX improvements
- KPI methodology refinements
- Documentation improvements

### Good First Issues

New to the project? Look for issues labeled [`good first issue`](https://github.com/scalefirstai/DevPulse/labels/good%20first%20issue). These are scoped, well-described tasks that are a great entry point.

### Fix Something

Browse [open issues](https://github.com/scalefirstai/DevPulse/issues) and pick one that interests you. Leave a comment to let others know you're working on it.

## Development Setup

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **Docker** (optional, for running PostgreSQL and Redis locally)

### Getting Started

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/DevPulse.git
cd DevPulse

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Running Locally

**With Docker (recommended):**

```bash
docker-compose up
# Dashboard: http://localhost:3000
# API: http://localhost:4000
```

**Without Docker:**

```bash
# Start the API server (requires PostgreSQL and Redis running separately)
pnpm --filter @devpulse/server dev

# Start the dashboard
pnpm --filter @devpulse/dashboard dev
```

## Project Structure

```
packages/
  core/            Pure TypeScript — KPI types, calculation engine, utilities
  connectors/      Data source integrations (GitHub, Jira, PagerDuty, etc.)
  server/          Express API, PostgreSQL, BullMQ job processing
  dashboard/       React + Recharts + TailwindCSS frontend
```

- **`core/`** has zero side effects — pure types and functions only
- **`connectors/`** extends `BaseConnector` which provides retry, rate limiting, and pagination
- **`server/`** is the API layer with background job processing
- **`dashboard/`** is a standalone React SPA

## Coding Standards

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **ESLint + Prettier** — run `pnpm lint` and `pnpm format` before committing
- **Single quotes**, semicolons, trailing commas
- **Print width**: 100 characters
- **Tests required** for all engine logic and connector implementations
- **No ORM** — we use direct SQL with `pg` for transparency and performance

### Verify before pushing

```bash
pnpm lint        # Linting
pnpm typecheck   # Type checking
pnpm test        # Unit tests
pnpm build       # Full build
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add GitLab connector for merge request tracking
fix: correct cycle time calculation for reopened PRs
docs: update connector guide with OpsGenie setup
refactor: extract common pagination logic to base connector
test: add unit tests for health score edge cases
chore: update TypeScript to 5.5
```

**Scope** is optional but encouraged:

```
feat(connectors): add Linear issue connector
fix(dashboard): resolve chart tooltip overlap on mobile
```

## Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make focused, minimal changes.** One PR per concern.

3. **Ensure all checks pass:**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

4. **Open a PR** with a clear description:
   - What changed and why
   - How to test it
   - Screenshots for UI changes
   - Link to related issues

5. **Respond to review feedback.** We aim to review PRs within a few days.

### PR Checklist

- [ ] Tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Commit messages follow conventional format
- [ ] Documentation updated (if applicable)

## Writing a Connector

DevPulse is designed to be extended with new data sources. See the [Connector Guide](docs/connector-guide.md) for full details. In brief:

1. Create a new directory under `packages/connectors/src/`
2. Extend `BaseConnector` — you get retry, rate limiting, and pagination for free
3. Implement the required interface methods
4. Add tests
5. Export from `packages/connectors/src/index.ts`

## Running Tests

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @devpulse/core test
pnpm --filter @devpulse/connectors test
pnpm --filter @devpulse/server test
pnpm --filter @devpulse/dashboard test

# Watch mode
pnpm --filter @devpulse/core test:watch
```

---

Thank you for helping make DevPulse better!
