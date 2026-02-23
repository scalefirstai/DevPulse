import { JiraIssueRaw } from './jira-connector.js';

export interface IssueTransition {
  from: string;
  to: string;
  timestamp: Date;
  author: string;
}

export interface IssueLifecycleMetrics {
  issueKey: string;
  createdAt: Date;
  resolvedAt: Date | null;
  timeToFirstResponse: number | null; // hours
  timeToResolution: number | null; // hours
  reopenCount: number;
  transitionCount: number;
  staleFor: number | null; // hours since last transition (null if resolved)
}

interface JiraChangelog {
  histories: {
    created: string;
    author: { displayName: string };
    items: {
      field: string;
      fromString: string | null;
      toString: string | null;
    }[];
  }[];
}

export interface IssueLifecycleConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export class IssueLifecycle {
  private config: IssueLifecycleConfig;

  constructor(config: IssueLifecycleConfig) {
    this.config = config;
  }

  async analyzeIssue(issueKey: string): Promise<IssueLifecycleMetrics> {
    const changelog = await this.fetchChangelog(issueKey);
    const transitions = this.extractStatusTransitions(changelog);

    const created = changelog.histories.length > 0
      ? new Date(changelog.histories[0].created)
      : new Date();

    const resolutionTransition = transitions.find(
      (t) => t.to.toLowerCase() === 'done' || t.to.toLowerCase() === 'resolved',
    );

    const firstResponseTransition = transitions.find(
      (t) => t.from.toLowerCase() === 'open' || t.from.toLowerCase() === 'to do',
    );

    const reopens = transitions.filter(
      (t) => t.from.toLowerCase() === 'done' || t.from.toLowerCase() === 'resolved',
    );

    const lastTransition = transitions[transitions.length - 1];
    const isResolved = resolutionTransition !== undefined && reopens.length === 0;

    return {
      issueKey,
      createdAt: created,
      resolvedAt: resolutionTransition ? resolutionTransition.timestamp : null,
      timeToFirstResponse: firstResponseTransition
        ? this.hoursBetween(created, firstResponseTransition.timestamp)
        : null,
      timeToResolution: resolutionTransition
        ? this.hoursBetween(created, resolutionTransition.timestamp)
        : null,
      reopenCount: reopens.length,
      transitionCount: transitions.length,
      staleFor: !isResolved && lastTransition
        ? this.hoursBetween(lastTransition.timestamp, new Date())
        : null,
    };
  }

  async analyzeIssues(issues: JiraIssueRaw[]): Promise<IssueLifecycleMetrics[]> {
    const results: IssueLifecycleMetrics[] = [];
    for (const issue of issues) {
      const metrics = await this.analyzeIssue(issue.key);
      results.push(metrics);
    }
    return results;
  }

  private extractStatusTransitions(changelog: JiraChangelog): IssueTransition[] {
    const transitions: IssueTransition[] = [];

    for (const history of changelog.histories) {
      for (const item of history.items) {
        if (item.field === 'status') {
          transitions.push({
            from: item.fromString ?? 'unknown',
            to: item.toString ?? 'unknown',
            timestamp: new Date(history.created),
            author: history.author.displayName,
          });
        }
      }
    }

    return transitions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private async fetchChangelog(issueKey: string): Promise<JiraChangelog> {
    const credentials = Buffer.from(
      `${this.config.email}:${this.config.apiToken}`,
    ).toString('base64');

    const url = `${this.config.baseUrl}/rest/api/3/issue/${issueKey}?expand=changelog&fields=`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch changelog for ${issueKey}: ${response.status}`);
    }

    const body = (await response.json()) as any;
    return body.changelog ?? { histories: [] };
  }

  private hoursBetween(from: Date, to: Date): number {
    return Math.round(((to.getTime() - from.getTime()) / (1000 * 60 * 60)) * 100) / 100;
  }
}
