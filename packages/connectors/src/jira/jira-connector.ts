import { BaseConnector } from '../base-connector.js';
import { Defect, ConnectorOptions } from '@devpulse/core';

export interface JiraIssueRaw {
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string };
    priority: { name: string };
    status: { name: string; statusCategory: { key: string } };
    created: string;
    resolutiondate: string | null;
    labels: string[];
    components: { name: string }[];
    fixVersions: { name: string }[];
    customfield_environment?: string;
  };
}

export interface JiraConnectorConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKeys: string[];
  teamId: string;
  bugIssueTypes?: string[];
  maxResults?: number;
}

export class JiraConnector extends BaseConnector<JiraIssueRaw, Defect> {
  readonly name = 'jira';
  readonly type = 'issue-tracker';

  private config: JiraConnectorConfig;

  constructor(config: JiraConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<JiraIssueRaw[]> {
    const allIssues: JiraIssueRaw[] = [];
    const maxResults = this.config.maxResults ?? 100;
    const bugTypes = this.config.bugIssueTypes ?? ['Bug', 'Defect'];
    const typeClause = bugTypes.map((t) => `"${t}"`).join(', ');
    const projectClause = this.config.projectKeys.join(', ');

    const jql = `project in (${projectClause}) AND issuetype in (${typeClause}) ORDER BY created DESC`;

    let startAt = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `${this.config.baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=summary,issuetype,priority,status,created,resolutiondate,labels,components,fixVersions`;
      const response = await this.fetchWithAuth(url);

      this.checkRateLimitHeaders(this.extractHeaders(response));

      const body = (await response.json()) as any;
      const issues: JiraIssueRaw[] = body.issues ?? [];

      allIssues.push(...issues);
      startAt += issues.length;

      if (issues.length < maxResults || startAt >= body.total) {
        hasMore = false;
      }
    }

    this.log('info', `Collected ${allIssues.length} defects from Jira`);
    return allIssues;
  }

  transform(raw: JiraIssueRaw[]): Defect[] {
    return raw.map((issue) => ({
      id: '',
      teamId: this.config.teamId,
      externalId: issue.key,
      severity: this.mapSeverity(issue.fields.priority.name),
      foundIn: issue.fields.fixVersions[0]?.name ?? 'unknown',
      escaped: this.isEscaped(issue),
      category: this.categorizeDefect(issue),
      createdAt: new Date(issue.fields.created),
      resolvedAt: issue.fields.resolutiondate
        ? new Date(issue.fields.resolutiondate)
        : null,
    }));
  }

  validate(data: Defect[]): boolean {
    return data.every(
      (d) =>
        d.externalId &&
        d.teamId &&
        ['critical', 'major', 'minor'].includes(d.severity) &&
        d.createdAt instanceof Date,
    );
  }

  private mapSeverity(priority: string): 'critical' | 'major' | 'minor' {
    const normalized = priority.toLowerCase();
    if (normalized === 'highest' || normalized === 'critical' || normalized === 'blocker') {
      return 'critical';
    }
    if (normalized === 'high' || normalized === 'major') {
      return 'major';
    }
    return 'minor';
  }

  private isEscaped(issue: JiraIssueRaw): boolean {
    const labels = issue.fields.labels.map((l) => l.toLowerCase());
    if (labels.includes('escaped') || labels.includes('production-bug')) {
      return true;
    }
    const env = issue.fields.customfield_environment?.toLowerCase() ?? '';
    return env.includes('production') || env.includes('prod');
  }

  private categorizeDefect(issue: JiraIssueRaw): string | null {
    const labels = issue.fields.labels.map((l) => l.toLowerCase());
    if (labels.includes('logic-error') || labels.includes('logic_error')) return 'logic_error';
    if (labels.includes('integration')) return 'integration';
    if (labels.includes('config-drift') || labels.includes('config_drift')) return 'config_drift';
    if (labels.includes('requirements-gap') || labels.includes('requirements_gap')) return 'requirements_gap';
    return null;
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    const credentials = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');
    return fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return headers;
  }
}
