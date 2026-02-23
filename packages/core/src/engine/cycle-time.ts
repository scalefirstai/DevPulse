import { CycleTimeResult, CycleTimeBreakdown, PrEvent } from '../types/kpi.js';
import { median } from '../utils/statistics.js';
import { diffInDays } from '../utils/time.js';

export interface CycleTimeInput {
  prEvents: PrEvent[];
  issueCreatedDates?: Map<string, Date>;
}

function computePrCycleTime(pr: PrEvent, issueCreatedAt?: Date): number | null {
  const deployedAt = pr.deployedAt ?? pr.mergedAt;
  if (!deployedAt) return null;

  const startDate = issueCreatedAt ?? pr.firstCommitAt ?? pr.createdAt;
  return diffInDays(startDate, deployedAt);
}

function computePhaseBreakdown(pr: PrEvent, issueCreatedAt?: Date): CycleTimeBreakdown | null {
  if (!pr.mergedAt) return null;

  const startDate = issueCreatedAt ?? pr.firstCommitAt ?? pr.createdAt;
  const firstCommit = pr.firstCommitAt ?? pr.createdAt;
  const firstReview = pr.firstReviewAt ?? pr.mergedAt;
  const approved = pr.approvedAt ?? pr.mergedAt;
  const deployed = pr.deployedAt ?? pr.mergedAt;

  return {
    ideation: Math.max(0, diffInDays(startDate, firstCommit)),
    coding: Math.max(0, diffInDays(firstCommit, firstReview)),
    review: Math.max(0, diffInDays(firstReview, approved)),
    deploy: Math.max(0, diffInDays(approved, deployed)),
  };
}

export function calculateCycleTime(input: CycleTimeInput): CycleTimeResult {
  const { prEvents, issueCreatedDates } = input;

  const cycleTimes: number[] = [];
  const breakdowns: CycleTimeBreakdown[] = [];

  for (const pr of prEvents) {
    if (!pr.mergedAt) continue;

    const issueCreatedAt = issueCreatedDates?.get(pr.externalId);
    const cycleTime = computePrCycleTime(pr, issueCreatedAt);
    if (cycleTime !== null && cycleTime >= 0) {
      cycleTimes.push(cycleTime);
    }

    const breakdown = computePhaseBreakdown(pr, issueCreatedAt);
    if (breakdown) {
      breakdowns.push(breakdown);
    }
  }

  const aggregatedBreakdown: CycleTimeBreakdown = {
    ideation: median(breakdowns.map((b) => b.ideation)),
    coding: median(breakdowns.map((b) => b.coding)),
    review: median(breakdowns.map((b) => b.review)),
    deploy: median(breakdowns.map((b) => b.deploy)),
  };

  return {
    median: median(cycleTimes),
    unit: 'days',
    breakdown: aggregatedBreakdown,
    sampleSize: cycleTimes.length,
  };
}
