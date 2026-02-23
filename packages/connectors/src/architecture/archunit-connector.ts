import { BaseConnector } from '../base-connector.js';
import { ArchViolation, ConnectorOptions } from '@devpulse/core';
import { readFile } from 'fs/promises';

export interface ArchUnitReportEntry {
  rule: string;
  violation: string;
  sourceClass: string;
  targetClass: string;
  file: string;
  line: number;
}

export interface ArchUnitConnectorConfig {
  teamId: string;
  reportPaths: string[];
  scanSource?: string;
}

export class ArchUnitConnector extends BaseConnector<ArchUnitReportEntry, ArchViolation> {
  readonly name = 'archunit';
  readonly type = 'architecture';

  private config: ArchUnitConnectorConfig;

  constructor(config: ArchUnitConnectorConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<ArchUnitReportEntry[]> {
    const entries: ArchUnitReportEntry[] = [];

    for (const reportPath of this.config.reportPaths) {
      try {
        const content = await readFile(reportPath, 'utf-8');
        const parsed = this.parseReport(content, reportPath);
        entries.push(...parsed);
      } catch (error) {
        this.log('warn', `Failed to read report: ${reportPath}`);
      }
    }

    this.log('info', `Collected ${entries.length} violations from ${this.config.reportPaths.length} reports`);
    return entries;
  }

  transform(raw: ArchUnitReportEntry[]): ArchViolation[] {
    return raw.map((entry) => ({
      id: '',
      teamId: this.config.teamId,
      ruleName: entry.rule,
      violationType: this.classifyViolationType(entry.rule),
      sourceComponent: entry.sourceClass,
      targetComponent: entry.targetClass,
      filePath: entry.file,
      firstDetectedAt: new Date(),
      resolvedAt: null,
      scanSource: this.config.scanSource || 'archunit',
    }));
  }

  validate(data: ArchViolation[]): boolean {
    return data.every((v) => v.ruleName && v.sourceComponent && v.filePath);
  }

  private parseReport(content: string, path: string): ArchUnitReportEntry[] {
    // Support JSON format (ArchUnit test report)
    if (path.endsWith('.json')) {
      try {
        const report = JSON.parse(content);
        if (Array.isArray(report)) return report;
        if (report.violations) return report.violations;
      } catch {
        this.log('warn', `Failed to parse JSON report: ${path}`);
      }
    }

    // Support plain text format (one violation per line)
    const entries: ArchUnitReportEntry[] = [];
    const lines = content.split('\n').filter((l) => l.trim());

    for (const line of lines) {
      const match = line.match(/Rule '([^']+)' was violated.*?by (.+?) accessing (.+?) in (.+?)(?::(\d+))?/);
      if (match) {
        entries.push({
          rule: match[1],
          violation: line.trim(),
          sourceClass: match[2],
          targetClass: match[3],
          file: match[4],
          line: match[5] ? parseInt(match[5], 10) : 0,
        });
      }
    }

    return entries;
  }

  private classifyViolationType(rule: string): string {
    const lower = rule.toLowerCase();
    if (lower.includes('circular') || lower.includes('cycle')) return 'dependency';
    if (lower.includes('layer')) return 'layer_violation';
    if (lower.includes('boundary') || lower.includes('api')) return 'boundary_violation';
    if (lower.includes('encapsulation') || lower.includes('internal')) return 'encapsulation';
    return 'dependency';
  }
}
