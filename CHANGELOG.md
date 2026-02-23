# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-22

### Added

- Core KPI calculation engine with five outcome-oriented metrics
  - Cycle Time (first commit to production deploy)
  - Defect Escape Rate (post-deployment defect percentage)
  - Architecture Drift (unresolved violations ratio)
  - MTTRC (mean time to root cause)
  - Rework (churn percentage over 21-day window)
- Composite Health Score (0-100) with four tiers: Elite, Strong, Moderate, Alert
- Trend tracking and shift detection for all KPIs
- Data connectors with built-in retry, rate limiting, and pagination
  - GitHub (PRs, commits, file changes)
  - Jira (issues, defects, lifecycle)
  - PagerDuty (incidents, timelines)
  - OpsGenie (incidents, alerts)
  - GitHub Actions (builds, deployments)
  - Jenkins (build pipelines)
  - ArchUnit (architecture rules)
- Express REST API with PostgreSQL and Redis
- BullMQ background job processing for data collection
- React dashboard with Recharts and TailwindCSS
- Docker Compose setup for local development
- Kubernetes Helm charts for production deployment
- Comprehensive documentation (getting started, API reference, connector guide, architecture, deployment, security)
- CI/CD pipelines (CI, CodeQL, release)
- Contributing guidelines and issue templates

[Unreleased]: https://github.com/scalefirstai/DevPulse/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/scalefirstai/DevPulse/releases/tag/v0.1.0
