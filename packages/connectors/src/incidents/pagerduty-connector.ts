import { BaseConnector } from '../base-connector.js';
import { Incident, ConnectorOptions } from '@devpulse/core';

export interface PagerDutyIncidentRaw {
  id: string;
  incident_number: number;
  title: string;
  urgency: 'high' | 'low';
  status: 'triggered' | 'acknowledged' | 'resolved';
  created_at: string;
  last_status_change_at: string;
  service: { id: string; summary: string };
  priority: { summary: string } | null;
  resolve_reason: { type: string } | null;
  alert_counts: { triggered: number; resolved: number };
  first_trigger_log_entry?: {
    created_at: string;
  };
}

export interface PagerDutyConnectorConfig {
  apiToken: string;
  serviceIds: string[];
  teamId: string;
  apiBaseUrl?: string;
  since?: string; // ISO 8601
  until?: string; // ISO 8601
}

export class PagerDutyConnector extends BaseConnector<PagerDutyIncidentRaw, Incident> {
  readonly name = 'pagerduty';
  readonly type = 'incident';

  private config: PagerDutyConnectorConfig;

  constructor(config: PagerDutyConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<PagerDutyIncidentRaw[]> {
    const allIncidents: PagerDutyIncidentRaw[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    const serviceParam = this.config.serviceIds.map((id) => `service_ids[]=${id}`).join('&');
    const sinceParam = this.config.since ? `&since=${this.config.since}` : '';
    const untilParam = this.config.until ? `&until=${this.config.until}` : '';

    while (hasMore) {
      const url = `${this.apiBase}/incidents?${serviceParam}${sinceParam}${untilParam}&limit=${limit}&offset=${offset}&sort_by=created_at:desc`;
      const response = await this.fetchWithAuth(url);

      this.checkRateLimitHeaders(this.extractHeaders(response));

      const body = (await response.json()) as any;
      const incidents: PagerDutyIncidentRaw[] = body.incidents ?? [];

      allIncidents.push(...incidents);
      offset += incidents.length;
      hasMore = body.more ?? false;
    }

    this.log('info', `Collected ${allIncidents.length} incidents from PagerDuty`);
    return allIncidents;
  }

  transform(raw: PagerDutyIncidentRaw[]): Incident[] {
    return raw.map((incident) => ({
      id: '',
      teamId: this.config.teamId,
      externalId: String(incident.incident_number),
      severity: this.mapSeverity(incident),
      title: incident.title,
      detectedAt: new Date(incident.created_at),
      mitigatedAt: incident.status === 'acknowledged'
        ? new Date(incident.last_status_change_at)
        : null,
      rootCauseAt: null, // PagerDuty doesn't track root cause time natively
      resolvedAt: incident.status === 'resolved'
        ? new Date(incident.last_status_change_at)
        : null,
      rootCauseMethod: null,
      rootCauseDescription: null,
      isRecurring: false, // enriched by incident-analyzer
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

  private mapSeverity(incident: PagerDutyIncidentRaw): 'p1' | 'p2' | 'p3' | 'p4' {
    const priorityName = incident.priority?.summary?.toLowerCase() ?? '';
    if (priorityName.includes('p1') || priorityName.includes('critical')) return 'p1';
    if (priorityName.includes('p2') || priorityName.includes('high')) return 'p2';
    if (priorityName.includes('p3') || priorityName.includes('medium')) return 'p3';
    if (priorityName.includes('p4') || priorityName.includes('low')) return 'p4';

    // Fallback to urgency
    return incident.urgency === 'high' ? 'p2' : 'p3';
  }

  private get apiBase(): string {
    return this.config.apiBaseUrl ?? 'https://api.pagerduty.com';
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        Authorization: `Token token=${this.config.apiToken}`,
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
