import { describe, it, expect } from 'vitest';
import { calculateMttrc } from '../src/engine/mttrc';
import { Incident } from '../src/types/kpi';

function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'inc-1',
    teamId: 'team-1',
    externalId: 'ext-1',
    severity: 'p2',
    title: 'Test incident',
    detectedAt: new Date('2025-01-10T00:00:00Z'),
    mitigatedAt: null,
    rootCauseAt: null,
    resolvedAt: null,
    rootCauseMethod: null,
    rootCauseDescription: null,
    isRecurring: false,
    recurrenceOf: null,
    ...overrides,
  };
}

describe('calculateMttrc', () => {
  it('should compute median root cause time: [0.5, 1, 2, 4, 8] hours => 2', () => {
    const hourMs = 60 * 60 * 1000;
    const base = new Date('2025-01-10T00:00:00Z');
    const rootCauseHours = [0.5, 1, 2, 4, 8];

    const incidents: Incident[] = rootCauseHours.map((hours, i) =>
      makeIncident({
        id: `inc-${i}`,
        externalId: `ext-${i}`,
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + hours * hourMs),
        rootCauseMethod: 'observability',
      }),
    );

    const result = calculateMttrc(incidents);

    expect(result.median).toBe(2);
    expect(result.unit).toBe('hours');
    expect(result.sampleSize).toBe(5);
  });

  it('should compute unknownRootCausePercent: 3 of 10 with no rootCauseAt => 30%', () => {
    const hourMs = 60 * 60 * 1000;
    const base = new Date('2025-02-01T00:00:00Z');

    const incidents: Incident[] = Array.from({ length: 10 }, (_, i) =>
      makeIncident({
        id: `inc-${i}`,
        externalId: `ext-${i}`,
        detectedAt: base,
        rootCauseAt: i < 7 ? new Date(base.getTime() + 2 * hourMs) : null,
        rootCauseMethod: i < 7 ? 'log_analysis' : null,
      }),
    );

    const result = calculateMttrc(incidents);

    expect(result.unknownRootCausePercent).toBe(30);
    expect(result.sampleSize).toBe(10);
  });

  it('should compute method breakdown counts', () => {
    const hourMs = 60 * 60 * 1000;
    const base = new Date('2025-03-01T00:00:00Z');

    const incidents: Incident[] = [
      makeIncident({
        id: 'inc-0',
        externalId: 'ext-0',
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + 1 * hourMs),
        rootCauseMethod: 'observability',
      }),
      makeIncident({
        id: 'inc-1',
        externalId: 'ext-1',
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + 2 * hourMs),
        rootCauseMethod: 'observability',
      }),
      makeIncident({
        id: 'inc-2',
        externalId: 'ext-2',
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + 3 * hourMs),
        rootCauseMethod: 'log_analysis',
      }),
      makeIncident({
        id: 'inc-3',
        externalId: 'ext-3',
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + 4 * hourMs),
        rootCauseMethod: 'code_review',
      }),
      makeIncident({
        id: 'inc-4',
        externalId: 'ext-4',
        detectedAt: base,
        rootCauseAt: new Date(base.getTime() + 5 * hourMs),
        rootCauseMethod: 'brute_force',
      }),
    ];

    const result = calculateMttrc(incidents);

    expect(result.methodBreakdown.observability).toBe(2);
    expect(result.methodBreakdown.log_analysis).toBe(1);
    expect(result.methodBreakdown.code_review).toBe(1);
    expect(result.methodBreakdown.brute_force).toBe(1);
  });

  it('should return 0 median and 0% unknown for empty incidents', () => {
    const result = calculateMttrc([]);

    expect(result.median).toBe(0);
    expect(result.unknownRootCausePercent).toBe(0);
    expect(result.sampleSize).toBe(0);
    expect(result.methodBreakdown).toEqual({
      observability: 0,
      log_analysis: 0,
      code_review: 0,
      brute_force: 0,
    });
  });

  it('should return 100% unknown when no incidents have root cause', () => {
    const incidents: Incident[] = [
      makeIncident({ id: 'inc-0', externalId: 'ext-0', rootCauseAt: null }),
      makeIncident({ id: 'inc-1', externalId: 'ext-1', rootCauseAt: null }),
    ];

    const result = calculateMttrc(incidents);

    expect(result.unknownRootCausePercent).toBe(100);
    expect(result.median).toBe(0);
    expect(result.sampleSize).toBe(2);
  });
});
