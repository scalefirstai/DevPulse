export type CommitType = 'feature' | 'fix' | 'refactor' | 'rework' | 'chore' | 'docs' | 'test';

export interface ClassifiedCommit {
  sha: string;
  message: string;
  type: CommitType;
  author: string;
  date: Date;
}

interface RawCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
}

const PATTERNS: { type: CommitType; patterns: RegExp[] }[] = [
  {
    type: 'fix',
    patterns: [/^fix[:(]/, /^bugfix[:(]/, /^hotfix[:(]/, /^patch[:(]/],
  },
  {
    type: 'feature',
    patterns: [/^feat[:(]/, /^feature[:(]/, /^add[:(]/],
  },
  {
    type: 'refactor',
    patterns: [/^refactor[:(]/, /^cleanup[:(]/, /^restructure[:(]/],
  },
  {
    type: 'docs',
    patterns: [/^docs?[:(]/, /^readme[:(]/],
  },
  {
    type: 'test',
    patterns: [/^test[:(]/, /^tests?[:(]/, /^spec[:(]/],
  },
  {
    type: 'chore',
    patterns: [/^chore[:(]/, /^ci[:(]/, /^build[:(]/, /^deps?[:(]/],
  },
];

export class CommitClassifier {
  classify(commits: RawCommit[]): ClassifiedCommit[] {
    return commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0],
      type: this.classifyMessage(commit.commit.message),
      author: commit.commit.author.name,
      date: new Date(commit.commit.author.date),
    }));
  }

  classifyMessage(message: string): CommitType {
    const firstLine = message.split('\n')[0].toLowerCase().trim();

    for (const { type, patterns } of PATTERNS) {
      if (patterns.some((p) => p.test(firstLine))) {
        return type;
      }
    }

    // Heuristic fallbacks
    if (firstLine.includes('revert')) return 'rework';
    if (firstLine.includes('fix') || firstLine.includes('bug')) return 'fix';
    if (firstLine.includes('refactor') || firstLine.includes('clean')) return 'refactor';
    if (firstLine.includes('test') || firstLine.includes('spec')) return 'test';
    if (firstLine.includes('doc') || firstLine.includes('readme')) return 'docs';

    return 'feature'; // default
  }

  summarize(classified: ClassifiedCommit[]): Record<CommitType, number> {
    const summary: Record<CommitType, number> = {
      feature: 0,
      fix: 0,
      refactor: 0,
      rework: 0,
      chore: 0,
      docs: 0,
      test: 0,
    };

    for (const commit of classified) {
      summary[commit.type]++;
    }

    return summary;
  }
}
