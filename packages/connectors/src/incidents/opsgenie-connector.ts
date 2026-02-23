import { BaseConnector } from '../base-connector.js';
import { Incident, ConnectorOptions } from '@devpulse/core';

export interface OpsGenieAlertRaw {
  id: string;
  tinyId: string;
  message: string;
  status: 'open' | 'acked' | 'closed';
  acknowledged: boolean;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  acknowledgedAt?: string;
  tags: string[];
  teams: { id: string; name: string }[];
  report?: {
    ackTime?: number; // ms
    closeTime?: number; // ms
  };
}

export interface OpsGenieConnectorConfig {
  apiKey: string;
  teamId: string;
  opsGenieTeamIds?: string[];
  apiBaseUrl?: string;
  since?: string; // ISO 8601
}

export class OpsGenieConnector extends BaseConnector<OpsGenieAlertRaw, Incident> {
  readonly name = 'opsgenie';
  readonly type = 'incident';

  private config: OpsGenieConnectorConfig;

  constructor(config: OpsGenieConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<OpsGenieAlertRaw[]> {
    const allAlerts: OpsGenieAlertRaw[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    const sinceQuery = this.config.since
      ? ` AND createdAt>=${this.config.since}`
      : '';
    const query = `status=closed${sinceQuery}`;

    while (hasMore) {
      const url = `${this.apiBase}/v2/alerts?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&sort=createdAt&order=desc`;
      const response = await this.fetchWithAuth(url);

      this.checkRateLimitHeaders(this.extractHeaders(response));

      const body = (await response.json()) as any;
      const alerts: OpsGenieAlertRaw[] = body.data ?? [];

      allAlerts.push(...alerts);
      offset += alerts.length;
      hasMore = alerts.length >= limit;
    }

    // Filter by team if opsGenieTeamIds specified
    const filtered = this.config.opsGenieTeamIds
      ? allAlerts.filter((a) =>
          a.teams.some((t) => this.config.opsGenieTeamIds!.includes(t.id)),
        )
      : allAlerts;

    this.log('info', `Collected ${filtered.length} alerts from OpsGenie`);
    return filtered;
  }

  transform(raw: OpsGenieAlertRaw[]): Incident[] {
    return raw.map((alert) => ({
      id: '',
      teamId: this.config.teamId,
      externalId: alert.tinyId,
      severity: this.mapSeverity(alert.priority),
      title: alert.message,
      detectedAt: new Date(alert.createdAt),
      mitigatedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : null,
      rootCauseAt: null,
      resolvedAt: alert.closedAt ? new Date(alert.closedAt) : null,
      rootCauseMethod: null,
      rootCauseDescription: null,
      isRecurring: this.detectRecurring(alert),
      recurrenceOf: null,
    }));
  }

  validate(data: Incident[]): boolean {
    return data.every(
      (i) =>
        i.externalId &&
        i.teamId &&
        ['p1', 'p2', 'p3', 'p4'].includes(i.severity) &&
        i.detectedAt instanceof Date,
    );
  }

  private mapSeverity(priority: string): 'p1' | 'p2' | 'p3' | 'p4' {
    switch (priority) {
      case 'P1': return 'p1';
      case 'P2': return 'p2';
      case 'P3': return 'p3';
      case 'P4':
      case 'P5':
      default: return 'p4';
    }
  }

  private detectRecurring(alert: OpsGenieAlertRaw): boolean {
    return alert.tags.some((t) => t.toLowerCase() === 'recurring' || t.toLowerCase() === 'repeat');
  }

  private get apiBase(): string {
    return this.config.apiBaseUrl ?? 'https://api.opsgenie.com';
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `GenieKey ${this.config.apiKey}`,
        Accept: 'application/json',
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
