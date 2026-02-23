import { PrEvent, ReworkResult, ReworkBreakdownByReason } from '../types/kpi.js';

export interface ReworkInput {
  prEvents: PrEvent[];
  windowDays?: number;
}

export function calculateRework(input: ReworkInput): ReworkResult {
  const { prEvents } = input;

  const mergedPrs = prEvents.filter((pr) => pr.mergedAt !== null);
  const totalPrs = mergedPrs.length;
  const reworkPrs = mergedPrs.filter((pr) => pr.isRework);
  const reworkCount = reworkPrs.length;

  const reworkPercent = totalPrs === 0 ? 0 : (reworkCount / totalPrs) * 100;

  const reasonBreakdown: ReworkBreakdownByReason = {
    bug_fix: 0,
    requirement_change: 0,
    refactor: 0,
    scope_creep: 0,
  };

  for (const pr of reworkPrs) {
    const reason = pr.reworkReason as keyof ReworkBreakdownByReason;
    if (reason && reason in reasonBreakdown) {
      reasonBreakdown[reason]++;
    }
  }

  return {
    reworkPercent,
    unit: 'percent',
    reworkPrs: reworkCount,
    totalPrs,
    reasonBreakdown,
  };
}
