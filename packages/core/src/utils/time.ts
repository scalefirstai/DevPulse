const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export function diffInDays(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / MS_PER_DAY;
}

export function diffInHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / MS_PER_HOUR;
}

export function daysAgo(days: number, from: Date = new Date()): Date {
  return new Date(from.getTime() - days * MS_PER_DAY);
}

export function periodBoundaries(
  range: string,
  from: Date = new Date(),
): { start: Date; end: Date } {
  const match = range.match(/^(\d+)d$/);
  if (!match) {
    throw new Error(`Invalid range format: ${range}. Expected format: <number>d (e.g., 90d)`);
  }
  const days = parseInt(match[1], 10);
  return {
    start: daysAgo(days, from),
    end: from,
  };
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}
