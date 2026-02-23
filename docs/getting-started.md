# Getting Started

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+ (or Docker)
- Redis 7+ (or Docker)

## Installation

```bash
git clone https://github.com/your-org/devpulse.git
cd devpulse
pnpm install
pnpm build
```

## Quick Start with Docker

```bash
docker-compose up
```

This starts PostgreSQL, Redis, the API server, and the dashboard. Demo data is seeded automatically.

- Dashboard: http://localhost:3000
- API: http://localhost:4000

## Manual Setup

### 1. Database

```bash
export DATABASE_URL=postgresql://devpulse:password@localhost:5432/devpulse
```

### 2. Redis

```bash
export REDIS_URL=redis://localhost:6379
```

### 3. Start Server

```bash
pnpm --filter @devpulse/server dev
```

### 4. Start Dashboard

```bash
pnpm --filter @devpulse/dashboard dev
```

## Configuration

Create a `devpulse.config.yaml` in the project root. See [devpulse.config.example.yaml](../devpulse.config.example.yaml) for all options.

Without a config file, DevPulse runs in demo mode with sample data.

## Next Steps

- [Connect your data sources](connector-guide.md)
- [Understand the KPIs](kpi-definitions.md)
- [Deploy to production](deployment.md)
