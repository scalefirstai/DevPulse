import { Incident } from '@devpulse/core';

export interface IncidentAnalysis {
  mttrHours: number | null;
  mttrcHours: number | null;
  mttaHours: number | null;
  severity: Incident['severity'];
  isRecurring: boolean;
  rootCauseMethod: string | null;
}

export interface IncidentSummary {
  totalIncidents: number;
  bySeverity: Record<string, number>;
  avgMttrHours: number | null;
  avgMttrcHours: number | null;
  avgMttaHours: number | null;
  recurringPercent: number;
  unknownRootCausePercent: number;
  rootCauseMethodBreakdown: Record<string, number>;
}

export class IncidentAnalyzer {
  analyze(incident: Incident): IncidentAnalysis {
    const mttr = incident.resolvedAt
      ? this.hoursBetween(incident.detectedAt, incident.resolvedAt)
      : null;

    const mttrc = incident.rootCauseAt
      ? this.hoursBetween(incident.detectedAt, incident.rootCauseAt)
      : null;

    const mtta = incident.mitigatedAt
      ? this.hoursBetween(incident.detectedAt, incident.mitigatedAt)
      : null;

    return {
      mttrHours: mttr,
      mttrcHours: mttrc,
      mttaHours: mtta,
      severity: incident.severity,
      isRecurring: incident.isRecurring,
      rootCauseMethod: incident.rootCauseMethod,
    };
  }

  summarize(incidents: Incident[]): IncidentSummary {
    const analyses = incidents.map((i) => this.analyze(i));

    const bySeverity: Record<string, number> = { p1: 0, p2: 0, p3: 0, p4: 0 };
    for (const incident of incidents) {
      bySeverity[incident.severity] = (bySeverity[incident.severity] ?? 0) + 1;
    }

    const mttrValues = analyses.map((a) => a.mttrHours).filter((v): v is number => v !== null);
    const mttrcValues = analyses.map((a) => a.mttrcHours).filter((v): v is number => v !== null);
    const mttaValues = analyses.map((a) => a.mttaHours).filter((v): v is number => v !== null);

    const rootCauseMethodBreakdown: Record<string, number> = {};
    let unknownRootCauseCount = 0;

    for (const a of analyses) {
      if (a.rootCauseMethod) {
        rootCauseMethodBreakdown[a.rootCauseMethod] =
          (rootCauseMethodBreakdown[a.rootCauseMethod] ?? 0) + 1;
      } else {
        unknownRootCauseCount++;
      }
    }

    const recurringCount = analyses.filter((a) => a.isRecurring).length;

    return {
      totalIncidents: incidents.length,
      bySeverity,
      avgMttrHours: this.average(mttrValues),
      avgMttrcHours: this.average(mttrcValues),
      avgMttaHours: this.average(mttaValues),
      recurringPercent: incidents.length > 0
        ? Math.round((recurringCount / incidents.length) * 100 * 100) / 100
        : 0,
      unknownRootCausePercent: incidents.length > 0
        ? Math.round((unknownRootCauseCount / incidents.length) * 100 * 100) / 100
        : 0,
      rootCauseMethodBreakdown,
    };
  }

  detectRecurrences(incidents: Incident[]): Map<string, string[]> {
    const recurrenceMap = new Map<string, string[]>();
    const titleMap = new Map<string, Incident[]>();

    // Group incidents by normalized title
    for (const incident of incidents) {
      const normalizedTitle = this.normalizeTitle(incident.title);
      const existing = titleMap.get(normalizedTitle) ?? [];
      existing.push(incident);
      titleMap.set(normalizedTitle, existing);
    }

    // Find groups with more than one incident
    for (const [, group] of titleMap) {
      if (group.length > 1) {
        const sorted = group.sort(
          (a, b) => a.detectedAt.getTime() - b.detectedAt.getTime(),
        );
        const first = sorted[0].externalId;
        const recurrences = sorted.slice(1).map((i) => i.externalId);
        recurrenceMap.set(first, recurrences);
      }
    }

    return recurrenceMap;
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/\d{4}-\d{2}-\d{2}/g, '') // remove dates
      .replace(/\d+/g, 'N') // normalize numbers
      .replace(/[^a-z\s]/g, '') // remove special chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  private hoursBetween(from: Date, to: Date): number {
    return Math.round(((to.getTime() - from.getTime()) / (1000 * 60 * 60)) * 100) / 100;
  }

  private average(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }
}
