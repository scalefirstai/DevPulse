export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${formatNumber(hours)}h`;
  const days = hours / 24;
  return `${formatNumber(days)}d`;
}

export function formatKpiValue(value: number, unit: string): string {
  switch (unit) {
    case 'days':
      return `${formatNumber(value)}d`;
    case 'hours':
      return formatDuration(value);
    case 'percent':
      return formatPercent(value);
    default:
      return formatNumber(value);
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function kpiLabel(kpiType: string): string {
  const labels: Record<string, string> = {
    cycle_time: 'Cycle Time',
    defect_escape: 'Defect Escape Rate',
    arch_drift: 'Architecture Drift',
    mttrc: 'MTTRC',
    rework: 'Rework',
  };
  return labels[kpiType] || kpiType;
}
