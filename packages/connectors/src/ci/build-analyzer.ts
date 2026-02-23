import { CiBuild } from './github-actions-connector.js';

export interface BuildAnalysisSummary {
  totalBuilds: number;
  successRate: number; // 0-100
  avgDurationMs: number | null;
  p50DurationMs: number | null;
  p95DurationMs: number | null;
  failuresByPipeline: Record<string, number>;
  buildsByTrigger: Record<string, number>;
  flakyPipelines: string[];
  slowestPipelines: { pipeline: string; avgDurationMs: number }[];
}

export interface BuildTrend {
  date: string; // YYYY-MM-DD
  successCount: number;
  failureCount: number;
  successRate: number;
  avgDurationMs: number | null;
}

export class BuildAnalyzer {
  summarize(builds: CiBuild[]): BuildAnalysisSummary {
    const completed = builds.filter((b) => b.status !== 'running');
    const successful = completed.filter((b) => b.status === 'success');

    const durations = completed
      .map((b) => b.durationMs)
      .filter((d): d is number => d !== null)
      .sort((a, b) => a - b);

    // Group failures by pipeline
    const failuresByPipeline: Record<string, number> = {};
    for (const build of completed.filter((b) => b.status === 'failure')) {
      failuresByPipeline[build.pipeline] = (failuresByPipeline[build.pipeline] ?? 0) + 1;
    }

    // Group builds by trigger
    const buildsByTrigger: Record<string, number> = {};
    for (const build of builds) {
      const trigger = build.trigger || 'unknown';
      buildsByTrigger[trigger] = (buildsByTrigger[trigger] ?? 0) + 1;
    }

    // Detect flaky pipelines (pass rate between 50-90% with enough samples)
    const pipelineStats = this.getPipelineStats(completed);
    const flakyPipelines = Object.entries(pipelineStats)
      .filter(([, stats]) => stats.total >= 5 && stats.successRate >= 50 && stats.successRate < 90)
      .map(([pipeline]) => pipeline);

    // Slowest pipelines by average duration
    const slowestPipelines = Object.entries(pipelineStats)
      .filter(([, stats]) => stats.avgDurationMs !== null)
      .map(([pipeline, stats]) => ({ pipeline, avgDurationMs: stats.avgDurationMs! }))
      .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
      .slice(0, 5);

    return {
      totalBuilds: builds.length,
      successRate: completed.length > 0
        ? Math.round((successful.length / completed.length) * 100 * 100) / 100
        : 0,
      avgDurationMs: this.average(durations),
      p50DurationMs: this.percentile(durations, 50),
      p95DurationMs: this.percentile(durations, 95),
      failuresByPipeline,
      buildsByTrigger,
      flakyPipelines,
      slowestPipelines,
    };
  }

  trends(builds: CiBuild[], days: number = 30): BuildTrend[] {
    const completed = builds.filter((b) => b.status !== 'running');
    const byDate = new Map<string, CiBuild[]>();

    for (const build of completed) {
      const date = build.startedAt.toISOString().slice(0, 10);
      const existing = byDate.get(date) ?? [];
      existing.push(build);
      byDate.set(date, existing);
    }

    const trends: BuildTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayBuilds = byDate.get(dateStr) ?? [];

      const successes = dayBuilds.filter((b) => b.status === 'success').length;
      const failures = dayBuilds.filter((b) => b.status === 'failure').length;
      const total = successes + failures;

      const durations = dayBuilds
        .map((b) => b.durationMs)
        .filter((d): d is number => d !== null);

      trends.push({
        date: dateStr,
        successCount: successes,
        failureCount: failures,
        successRate: total > 0 ? Math.round((successes / total) * 100 * 100) / 100 : 0,
        avgDurationMs: this.average(durations),
      });
    }

    return trends;
  }

  private getPipelineStats(
    builds: CiBuild[],
  ): Record<string, { total: number; successRate: number; avgDurationMs: number | null }> {
    const grouped = new Map<string, CiBuild[]>();

    for (const build of builds) {
      const existing = grouped.get(build.pipeline) ?? [];
      existing.push(build);
      grouped.set(build.pipeline, existing);
    }

    const stats: Record<string, { total: number; successRate: number; avgDurationMs: number | null }> = {};

    for (const [pipeline, pipelineBuilds] of grouped) {
      const successes = pipelineBuilds.filter((b) => b.status === 'success').length;
      const durations = pipelineBuilds
        .map((b) => b.durationMs)
        .filter((d): d is number => d !== null);

      stats[pipeline] = {
        total: pipelineBuilds.length,
        successRate: Math.round((successes / pipelineBuilds.length) * 100 * 100) / 100,
        avgDurationMs: this.average(durations),
      };
    }

    return stats;
  }

  private average(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / values.length);
  }

  private percentile(sorted: number[], p: number): number | null {
    if (sorted.length === 0) return null;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}
