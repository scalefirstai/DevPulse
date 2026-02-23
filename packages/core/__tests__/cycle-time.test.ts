import { describe, it, expect } from 'vitest';
import { calculateCycleTime, CycleTimeInput } from '../src/engine/cycle-time';
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
    mergedAt: null,
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

describe('calculateCycleTime', () => {
  it('should compute median cycle time for sample data [1,2,2,3,3,4,5,7,10,14] as 3.5 days', () => {
    const cycleDays = [1, 2, 2, 3, 3, 4, 5, 7, 10, 14];
    const base = new Date('2025-01-01T00:00:00Z');

    const prEvents: PrEvent[] = cycleDays.map((days, i) => {
      const createdAt = new Date(base);
      const mergedAt = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      return makePr({
        id: `pr-${i}`,
        externalId: `ext-${i}`,
        createdAt,
        firstCommitAt: createdAt,
        mergedAt,
        deployedAt: mergedAt,
      });
    });

    const input: CycleTimeInput = { prEvents };
    const result = calculateCycleTime(input);

    expect(result.median).toBe(3.5);
    expect(result.unit).toBe('days');
    expect(result.sampleSize).toBe(10);
  });

  it('should compute phase breakdown (ideation, coding, review, deploy) from timestamps', () => {
    const base = new Date('2025-01-10T00:00:00Z');
    const dayMs = 24 * 60 * 60 * 1000;

    const pr = makePr({
      createdAt: base,
      firstCommitAt: new Date(base.getTime() + 2 * dayMs),
      firstReviewAt: new Date(base.getTime() + 5 * dayMs),
      approvedAt: new Date(base.getTime() + 6 * dayMs),
      mergedAt: new Date(base.getTime() + 7 * dayMs),
      deployedAt: new Date(base.getTime() + 8 * dayMs),
    });

    const issueCreatedDates = new Map<string, Date>();
    issueCreatedDates.set(pr.externalId, base);

    const input: CycleTimeInput = { prEvents: [pr], issueCreatedDates };
    const result = calculateCycleTime(input);

    // ideation: base -> firstCommitAt = 2 days
    expect(result.breakdown.ideation).toBe(2);
    // coding: firstCommitAt -> firstReviewAt = 3 days
    expect(result.breakdown.coding).toBe(3);
    // review: firstReviewAt -> approvedAt = 1 day
    expect(result.breakdown.review).toBe(1);
    // deploy: approvedAt -> deployedAt = 2 days
    expect(result.breakdown.deploy).toBe(2);
  });

  it('should fall back to firstCommitAt when no issueCreatedDates are provided', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const firstCommitAt = new Date('2025-02-01T00:00:00Z');
    const mergedAt = new Date(firstCommitAt.getTime() + 4 * dayMs);

    const pr = makePr({
      createdAt: new Date('2025-01-28T00:00:00Z'),
      firstCommitAt,
      firstReviewAt: new Date(firstCommitAt.getTime() + 2 * dayMs),
      approvedAt: new Date(firstCommitAt.getTime() + 3 * dayMs),
      mergedAt,
      deployedAt: mergedAt,
    });

    // No issueCreatedDates provided, so start date = firstCommitAt
    const input: CycleTimeInput = { prEvents: [pr] };
    const result = calculateCycleTime(input);

    // cycle time: firstCommitAt -> deployedAt = 4 days
    expect(result.median).toBe(4);
    // ideation should be 0 because start = firstCommitAt
    expect(result.breakdown.ideation).toBe(0);
  });

  it('should skip unmerged PRs and return 0 for empty inputs', () => {
    const unmergedPr = makePr({
      mergedAt: null,
      deployedAt: null,
    });

    const result = calculateCycleTime({ prEvents: [unmergedPr] });
    expect(result.median).toBe(0);
    expect(result.sampleSize).toBe(0);

    const emptyResult = calculateCycleTime({ prEvents: [] });
    expect(emptyResult.median).toBe(0);
    expect(emptyResult.sampleSize).toBe(0);
  });

  it('should use mergedAt as fallback when deployedAt is null', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const createdAt = new Date('2025-03-01T00:00:00Z');
    const mergedAt = new Date(createdAt.getTime() + 3 * dayMs);

    const pr = makePr({
      createdAt,
      firstCommitAt: createdAt,
      mergedAt,
      deployedAt: null,
    });

    const result = calculateCycleTime({ prEvents: [pr] });
    expect(result.median).toBe(3);
  });
});
