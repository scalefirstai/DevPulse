# Connector Guide

## Overview

Connectors are data source integrations that collect, transform, and validate data from external systems. All connectors extend `BaseConnector`.

## Built-in Connectors

| Connector | Source | Data |
|-----------|--------|------|
| GitHub | GitHub API | PRs, commits, deployments |
| Jira | Jira API | Issues, defects |
| PagerDuty | PagerDuty API | Incidents |
| OpsGenie | OpsGenie API | Alerts/Incidents |
| GitHub Actions | GitHub API | CI/CD workflow runs |
| Jenkins | Jenkins API | Build records |
| ArchUnit | Report files | Architecture violations |

## Writing a Custom Connector

```typescript
import { BaseConnector } from '@devpulse/connectors';
import { ConnectorOptions } from '@devpulse/core';

interface MyRawData {
  id: string;
  value: number;
}

interface MyTransformed {
  id: string;
  processedValue: number;
}

export class MyConnector extends BaseConnector<MyRawData, MyTransformed> {
  readonly name = 'my-connector';
  readonly type = 'custom';

  constructor(private config: { apiUrl: string }, options?: Partial<ConnectorOptions>) {
    super(options);
  }

  async collect(): Promise<MyRawData[]> {
    // Fetch data from your source
    // Use this.withRetry() for automatic retries
    // Use this.enforceRateLimit() for rate limiting
    const response = await fetch(this.config.apiUrl);
    return response.json();
  }

  transform(raw: MyRawData[]): MyTransformed[] {
    return raw.map(item => ({
      id: item.id,
      processedValue: item.value * 100,
    }));
  }

  validate(data: MyTransformed[]): boolean {
    return data.every(item => item.processedValue >= 0);
  }
}
```

## BaseConnector Features

- **Retry with exponential backoff**: Configurable max retries and delay
- **Rate limiting**: Per-second request throttling
- **Rate limit header checking**: Reads `X-RateLimit-Remaining` and `X-RateLimit-Reset`
- **Structured logging**: info/warn/error with connector name prefix

## Configuration

```yaml
connectors:
  github:
    token: ${GITHUB_TOKEN}
    repos:
      - org/repo-1
      - org/repo-2
  jira:
    host: https://your-org.atlassian.net
    email: ${JIRA_EMAIL}
    token: ${JIRA_TOKEN}
    projects: [PROJ1, PROJ2]
```
