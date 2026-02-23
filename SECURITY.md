# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in DevPulse, please report it responsibly.

**Please do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

1. **GitHub Private Vulnerability Reporting (preferred):** Use [GitHub's private vulnerability reporting](https://github.com/scalefirstai/DevPulse/security/advisories/new) to submit a report directly through the repository.

2. **Email:** If private vulnerability reporting is unavailable, contact the maintainers through the email listed in the repository profile.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact
- Suggested fix (if any)

### What to Expect

- **Acknowledgment:** Within 48 hours of your report
- **Initial assessment:** Within 5 business days
- **Resolution timeline:** We aim to release a fix within 30 days for critical issues

### Scope

The following are in scope for security reports:

- Authentication and authorization bypasses
- SQL injection or other injection vulnerabilities
- Cross-site scripting (XSS)
- Sensitive data exposure
- Server-side request forgery (SSRF)
- Dependency vulnerabilities with a known exploit

### Out of Scope

- Issues in third-party dependencies without a proof of concept against DevPulse
- Social engineering attacks
- Denial of service attacks
- Issues requiring physical access

### Security Best Practices

For guidance on DevPulse's security architecture, headers, rate limiting, and deployment hardening, see [docs/security.md](docs/security.md).

## Recognition

We appreciate responsible disclosure and will acknowledge security researchers in our release notes (unless you prefer to remain anonymous).
