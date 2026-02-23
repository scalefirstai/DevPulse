import { BaseConnector } from '../base-connector.js';
import { ConnectorOptions } from '@devpulse/core';

export interface GitHubWorkflowRunRaw {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
  run_attempt: number;
  triggering_actor: { login: string };
  event: string;
}

export interface CiBuild {
  id: string;
  teamId: string;
  externalId: string;
  pipeline: string;
  branch: string;
  commitSha: string;
  status: 'success' | 'failure' | 'cancelled' | 'running';
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  trigger: string;
  author: string;
  attempt: number;
  url: string;
}

export interface GitHubActionsConnectorConfig {
  token: string;
  repos: string[]; // "owner/repo" format
  teamId: string;
  apiBaseUrl?: string;
  workflowFilter?: string[]; // only include specific workflow names
}

export class GitHubActionsConnector extends BaseConnector<GitHubWorkflowRunRaw, CiBuild> {
  readonly name = 'github-actions';
  readonly type = 'ci';

  private config: GitHubActionsConnectorConfig;

  constructor(config: GitHubActionsConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<GitHubWorkflowRunRaw[]> {
    const allRuns: GitHubWorkflowRunRaw[] = [];

    for (const repo of this.config.repos) {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const url = `${this.apiBase}/repos/${repo}/actions/runs?per_page=100&page=${page}&status=completed`;
        const response = await this.fetchWithAuth(url);

        this.checkRateLimitHeaders(this.extractHeaders(response));

        const body = (await response.json()) as any;
        const runs: GitHubWorkflowRunRaw[] = body.workflow_runs ?? [];

        if (this.config.workflowFilter) {
          const filtered = runs.filter((r) =>
            this.config.workflowFilter!.includes(r.name),
          );
          allRuns.push(...filtered);
        } else {
          allRuns.push(...runs);
        }

        page++;
        if (runs.length < 100) hasMore = false;
      }
    }

    this.log('info', `Collected ${allRuns.length} workflow runs from GitHub Actions`);
    return allRuns;
  }

  transform(raw: GitHubWorkflowRunRaw[]): CiBuild[] {
    return raw.map((run) => {
      const startedAt = new Date(run.run_started_at);
      const completedAt = run.status === 'completed' ? new Date(run.updated_at) : null;
      const durationMs = completedAt
        ? completedAt.getTime() - startedAt.getTime()
        : null;

      return {
        id: '',
        teamId: this.config.teamId,
        externalId: String(run.id),
        pipeline: run.name,
        branch: run.head_branch,
        commitSha: run.head_sha,
        status: this.mapStatus(run),
        startedAt,
        completedAt,
        durationMs,
        trigger: run.event,
        author: run.triggering_actor.login,
        attempt: run.run_attempt,
        url: run.html_url,
      };
    });
  }

  validate(data: CiBuild[]): boolean {
    return data.every(
      (b) =>
        b.externalId &&
        b.teamId &&
        b.pipeline &&
        b.startedAt instanceof Date &&
        ['success', 'failure', 'cancelled', 'running'].includes(b.status),
    );
  }

  private mapStatus(run: GitHubWorkflowRunRaw): CiBuild['status'] {
    if (run.status !== 'completed') return 'running';
    switch (run.conclusion) {
      case 'success': return 'success';
      case 'failure': return 'failure';
      case 'cancelled':
      case 'timed_out':
      case 'skipped':
      default: return 'cancelled';
    }
  }

  private get apiBase(): string {
    return this.config.apiBaseUrl ?? 'https://api.github.com';
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
