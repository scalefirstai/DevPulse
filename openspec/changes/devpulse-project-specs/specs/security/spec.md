## ADDED Requirements

### Requirement: API key authentication for collectors
The server SHALL require a valid API key for all data collection endpoints (`POST /api/collect/trigger`, `GET /api/collect/status`). API keys SHALL be passed via the `X-API-Key` request header. Invalid or missing API keys SHALL result in a 401 Unauthorized response. API keys SHALL be stored as hashed values (bcrypt or SHA-256) and compared using constant-time comparison to prevent timing attacks.

#### Scenario: Valid API key
- **WHEN** a request includes a valid API key in the `X-API-Key` header
- **THEN** the request is processed normally

#### Scenario: Missing API key
- **WHEN** a request to a protected endpoint omits the `X-API-Key` header
- **THEN** the server returns 401 Unauthorized with body `{"error": "API key required"}`

#### Scenario: Invalid API key
- **WHEN** a request includes an invalid API key
- **THEN** the server returns 401 Unauthorized with body `{"error": "Invalid API key"}`

### Requirement: Optional OAuth for dashboard access
The dashboard SHALL support optional OAuth authentication. When OAuth is configured, users SHALL authenticate before accessing the dashboard. When OAuth is not configured, the dashboard SHALL be accessible without authentication (suitable for internal network deployments). The OAuth implementation SHALL support generic OIDC providers.

#### Scenario: OAuth enabled
- **WHEN** OAuth is configured in `devpulse.config.yaml`
- **THEN** unauthenticated dashboard requests are redirected to the OAuth provider's login page

#### Scenario: OAuth disabled
- **WHEN** no OAuth configuration is present
- **THEN** the dashboard is accessible without authentication

#### Scenario: OAuth token expiry
- **WHEN** a user's OAuth token expires during an active session
- **THEN** the dashboard redirects to re-authenticate without losing the current page context

### Requirement: Rate limiting on API endpoints
The server SHALL enforce rate limiting on all API endpoints. Rate limits SHALL be configurable per endpoint category: read endpoints (default: 100 requests per minute per IP), write endpoints (default: 20 requests per minute per IP), and collection trigger (default: 5 requests per minute per API key). Rate-limited responses SHALL return 429 Too Many Requests with a `Retry-After` header indicating when the client can retry.

#### Scenario: Rate limit exceeded
- **WHEN** a client exceeds 100 GET requests per minute from a single IP
- **THEN** the server returns 429 Too Many Requests with a `Retry-After` header

#### Scenario: Rate limit headers
- **WHEN** a client makes an API request
- **THEN** the response includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers

### Requirement: Secret management via environment variables
The system SHALL read all sensitive configuration values (API tokens, database credentials, OAuth secrets) from environment variables, never from configuration files directly. The YAML configuration file SHALL reference secrets using the `${ENV_VAR_NAME}` syntax. The system SHALL validate that all required environment variables are present at startup and fail fast with a descriptive error if any are missing.

#### Scenario: Missing required secret
- **WHEN** the server starts and `DATABASE_URL` environment variable is not set
- **THEN** the server exits with error code 1 and logs "Missing required environment variable: DATABASE_URL"

#### Scenario: Config file secret reference
- **WHEN** the config file contains `token: ${GITHUB_TOKEN}` and GITHUB_TOKEN is set to "ghp_abc123"
- **THEN** the connector uses "ghp_abc123" as the token value

#### Scenario: No secrets in logs
- **WHEN** the server logs connector configuration or errors
- **THEN** secret values are redacted and never appear in plain text in log output

### Requirement: Input validation on API endpoints
The server SHALL validate all incoming request parameters. Path parameters SHALL be validated for format (UUIDs, slugs). Query parameters SHALL be validated for type and range (e.g., `range` must match pattern `\d+d`). Request bodies for PUT/POST endpoints SHALL be validated against JSON schemas. Invalid input SHALL return 400 Bad Request with a descriptive error message. The server SHALL sanitize all user-provided strings before database insertion to prevent SQL injection.

#### Scenario: Invalid path parameter
- **WHEN** a client sends `GET /api/kpis/invalid slug!`
- **THEN** the server returns 400 Bad Request with `{"error": "Invalid team slug format"}`

#### Scenario: Invalid range parameter
- **WHEN** a client sends `GET /api/trends/cycle_time?range=abc`
- **THEN** the server returns 400 Bad Request with `{"error": "Range must be in format: <number>d (e.g., 90d)"}`

#### Scenario: Valid JSON schema
- **WHEN** a client sends `PUT /api/config/thresholds` with a valid threshold object
- **THEN** the request is accepted and thresholds are updated

#### Scenario: Invalid request body
- **WHEN** a client sends `PUT /api/config/thresholds` with elite_max as a string
- **THEN** the server returns 400 Bad Request with `{"error": "elite_max must be a number"}`

### Requirement: CI security scanning with CodeQL
The system SHALL include a GitHub Actions workflow (`codeql.yml`) that runs CodeQL analysis on every pull request and on a weekly schedule for the main branch. The scan SHALL cover TypeScript/JavaScript code. CodeQL alerts with severity "high" or "critical" SHALL block PR merging.

#### Scenario: PR with security vulnerability
- **WHEN** a PR introduces code that CodeQL flags as a high-severity vulnerability
- **THEN** the CodeQL check fails and the PR cannot be merged until the issue is resolved

#### Scenario: Weekly scheduled scan
- **WHEN** the weekly CodeQL scan runs on the main branch
- **THEN** any new findings are reported as GitHub Security alerts

### Requirement: CORS configuration
The server SHALL configure CORS to allow requests only from the dashboard's origin in production. In development mode, CORS SHALL allow `http://localhost:3000` and `http://localhost:5173` (Vite dev server). The CORS configuration SHALL not allow wildcard origins (`*`) in production.

#### Scenario: Production CORS
- **WHEN** a request arrives from an origin not matching the configured dashboard URL
- **THEN** the server rejects the request with a CORS error

#### Scenario: Development CORS
- **WHEN** running in development mode and a request arrives from `http://localhost:5173`
- **THEN** the server allows the request with appropriate CORS headers

### Requirement: Secure HTTP headers
The server SHALL set security headers on all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0` (rely on CSP instead), `Strict-Transport-Security: max-age=31536000; includeSubDomains` (when HTTPS is enabled), and a Content Security Policy restricting script sources to self.

#### Scenario: Security headers present
- **WHEN** any API response is returned
- **THEN** the response includes X-Content-Type-Options, X-Frame-Options, and Content-Security-Policy headers

#### Scenario: HSTS in production
- **WHEN** the server is running with HTTPS enabled
- **THEN** the Strict-Transport-Security header is included with a 1-year max-age
