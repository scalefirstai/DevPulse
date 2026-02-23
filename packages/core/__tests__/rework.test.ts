import { describe, it, expect } from 'vitest';
import { calculateRework, ReworkInput } from '../src/engine/rework';
import { PrEvent } from '../src/types/kpi';

function makePr(overrides: Partial<PrEvent> = {}): PrEvent {
  return {
    id: 'pr-1',
    teamId: 'team-1',
    externalId: 'ext-1',
    title: 'Test PR',
    author: 'dev',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    firstCommitAt: new Date('2025-01-01T00:00:00Z'),
    firstReviewAt: null,
    approvedAt: null,
    mergedAt: new Date('2025-01-03T00:00:00Z'),
    deployedAt: null,
    isRework: false,
    reworkReason: null,
    filesChanged: 5,
    additions: 100,
    deletions: 20,
    labels: [],
    ...overrides,
  };
}

describe('calculateRework', () => {
  it('should calculate basic rework rate: 6 rework out of 30 = 20%', () => {
    const prEvents: PrEvent[] = Array.from({ length: 30 }, (_, i) =>
      makePr({
        id: `pr-${i}`,
        externalId: `ext-${i}`,
        isRework: i < 6,
        reworkReason: i < 6 ? 'bug_fix' : null,
      }),
    );

    const input: ReworkInput = { prEvents };
    const result = calculateRework(input);

    expect(result.reworkPercent).toBe(20);
    expect(result.unit).toBe('percent');
    expect(result.reworkPrs).toBe(6);
    expect(result.totalPrs).toBe(30);
  });

  it('should compute reason breakdown counts', () => {
    const prEvents: PrEvent[] = [
      makePr({ id: 'pr-0', externalId: 'e0', isRework: true, reworkReason: 'bug_fix' }),
      makePr({ id: 'pr-1', externalId: 'e1', isRework: true, reworkReason: 'bug_fix' }),
      makePr({ id: 'pr-2', externalId: 'e2', isRework: true, reworkReason: 'requirement_change' }),
      makePr({ id: 'pr-3', externalId: 'e3', isRework: true, reworkReason: 'refactor' }),
      makePr({ id: 'pr-4', externalId: 'e4', isRework: true, reworkReason: 'scope_creep' }),
      makePr({ id: 'pr-5', externalId: 'e5', isRework: false, reworkReason: null }),
      makePr({ id: 'pr-6', externalId: 'e6', isRework: false, reworkReason: null }),
    ];

    const result = calculateRework({ prEvents });

    expect(result.reasonBreakdown.bug_fix).toBe(2);
    expect(result.reasonBreakdown.requirement_change).toBe(1);
    expect(result.reasonBreakdown.refactor).toBe(1);
    expect(result.reasonBreakdown.scope_creep).toBe(1);
    expect(result.reworkPrs).toBe(5);
    expect(result.totalPrs).toBe(7);
  });

  it('should return 0% for zero PRs (empty array)', () => {
    const result = calculateRework({ prEvents: [] });

    expect(result.reworkPercent).toBe(0);
    expect(result.reworkPrs).toBe(0);
    expect(result.totalPrs).toBe(0);
    expect(result.reasonBreakdown).toEqual({
      bug_fix: 0,
      requirement_change: 0,
      refactor: 0,
      scope_creep: 0,
    });
  });

  it('should only count merged PRs (skip unmerged PRs)', () => {
    const prEvents: PrEvent[] = [
      makePr({ id: 'pr-0', externalId: 'e0', mergedAt: new Date('2025-01-03T00:00:00Z'), isRework: true, reworkReason: 'bug_fix' }),
      makePr({ id: 'pr-1', externalId: 'e1', mergedAt: new Date('2025-01-04T00:00:00Z'), isRework: false }),
      makePr({ id: 'pr-2', externalId: 'e2', mergedAt: null, isRework: true, reworkReason: 'bug_fix' }),
      makePr({ id: 'pr-3', externalId: 'e3', mergedAt: null, isRework: false }),
    ];

    const result = calculateRework({ prEvents });

    // Only 2 merged PRs: 1 is rework
    expect(result.totalPrs).toBe(2);
    expect(result.reworkPrs).toBe(1);
    expect(result.reworkPercent).toBe(50);
  });

  it('should handle 100% rework rate', () => {
    const prEvents: PrEvent[] = [
      makePr({ id: 'pr-0', externalId: 'e0', isRework: true, reworkReason: 'bug_fix' }),
      makePr({ id: 'pr-1', externalId: 'e1', isRework: true, reworkReason: 'refactor' }),
    ];

    const result = calculateRework({ prEvents });

    expect(result.reworkPercent).toBe(100);
    expect(result.reworkPrs).toBe(2);
    expect(result.totalPrs).toBe(2);
  });
});
