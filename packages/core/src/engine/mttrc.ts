import { Incident, MttrcResult, MttrcBreakdownByMethod } from '../types/kpi.js';
import { median } from '../utils/statistics.js';
import { diffInHours } from '../utils/time.js';

export function calculateMttrc(incidents: Incident[]): MttrcResult {
  const withRootCause = incidents.filter((i) => i.rootCauseAt !== null);
  const withoutRootCause = incidents.filter((i) => i.rootCauseAt === null);

  const unknownRootCausePercent =
    incidents.length === 0 ? 0 : (withoutRootCause.length / incidents.length) * 100;

  const times = withRootCause.map((i) => diffInHours(i.detectedAt, i.rootCauseAt!));

  const methodBreakdown: MttrcBreakdownByMethod = {
    observability: 0,
    log_analysis: 0,
    code_review: 0,
    brute_force: 0,
  };

  for (const incident of withRootCause) {
    const method = incident.rootCauseMethod as keyof MttrcBreakdownByMethod;
    if (method && method in methodBreakdown) {
      methodBreakdown[method]++;
    }
  }

  return {
    median: median(times),
    unit: 'hours',
    unknownRootCausePercent,
    methodBreakdown,
    sampleSize: incidents.length,
  };
}
