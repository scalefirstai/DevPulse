# Deployment

## Docker Compose (Development/Demo)

```bash
docker-compose up
```

Services: PostgreSQL 16, Redis 7, API server (port 4000), Dashboard (port 3000).

## Kubernetes / Helm

### Install

```bash
helm install devpulse ./deploy/helm/devpulse \
  --set ingress.enabled=true \
  --set ingress.host=devpulse.example.com
```

### With TLS

```bash
helm install devpulse ./deploy/helm/devpulse \
  --set ingress.enabled=true \
  --set ingress.host=devpulse.example.com \
  --set ingress.tls.enabled=true \
  --set ingress.tls.secretName=devpulse-tls
```

### Custom Values

```bash
helm install devpulse ./deploy/helm/devpulse -f my-values.yaml
```

Key configuration:
- `server.replicas` — API server instances (default: 2)
- `server.resources` — CPU/memory limits
- `postgresql.storage.size` — Database disk (default: 10Gi)
- `ingress.host` — Public hostname

### Secrets

Create a database secret before installing:

```bash
kubectl create secret generic devpulse-db-secret \
  --from-literal=password=<db-password> \
  --from-literal=url=postgresql://devpulse:<db-password>@devpulse-postgresql:5432/devpulse
```

## Bare Metal

### Prerequisites
- Node.js 20+, PostgreSQL 16+, Redis 7+

### Steps

```bash
pnpm install
pnpm build

# Set environment
export DATABASE_URL=postgresql://user:pass@localhost:5432/devpulse
export REDIS_URL=redis://localhost:6379
export NODE_ENV=production

# Run migrations and start
node packages/server/dist/index.js
```

Serve the dashboard build (`packages/dashboard/dist/`) with nginx or any static file server.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| REDIS_URL | Yes | — | Redis connection string |
| PORT | No | 4000 | Server port |
| NODE_ENV | No | development | Environment |
| API_KEY_HASH | No | — | SHA-256 hash of API key |
| DASHBOARD_URL | No | http://localhost:3000 | CORS origin |
| DEMO_MODE | No | — | Set to "true" to auto-seed demo data |
