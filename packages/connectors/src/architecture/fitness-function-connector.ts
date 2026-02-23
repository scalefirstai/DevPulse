import { BaseConnector } from '../base-connector.js';
import { ArchViolation, ConnectorOptions } from '@devpulse/core';
import { readFile } from 'fs/promises';

export interface FitnessFunctionResult {
  name: string;
  passed: boolean;
  violations: {
    rule: string;
    source: string;
    target: string;
    file: string;
    message: string;
  }[];
  timestamp: string;
}

export interface FitnessFunctionConfig {
  teamId: string;
  resultPaths: string[];
}

export class FitnessFunctionConnector extends BaseConnector<FitnessFunctionResult, ArchViolation> {
  readonly name = 'fitness-functions';
  readonly type = 'architecture';

  private config: FitnessFunctionConfig;

  constructor(config: FitnessFunctionConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  async collect(): Promise<FitnessFunctionResult[]> {
    const results: FitnessFunctionResult[] = [];

    for (const path of this.config.resultPaths) {
      try {
        const content = await readFile(path, 'utf-8');
        const parsed: FitnessFunctionResult | FitnessFunctionResult[] = JSON.parse(content);
        if (Array.isArray(parsed)) {
          results.push(...parsed);
        } else {
          results.push(parsed);
        }
      } catch {
        this.log('warn', `Failed to read fitness function result: ${path}`);
      }
    }

    this.log('info', `Collected results from ${results.length} fitness functions`);
    return results;
  }

  transform(raw: FitnessFunctionResult[]): ArchViolation[] {
    const violations: ArchViolation[] = [];

    for (const result of raw) {
      if (result.passed) continue;

      for (const v of result.violations) {
        violations.push({
          id: '',
          teamId: this.config.teamId,
          ruleName: v.rule || result.name,
          violationType: 'fitness_function',
          sourceComponent: v.source || 'unknown',
          targetComponent: v.target || 'unknown',
          filePath: v.file || '',
          firstDetectedAt: new Date(result.timestamp || Date.now()),
          resolvedAt: null,
          scanSource: 'fitness-function',
        });
      }
    }

    return violations;
  }

  validate(data: ArchViolation[]): boolean {
    return data.every((v) => v.ruleName && v.teamId);
  }
}
