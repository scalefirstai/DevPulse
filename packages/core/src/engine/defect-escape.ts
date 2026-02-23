import {
  Defect,
  DefectEscapeResult,
  DefectBreakdownBySeverity,
  DefectBreakdownByCategory,
} from '../types/kpi.js';

export function calculateDefectEscapeRate(defects: Defect[]): DefectEscapeResult {
  const totalCount = defects.length;
  const escaped = defects.filter((d) => d.escaped);
  const escapedCount = escaped.length;
  const rate = totalCount === 0 ? 0 : (escapedCount / totalCount) * 100;

  const severityBreakdown: DefectBreakdownBySeverity = { critical: 0, major: 0, minor: 0 };
  for (const d of escaped) {
    if (d.severity in severityBreakdown) {
      severityBreakdown[d.severity]++;
    }
  }

  const categoryBreakdown: DefectBreakdownByCategory = {
    logic_error: 0,
    integration: 0,
    config_drift: 0,
    requirements_gap: 0,
  };
  for (const d of escaped) {
    const cat = d.category as keyof DefectBreakdownByCategory;
    if (cat && cat in categoryBreakdown) {
      categoryBreakdown[cat]++;
    }
  }

  return {
    rate,
    unit: 'percent',
    escapedCount,
    totalCount,
    severityBreakdown,
    categoryBreakdown,
  };
}
