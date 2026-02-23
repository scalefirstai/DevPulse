import { BaseConnector } from '../base-connector.js';
import { PrEvent, ConnectorOptions } from '@devpulse/core';

export interface GitHubPrRaw {
  number: number;
  title: string;
  user: { login: string };
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  labels: { name: string }[];
  additions: number;
  deletions: number;
  changed_files: number;
  head: { sha: string };
  base: { ref: string };
}

export interface GitHubConnectorConfig {
  token: string;
  repos: string[]; // "owner/repo" format
  teamId: string;
  apiBaseUrl?: string;
}

export class GitHubConnector extends BaseConnector<GitHubPrRaw, PrEvent> {
  readonly name = 'github';
  readonly type = 'scm';

  private config: GitHubConnectorConfig;

  constructor(config: GitHubConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<GitHubPrRaw[]> {
    const allPrs: GitHubPrRaw[] = [];

    for (const repo of this.config.repos) {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${this.apiBase}/repos/${repo}/pulls?state=closed&per_page=100&page=${page}&sort=updated&direction=desc`;
        const response = await this.fetchWithAuth(url);

        this.checkRateLimitHeaders(this.extractHeaders(response));

        const prs: GitHubPrRaw[] = (await response.json()) as GitHubPrRaw[];

        if (prs.length === 0) {
          hasMore = false;
        } else {
          allPrs.push(...prs);
          page++;
          if (prs.length < 100) hasMore = false;
        }
      }
    }

    this.log('info', `Collected ${allPrs.length} PRs from ${this.config.repos.length} repos`);
    return allPrs;
  }

  transform(raw: GitHubPrRaw[]): PrEvent[] {
    return raw
      .filter((pr) => pr.merged_at !== null)
      .map((pr) => ({
        id: '',
        teamId: this.config.teamId,
        externalId: String(pr.number),
        title: pr.title,
        author: pr.user.login,
        createdAt: new Date(pr.created_at),
        firstCommitAt: new Date(pr.created_at), // approximation; enriched by pr-analyzer
        firstReviewAt: null,
        approvedAt: null,
        mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
        deployedAt: null,
        isRework: false,
        reworkReason: null,
        filesChanged: pr.changed_files,
        additions: pr.additions,
        deletions: pr.deletions,
        labels: pr.labels.map((l) => l.name),
      }));
  }

  validate(data: PrEvent[]): boolean {
    return data.every(
      (pr) => pr.externalId && pr.teamId && pr.author && pr.createdAt instanceof Date,
    );
  }

  private get apiBase(): string {
    return this.config.apiBaseUrl || 'https://api.github.com';
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'DevPulse-Connector',
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
