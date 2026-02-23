# Security

## Authentication

### API Key Authentication
The server API is protected by API key authentication via the `auth.ts` middleware:

- API keys are passed in the `X-API-Key` request header
- The server validates against a SHA-256 hash stored in the `API_KEY_HASH` environment variable
- Unauthenticated requests receive a `401 Unauthorized` response
- The health check endpoint (`GET /api/ping`) is exempt from authentication

```bash
# Generate an API key hash
echo -n "your-api-key" | sha256sum
# Store the hash in environment
export API_KEY_HASH="<sha256-hash>"
```

### Dashboard Authentication
The dashboard stores the API key in `localStorage` and injects it into requests via an Axios interceptor. For production deployments, consider:
- OAuth 2.0 / OIDC integration (planned for future release)
- Reverse proxy authentication (nginx `auth_request`)
- Network-level access control (VPN, private subnet)

## Data Protection

### Secrets Management
- **No secrets in code**: All credentials (database URLs, API tokens, connector keys) are passed via environment variables
- **Kubernetes secrets**: The Helm chart references `devpulse-db-secret` for database credentials
- **Docker Compose**: Uses environment variable interpolation (`${GITHUB_TOKEN}`)
- **Config file**: `devpulse.config.yaml` supports environment variable substitution (`${VAR}` syntax)

### Database Security
- PostgreSQL connections use SSL in production (`?sslmode=require` in connection string)
- Database credentials are stored in Kubernetes secrets, not ConfigMaps
- The demo mode uses isolated seed data that does not persist across restarts
- No PII is stored by default — contributor names can be anonymized via `anonymize_contributors: true`

### Network Security
- **CORS**: The server restricts cross-origin requests to the `DASHBOARD_URL` origin
- **Rate limiting**: API rate limiter middleware prevents abuse (configurable limits)
- **nginx security headers**: The dashboard nginx config sets:
  - `X-Frame-Options: DENY` — prevents clickjacking
  - `X-Content-Type-Options: nosniff` — prevents MIME type sniffing
  - `X-XSS-Protection: 1; mode=block` — enables browser XSS filtering
- **TLS**: Helm chart supports TLS termination at the ingress with configurable `tls.secretName`

## Connector Security

### Token Handling
Each connector authenticates to its respective API using tokens provided via environment variables:

| Connector | Auth Method | Header |
|-----------|------------|--------|
| GitHub | Bearer token | `Authorization: Bearer <token>` |
| Jira | Basic auth (email + API token) | `Authorization: Basic <base64>` |
| PagerDuty | Token auth | `Authorization: Token token=<token>` |
| OpsGenie | GenieKey | `Authorization: GenieKey <key>` |
| Jenkins | Basic auth (user + API token) | `Authorization: Basic <base64>` |

### Principle of Least Privilege
- GitHub tokens should be scoped to `repo:read` and `actions:read`
- Jira tokens need only read access to project issues
- PagerDuty tokens should be read-only API tokens
- Connectors never write to external systems — they only read data

### Request Safety
- All connector HTTP requests use `AbortSignal.timeout()` to prevent hanging connections
- Rate limiting is enforced per-connector to avoid overwhelming external APIs
- Retry logic uses exponential backoff with jitter to prevent thundering herd

## CI/CD Security

### GitHub Actions
- **CodeQL scanning**: Automated security analysis runs on every PR and weekly on `main`
- **Dependency scanning**: GitHub Dependabot alerts for vulnerable dependencies
- **Secrets**: GitHub Actions secrets for `GITHUB_TOKEN` (auto-provided) and container registry credentials
- **No `--no-verify`**: Pre-commit hooks are never bypassed in CI

### Container Security
- **Multi-stage builds**: Production images don't include build tools or dev dependencies
- **Non-root user**: Server Dockerfile runs as `node` user (UID 1000), not root
- **Alpine base**: Minimal attack surface with `node:20-alpine` and `nginx:alpine`
- **No unnecessary packages**: Production images only contain runtime dependencies

### Helm Security
- Database passwords are referenced from Kubernetes secrets, not Helm values
- Pod security contexts can be configured via values.yaml
- Ingress TLS is supported with configurable certificate secrets

## Threat Model

### Data Sensitivity
DevPulse processes engineering metadata (PR titles, incident descriptions, defect summaries). While not typically classified as PII, this data may contain:
- Employee names (PR authors, incident responders)
- Internal project names and component names
- Incident descriptions that may reference customer-impacting events

### Mitigation
- **Anonymization**: `anonymize_contributors: false` can be set to `true` to hide individual names
- **Access control**: API key authentication restricts data access
- **Network isolation**: Deploy on internal network or behind VPN for sensitive environments
- **Audit logging**: Server logs API requests with timestamp and endpoint (no request bodies)

### Attack Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| API key exposure | Medium | SHA-256 hashing, environment variables, secret management |
| SQL injection | Low | Parameterized queries via `node-pg` (no ORM, but safe query binding) |
| XSS | Low | React auto-escaping, CSP headers via nginx |
| CSRF | Low | API-key auth (not cookie-based), CORS restrictions |
| Connector token theft | Medium | Environment variables, Kubernetes secrets, least-privilege scoping |
| Denial of service | Medium | Rate limiting middleware, connection pooling, resource limits in Helm |

## Security Checklist for Deployment

- [ ] Set `API_KEY_HASH` environment variable with SHA-256 hash
- [ ] Use SSL/TLS for database connections (`?sslmode=require`)
- [ ] Enable TLS on ingress (set `ingress.tls.enabled=true` in Helm)
- [ ] Scope connector tokens to read-only access
- [ ] Set `DASHBOARD_URL` for CORS restriction
- [ ] Create Kubernetes secrets for database credentials
- [ ] Review and restrict network access to PostgreSQL and Redis
- [ ] Enable `anonymize_contributors` if running in sensitive environments
- [ ] Run CodeQL scans and address findings before production deployment
- [ ] Set appropriate resource limits in Kubernetes to prevent resource exhaustion
