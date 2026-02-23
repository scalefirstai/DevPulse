import { PrEvent } from '@devpulse/core';

export interface ReworkDetectorConfig {
  windowDays: number; // default 21
}

const DEFAULT_CONFIG: ReworkDetectorConfig = { windowDays: 21 };

interface FileChangeInfo {
  prExternalId: string;
  mergedAt: Date;
  files: string[];
}

export class ReworkDetector {
  private config: ReworkDetectorConfig;

  constructor(config?: Partial<ReworkDetectorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  detectRework(prs: PrEvent[], filesByPr: Map<string, string[]>): PrEvent[] {
    const fileChanges = this.buildFileChangeTimeline(prs, filesByPr);
    const windowMs = this.config.windowDays * 24 * 60 * 60 * 1000;

    return prs.map((pr) => {
      const prFiles = filesByPr.get(pr.externalId) || [];
      const prMergedAt = pr.mergedAt?.getTime() ?? 0;

      const isRework = prFiles.some((file) => {
        const previousChanges = fileChanges.filter(
          (fc) =>
            fc.prExternalId !== pr.externalId &&
            fc.files.includes(file) &&
            fc.mergedAt.getTime() < prMergedAt &&
            prMergedAt - fc.mergedAt.getTime() < windowMs,
        );
        return previousChanges.length > 0;
      });

      if (!isRework) return pr;

      const reason = this.classifyReworkReason(pr);
      return { ...pr, isRework: true, reworkReason: reason };
    });
  }

  private buildFileChangeTimeline(
    prs: PrEvent[],
    filesByPr: Map<string, string[]>,
  ): FileChangeInfo[] {
    return prs
      .filter((pr) => pr.mergedAt !== null)
      .map((pr) => ({
        prExternalId: pr.externalId,
        mergedAt: pr.mergedAt!,
        files: filesByPr.get(pr.externalId) || [],
      }))
      .sort((a, b) => a.mergedAt.getTime() - b.mergedAt.getTime());
  }

  private classifyReworkReason(pr: PrEvent): string {
    const title = pr.title.toLowerCase();
    const labels = pr.labels.map((l) => l.toLowerCase());

    if (labels.includes('bug') || title.includes('fix') || title.includes('bugfix')) {
      return 'bug_fix';
    }
    if (labels.includes('refactor') || title.includes('refactor') || title.includes('cleanup')) {
      return 'refactor';
    }
    if (
      labels.includes('scope') ||
      title.includes('scope') ||
      title.includes('additional') ||
      title.includes('extend')
    ) {
      return 'scope_creep';
    }
    if (
      labels.includes('requirements') ||
      title.includes('requirement') ||
      title.includes('spec change')
    ) {
      return 'requirement_change';
    }

    return 'bug_fix'; // default assumption
  }
}
