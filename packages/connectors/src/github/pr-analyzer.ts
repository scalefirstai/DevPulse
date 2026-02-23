import { PrEvent } from '@devpulse/core';

interface GitHubReview {
  user: { login: string };
  state: string;
  submitted_at: string;
}

interface GitHubCommit {
  sha: string;
  commit: { author: { date: string } };
}

interface GitHubDeployment {
  created_at: string;
  environment: string;
  sha: string;
}

export interface PrAnalyzerConfig {
  token: string;
  apiBaseUrl?: string;
}

export class PrAnalyzer {
  private config: PrAnalyzerConfig;

  constructor(config: PrAnalyzerConfig) {
    this.config = config;
  }

  async enrichPrEvents(prs: PrEvent[], repo: string): Promise<PrEvent[]> {
    const enriched: PrEvent[] = [];

    for (const pr of prs) {
      try {
        const [reviews, commits, deployments] = await Promise.all([
          this.fetchReviews(repo, pr.externalId),
          this.fetchCommits(repo, pr.externalId),
          this.fetchDeployments(repo, pr),
        ]);

        const firstCommitAt = this.getFirstCommitDate(commits);
        const firstReviewAt = this.getFirstReviewDate(reviews);
        const approvedAt = this.getApprovalDate(reviews);
        const deployedAt = this.getDeployDate(deployments, pr);

        enriched.push({
          ...pr,
          firstCommitAt: firstCommitAt || pr.firstCommitAt,
          firstReviewAt,
          approvedAt,
          deployedAt,
        });
      } catch {
        enriched.push(pr);
      }
    }

    return enriched;
  }

  private getFirstCommitDate(commits: GitHubCommit[]): Date | null {
    if (commits.length === 0) return null;
    const sorted = [...commits].sort(
      (a, b) =>
        new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime(),
    );
    return new Date(sorted[0].commit.author.date);
  }

  private getFirstReviewDate(reviews: GitHubReview[]): Date | null {
    if (reviews.length === 0) return null;
    const sorted = [...reviews].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
    );
    return new Date(sorted[0].submitted_at);
  }

  private getApprovalDate(reviews: GitHubReview[]): Date | null {
    const approvals = reviews.filter((r) => r.state === 'APPROVED');
    if (approvals.length === 0) return null;
    const sorted = [...approvals].sort(
      (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
    );
    return new Date(sorted[0].submitted_at);
  }

  private getDeployDate(deployments: GitHubDeployment[], pr: PrEvent): Date | null {
    if (deployments.length === 0) return null;
    const mergedAt = pr.mergedAt?.getTime() ?? 0;
    const postMergeDeploys = deployments.filter(
      (d) =>
        d.environment === 'production' && new Date(d.created_at).getTime() >= mergedAt,
    );
    if (postMergeDeploys.length === 0) return null;
    return new Date(postMergeDeploys[0].created_at);
  }

  private async fetchReviews(repo: string, prNumber: string): Promise<GitHubReview[]> {
    const url = `${this.apiBase}/repos/${repo}/pulls/${prNumber}/reviews`;
    const response = await this.fetchWithAuth(url);
    return (await response.json()) as GitHubReview[];
  }

  private async fetchCommits(repo: string, prNumber: string): Promise<GitHubCommit[]> {
    const url = `${this.apiBase}/repos/${repo}/pulls/${prNumber}/commits`;
    const response = await this.fetchWithAuth(url);
    return (await response.json()) as GitHubCommit[];
  }

  private async fetchDeployments(repo: string, pr: PrEvent): Promise<GitHubDeployment[]> {
    try {
      const url = `${this.apiBase}/repos/${repo}/deployments?sha=${pr.externalId}&environment=production`;
      const response = await this.fetchWithAuth(url);
      return (await response.json()) as GitHubDeployment[];
    } catch {
      return [];
    }
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
    });
  }
}
