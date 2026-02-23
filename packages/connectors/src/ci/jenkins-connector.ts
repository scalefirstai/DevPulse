import { BaseConnector } from '../base-connector.js';
import { ConnectorOptions } from '@devpulse/core';
import { CiBuild } from './github-actions-connector.js';

export interface JenkinsBuildRaw {
  id: string;
  number: number;
  displayName: string;
  fullDisplayName: string;
  result: 'SUCCESS' | 'FAILURE' | 'UNSTABLE' | 'ABORTED' | null;
  building: boolean;
  timestamp: number; // epoch ms
  duration: number; // ms
  url: string;
  changeSets: {
    items: {
      commitId: string;
      author: { fullName: string };
      msg: string;
    }[];
  }[];
  actions: {
    _class?: string;
    causes?: { shortDescription: string }[];
    lastBuiltRevision?: { SHA1: string; branch: { name: string }[] };
  }[];
}

export interface JenkinsConnectorConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
  jobs: string[]; // job path like "folder/job-name"
  teamId: string;
  maxBuilds?: number;
}

export class JenkinsConnector extends BaseConnector<JenkinsBuildRaw, CiBuild> {
  readonly name = 'jenkins';
  readonly type = 'ci';

  private config: JenkinsConnectorConfig;

  constructor(config: JenkinsConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<JenkinsBuildRaw[]> {
    const allBuilds: JenkinsBuildRaw[] = [];
    const maxBuilds = this.config.maxBuilds ?? 100;
    const tree = 'builds[id,number,displayName,fullDisplayName,result,building,timestamp,duration,url,changeSets[items[commitId,author[fullName],msg]],actions[causes[shortDescription],lastBuiltRevision[SHA1,branch[name]]]]';

    for (const job of this.config.jobs) {
      const encodedJob = job.split('/').map(encodeURIComponent).join('/job/');
      const url = `${this.config.baseUrl}/job/${encodedJob}/api/json?tree=${encodeURIComponent(`${tree}{0,${maxBuilds}}`)}`;

      const response = await this.fetchWithAuth(url);
      const body = (await response.json()) as any;
      const builds: JenkinsBuildRaw[] = body.builds ?? [];

      allBuilds.push(...builds);
    }

    this.log('info', `Collected ${allBuilds.length} builds from Jenkins`);
    return allBuilds;
  }

  transform(raw: JenkinsBuildRaw[]): CiBuild[] {
    return raw.map((build) => {
      const startedAt = new Date(build.timestamp);
      const completedAt = !build.building
        ? new Date(build.timestamp + build.duration)
        : null;

      const branchAction = build.actions.find(
        (a) => a.lastBuiltRevision?.branch,
      );
      const branch = branchAction?.lastBuiltRevision?.branch?.[0]?.name ?? 'unknown';
      const commitSha = branchAction?.lastBuiltRevision?.SHA1 ?? '';

      const firstChange = build.changeSets[0]?.items[0];
      const author = firstChange?.author?.fullName ?? 'unknown';

      const cause = build.actions.find((a) => a.causes)?.causes?.[0]?.shortDescription ?? 'unknown';

      return {
        id: '',
        teamId: this.config.teamId,
        externalId: String(build.number),
        pipeline: build.fullDisplayName || build.displayName,
        branch: branch.replace('refs/remotes/origin/', ''),
        commitSha,
        status: this.mapStatus(build),
        startedAt,
        completedAt,
        durationMs: build.building ? null : build.duration,
        trigger: cause,
        author,
        attempt: 1,
        url: build.url,
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

  private mapStatus(build: JenkinsBuildRaw): CiBuild['status'] {
    if (build.building) return 'running';
    switch (build.result) {
      case 'SUCCESS': return 'success';
      case 'FAILURE':
      case 'UNSTABLE': return 'failure';
      case 'ABORTED':
      default: return 'cancelled';
    }
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    const credentials = Buffer.from(
      `${this.config.username}:${this.config.apiToken}`,
    ).toString('base64');

    return fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });
  }
}
