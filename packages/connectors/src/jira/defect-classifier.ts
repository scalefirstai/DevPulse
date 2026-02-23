import { JiraIssueRaw } from './jira-connector.js';

export type DefectCategory =
  | 'logic_error'
  | 'integration'
  | 'config_drift'
  | 'requirements_gap'
  | 'unknown';

export interface ClassifiedDefect {
  issueKey: string;
  category: DefectCategory;
  confidence: number; // 0-1
  signals: string[];
}

interface ClassificationRule {
  category: DefectCategory;
  labelPatterns: RegExp[];
  summaryPatterns: RegExp[];
  componentPatterns: RegExp[];
  weight: number;
}

const CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    category: 'logic_error',
    labelPatterns: [/logic[_-]?error/i, /incorrect[_-]?behavior/i, /wrong[_-]?result/i],
    summaryPatterns: [/incorrect/i, /wrong/i, /miscalculat/i, /off[_-]?by[_-]?one/i, /null\s?pointer/i, /npe/i],
    componentPatterns: [],
    weight: 1.0,
  },
  {
    category: 'integration',
    labelPatterns: [/integration/i, /api[_-]?error/i, /external[_-]?service/i],
    summaryPatterns: [/integration/i, /api\s/i, /timeout/i, /connection/i, /third[_-]?party/i, /upstream/i],
    componentPatterns: [/api/i, /gateway/i, /client/i, /integration/i],
    weight: 1.0,
  },
  {
    category: 'config_drift',
    labelPatterns: [/config/i, /environment/i, /infra/i],
    summaryPatterns: [/config/i, /environment/i, /deploy/i, /infra/i, /permission/i, /secret/i, /variable/i],
    componentPatterns: [/infra/i, /config/i, /deploy/i, /ops/i],
    weight: 0.8,
  },
  {
    category: 'requirements_gap',
    labelPatterns: [/requirement/i, /spec[_-]?gap/i, /missing[_-]?spec/i],
    summaryPatterns: [/requirement/i, /spec\b/i, /not\s+documented/i, /edge\s+case/i, /unexpected\s+behavior/i, /should\s+have/i],
    componentPatterns: [],
    weight: 0.7,
  },
];

export class DefectClassifier {
  classify(issue: JiraIssueRaw): ClassifiedDefect {
    const scores = new Map<DefectCategory, { score: number; signals: string[] }>();

    for (const rule of CLASSIFICATION_RULES) {
      const signals: string[] = [];
      let score = 0;

      // Check labels
      for (const label of issue.fields.labels) {
        for (const pattern of rule.labelPatterns) {
          if (pattern.test(label)) {
            score += 2 * rule.weight;
            signals.push(`label:${label}`);
          }
        }
      }

      // Check summary
      for (const pattern of rule.summaryPatterns) {
        if (pattern.test(issue.fields.summary)) {
          score += 1 * rule.weight;
          signals.push(`summary:${pattern.source}`);
        }
      }

      // Check components
      for (const component of issue.fields.components) {
        for (const pattern of rule.componentPatterns) {
          if (pattern.test(component.name)) {
            score += 1.5 * rule.weight;
            signals.push(`component:${component.name}`);
          }
        }
      }

      if (score > 0) {
        scores.set(rule.category, { score, signals });
      }
    }

    if (scores.size === 0) {
      return {
        issueKey: issue.key,
        category: 'unknown',
        confidence: 0,
        signals: [],
      };
    }

    // Pick the highest-scoring category
    let bestCategory: DefectCategory = 'unknown';
    let bestScore = 0;
    let bestSignals: string[] = [];

    for (const [category, { score, signals }] of scores) {
      if (score > bestScore) {
        bestCategory = category;
        bestScore = score;
        bestSignals = signals;
      }
    }

    // Normalize confidence to 0-1
    const maxPossible = 10;
    const confidence = Math.min(bestScore / maxPossible, 1);

    return {
      issueKey: issue.key,
      category: bestCategory,
      confidence: Math.round(confidence * 100) / 100,
      signals: bestSignals,
    };
  }

  classifyBatch(issues: JiraIssueRaw[]): ClassifiedDefect[] {
    return issues.map((issue) => this.classify(issue));
  }

  summarize(classifications: ClassifiedDefect[]): Record<DefectCategory, number> {
    const counts: Record<DefectCategory, number> = {
      logic_error: 0,
      integration: 0,
      config_drift: 0,
      requirements_gap: 0,
      unknown: 0,
    };

    for (const c of classifications) {
      counts[c.category]++;
    }

    return counts;
  }
}
