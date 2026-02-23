import { describe, it, expect } from 'vitest';
import { calculateDefectEscapeRate } from '../src/engine/defect-escape';
import { Defect } from '../src/types/kpi';

function makeDefect(overrides: Partial<Defect> = {}): Defect {
  return {
    id: 'defect-1',
    teamId: 'team-1',
    externalId: 'ext-1',
    severity: 'minor',
    foundIn: 'production',
    escaped: false,
    category: null,
    createdAt: new Date('2025-01-15T00:00:00Z'),
    resolvedAt: null,
    ...overrides,
  };
}

describe('calculateDefectEscapeRate', () => {
  it('should calculate basic rate: 4 out of 20 escaped = 20%', () => {
    const defects: Defect[] = [];
    for (let i = 0; i < 20; i++) {
      defects.push(
        makeDefect({
          id: `defect-${i}`,
          externalId: `ext-${i}`,
          escaped: i < 4,
          severity: 'minor',
        }),
      );
    }

    const result = calculateDefectEscapeRate(defects);

    expect(result.rate).toBe(20);
    expect(result.unit).toBe('percent');
    expect(result.escapedCount).toBe(4);
    expect(result.totalCount).toBe(20);
  });

  it('should compute severity breakdown counts for escaped defects', () => {
    const defects: Defect[] = [
      makeDefect({ id: 'd1', externalId: 'e1', escaped: true, severity: 'critical' }),
      makeDefect({ id: 'd2', externalId: 'e2', escaped: true, severity: 'critical' }),
      makeDefect({ id: 'd3', externalId: 'e3', escaped: true, severity: 'major' }),
      makeDefect({ id: 'd4', externalId: 'e4', escaped: true, severity: 'minor' }),
      makeDefect({ id: 'd5', externalId: 'e5', escaped: false, severity: 'critical' }),
      makeDefect({ id: 'd6', externalId: 'e6', escaped: false, severity: 'major' }),
    ];

    const result = calculateDefectEscapeRate(defects);

    expect(result.escapedCount).toBe(4);
    expect(result.severityBreakdown.critical).toBe(2);
    expect(result.severityBreakdown.major).toBe(1);
    expect(result.severityBreakdown.minor).toBe(1);
  });

  it('should return 0% for zero defects (empty array)', () => {
    const result = calculateDefectEscapeRate([]);

    expect(result.rate).toBe(0);
    expect(result.escapedCount).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.severityBreakdown).toEqual({ critical: 0, major: 0, minor: 0 });
    expect(result.categoryBreakdown).toEqual({
      logic_error: 0,
      integration: 0,
      config_drift: 0,
      requirements_gap: 0,
    });
  });

  it('should compute category breakdown for escaped defects', () => {
    const defects: Defect[] = [
      makeDefect({ id: 'd1', externalId: 'e1', escaped: true, category: 'logic_error' }),
      makeDefect({ id: 'd2', externalId: 'e2', escaped: true, category: 'logic_error' }),
      makeDefect({ id: 'd3', externalId: 'e3', escaped: true, category: 'integration' }),
      makeDefect({ id: 'd4', externalId: 'e4', escaped: true, category: 'config_drift' }),
      makeDefect({ id: 'd5', externalId: 'e5', escaped: false, category: 'logic_error' }),
    ];

    const result = calculateDefectEscapeRate(defects);

    expect(result.categoryBreakdown.logic_error).toBe(2);
    expect(result.categoryBreakdown.integration).toBe(1);
    expect(result.categoryBreakdown.config_drift).toBe(1);
    expect(result.categoryBreakdown.requirements_gap).toBe(0);
  });

  it('should handle all defects escaped (100%)', () => {
    const defects: Defect[] = [
      makeDefect({ id: 'd1', externalId: 'e1', escaped: true, severity: 'major' }),
      makeDefect({ id: 'd2', externalId: 'e2', escaped: true, severity: 'minor' }),
    ];

    const result = calculateDefectEscapeRate(defects);

    expect(result.rate).toBe(100);
    expect(result.escapedCount).toBe(2);
    expect(result.totalCount).toBe(2);
  });
});
