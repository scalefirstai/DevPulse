# RFC 003 — Architecture Drift

**Status:** Draft
**KPI:** Architecture Drift
**Last updated:** 2026-02-22

## Summary

Architecture Drift measures the gap between intended and actual architecture based on defined rules. It treats architecture as a first-class health indicator — not an afterthought — by quantifying how much the codebase has diverged from its intended design.

## Current Definition

**Formula:** `(active_violations / total_rules) × 100`

Measures the gap between intended and actual architecture based on defined rules.

**Default Thresholds:**

| Tier | `kpi-definitions.md` | `quality_score.md` | `README.md` |
|------|----------------------|---------------------|-------------|
| Elite | ≤ 2% | ≤ 2% | < 2% |
| Strong | ≤ 5% | ≤ 5% | — |
| Moderate | ≤ 10% | ≤ 15% | — |
| Alert | > 10% | > 15% | > 15% |

**Tool Integration:** ArchUnit, jDepend, and CI fitness functions (per `docs/product_sense.md`).

## Rationale

Most engineering metrics tools ignore architecture entirely. DevPulse treats it as a core health indicator because architectural erosion is one of the most expensive forms of technical debt — it compounds over time and eventually constrains what you can build.

The formula is intentionally simple: violations divided by rules. This makes the metric tool-agnostic — any system that can express architectural constraints as pass/fail rules can feed this KPI. The percentage framing makes it comparable across codebases of different sizes and rule counts.

## Open Questions

### 1. How should drift be measured in monorepos vs microservices?

The current formula treats all rules equally regardless of scope. But in a monorepo, a single cross-boundary violation might affect dozens of packages, while in a microservice architecture, a dependency violation is scoped to one service. Should the formula account for blast radius?

- **Per-rule percentage (current)** — simple, comparable, but treats all violations equally
- **Weighted by affected scope** — more accurate, but harder to compute and explain
- **Per-boundary measurement** — measure drift at each architectural boundary separately, then aggregate

### 2. What tools should be supported beyond ArchUnit?

The current docs mention ArchUnit, jDepend, and CI fitness functions. But the JavaScript/TypeScript ecosystem has its own tools:

- **dependency-cruiser** — dependency validation for Node.js projects
- **madge** — circular dependency detection
- **eslint-plugin-boundaries** — boundary enforcement via ESLint
- **Nx/Turborepo constraints** — monorepo-native boundary enforcement

Should DevPulse have first-class integrations for these, or is the connector SDK sufficient?

### 3. Per-boundary vs global measurement

A project with 100 rules and 5 violations scores 5% globally. But if all 5 violations are in the same boundary (e.g., the data layer accessing the UI layer), that's a concentrated problem. If they're spread across 5 different boundaries, that's a systemic problem. Should the metric distinguish between these?

### 4. How should intentional, in-progress migrations affect the score?

When a team is actively migrating from architecture A to architecture B, violations are expected and temporary. The current metric penalizes this migration equally with genuine drift. Options:

- **Suppress rules during migration** — requires manual tracking of which rules are "in migration"
- **Time-boxed exceptions** — violations can be marked as expected with an expiration date
- **Separate migration metric** — track migration progress separately from drift
- **Accept the temporary score hit** — the metric reflects reality; migrations do introduce instability

## How to Weigh In

- **Edit this RFC** — open a PR against `rfcs/003-architecture-drift.md` with your proposed changes
- **Discuss** — start a thread in [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) tagged `methodology`
- **Share data** — if your team tracks architecture drift and has opinions on measurement approaches, we want to hear about it
