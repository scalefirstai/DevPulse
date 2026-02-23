import { describe, it, expect } from 'vitest';
import { CommitClassifier } from '../src/github/commit-classifier.js';
import { ReworkDetector } from '../src/github/rework-detector.js';
import { PrEvent } from '@devpulse/core';

function makePr(overrides: Partial<PrEvent> = {}): PrEvent {
  return {
    id: '',
    teamId: 'team-1',
    externalId: '1',
    title: 'Add feature',
    author: 'dev',
    createdAt: new Date('2024-01-01'),
    firstCommitAt: new Date('2024-01-01'),
    firstReviewAt: null,
    approvedAt: null,
    mergedAt: new Date('2024-01-05'),
    deployedAt: null,
    isRework: false,
    reworkReason: null,
    filesChanged: 3,
    additions: 100,
    deletions: 20,
    labels: [],
    ...overrides,
  };
}

describe('CommitClassifier', () => {
  const classifier = new CommitClassifier();

  it('classifies conventional commit prefixes', () => {
    expect(classifier.classifyMessage('feat: add new feature')).toBe('feature');
    expect(classifier.classifyMessage('fix: resolve bug')).toBe('fix');
    expect(classifier.classifyMessage('refactor: cleanup code')).toBe('refactor');
    expect(classifier.classifyMessage('docs: update README')).toBe('docs');
    expect(classifier.classifyMessage('test: add unit tests')).toBe('test');
    expect(classifier.classifyMessage('chore: update deps')).toBe('chore');
  });

  it('classifies with parenthetical scope', () => {
    expect(classifier.classifyMessage('feat(auth): add login')).toBe('feature');
    expect(classifier.classifyMessage('fix(api): handle timeout')).toBe('fix');
  });

  it('falls back to heuristic matching', () => {
    expect(classifier.classifyMessage('Revert "bad change"')).toBe('rework');
    expect(classifier.classifyMessage('Fix null pointer in handler')).toBe('fix');
    expect(classifier.classifyMessage('Refactored the parser module')).toBe('refactor');
  });

  it('defaults to feature for unknown messages', () => {
    expect(classifier.classifyMessage('implement new dashboard')).toBe('feature');
  });

  it('summarizes commit types', () => {
    const commits = classifier.classify([
      { sha: 'a', commit: { message: 'feat: add X', author: { name: 'dev', date: '2024-01-01' } } },
      { sha: 'b', commit: { message: 'fix: bug Y', author: { name: 'dev', date: '2024-01-02' } } },
      { sha: 'c', commit: { message: 'feat: add Z', author: { name: 'dev', date: '2024-01-03' } } },
    ]);
    const summary = classifier.summarize(commits);
    expect(summary.feature).toBe(2);
    expect(summary.fix).toBe(1);
  });
});

describe('ReworkDetector', () => {
  it('detects rework when same file changed within window', () => {
    const detector = new ReworkDetector({ windowDays: 21 });
    const prs = [
      makePr({ externalId: '1', mergedAt: new Date('2024-01-05') }),
      makePr({ externalId: '2', mergedAt: new Date('2024-01-15'), title: 'Fix login bug', labels: ['bug'] }),
    ];
    const filesByPr = new Map([
      ['1', ['src/auth.ts', 'src/login.ts']],
      ['2', ['src/auth.ts']],
    ]);

    const result = detector.detectRework(prs, filesByPr);
    expect(result[0].isRework).toBe(false);
    expect(result[1].isRework).toBe(true);
    expect(result[1].reworkReason).toBe('bug_fix');
  });

  it('does not flag rework outside the window', () => {
    const detector = new ReworkDetector({ windowDays: 7 });
    const prs = [
      makePr({ externalId: '1', mergedAt: new Date('2024-01-01') }),
      makePr({ externalId: '2', mergedAt: new Date('2024-02-01') }),
    ];
    const filesByPr = new Map([
      ['1', ['src/auth.ts']],
      ['2', ['src/auth.ts']],
    ]);

    const result = detector.detectRework(prs, filesByPr);
    expect(result[1].isRework).toBe(false);
  });

  it('classifies refactor rework reason', () => {
    const detector = new ReworkDetector();
    const prs = [
      makePr({ externalId: '1', mergedAt: new Date('2024-01-01') }),
      makePr({ externalId: '2', mergedAt: new Date('2024-01-10'), title: 'Refactor auth module', labels: ['refactor'] }),
    ];
    const filesByPr = new Map([
      ['1', ['src/auth.ts']],
      ['2', ['src/auth.ts']],
    ]);

    const result = detector.detectRework(prs, filesByPr);
    expect(result[1].reworkReason).toBe('refactor');
  });

  it('classifies scope_creep rework reason', () => {
    const detector = new ReworkDetector();
    const prs = [
      makePr({ externalId: '1', mergedAt: new Date('2024-01-01') }),
      makePr({ externalId: '2', mergedAt: new Date('2024-01-10'), title: 'Extend login with SSO', labels: ['scope'] }),
    ];
    const filesByPr = new Map([
      ['1', ['src/login.ts']],
      ['2', ['src/login.ts']],
    ]);

    const result = detector.detectRework(prs, filesByPr);
    expect(result[1].reworkReason).toBe('scope_creep');
  });

  it('handles PRs with no files', () => {
    const detector = new ReworkDetector();
    const prs = [makePr({ externalId: '1' })];
    const filesByPr = new Map<string, string[]>();

    const result = detector.detectRework(prs, filesByPr);
    expect(result[0].isRework).toBe(false);
  });
});
