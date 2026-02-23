import { describe, it, expect } from 'vitest';
import { calculateArchDrift, ArchDriftInput } from '../src/engine/arch-drift';
import { ArchViolation } from '../src/types/kpi';

function makeViolation(overrides: Partial<ArchViolation> = {}): ArchViolation {
  return {
    id: 'v-1',
    teamId: 'team-1',
    ruleName: 'no-circular-deps',
    violationType: 'dependency',
    sourceComponent: 'moduleA',
    targetComponent: 'moduleB',
    filePath: 'src/moduleA/index.ts',
    firstDetectedAt: new Date('2025-01-01T00:00:00Z'),
    resolvedAt: null,
    scanSource: 'archunit',
    ...overrides,
  };
}

describe('calculateArchDrift', () => {
  it('should calculate drift percentage: 5 active violations / 50 rules = 10%', () => {
    const ruleNames = Array.from({ length: 50 }, (_, i) => `rule-${i}`);
    const violations: ArchViolation[] = ruleNames.map((ruleName, i) =>
      makeViolation({
        id: `v-${i}`,
        ruleName,
        // first 5 are active (resolvedAt = null), rest are resolved
        resolvedAt: i < 5 ? null : new Date('2025-02-01T00:00:00Z'),
      }),
    );

    const input: ArchDriftInput = { violations };
    const result = calculateArchDrift(input);

    expect(result.driftPercent).toBe(10);
    expect(result.unit).toBe('percent');
    expect(result.activeViolations).toBe(5);
    expect(result.totalRules).toBe(50);
  });

  it('should calculate velocity: previousActiveViolations=3, currentActive=5 => accelerating (+66.7%)', () => {
    // 5 active violations across 5 unique rules
    const violations: ArchViolation[] = Array.from({ length: 5 }, (_, i) =>
      makeViolation({
        id: `v-${i}`,
        ruleName: `rule-${i}`,
        resolvedAt: null,
      }),
    );

    const input: ArchDriftInput = {
      violations,
      previousActiveViolations: 3,
    };
    const result = calculateArchDrift(input);

    expect(result.activeViolations).toBe(5);
    expect(result.velocity).toBeCloseTo(66.67, 1);
    expect(result.velocityLabel).toBe('accelerating');
  });

  it('should return 0% drift and stable velocity for empty violations', () => {
    const input: ArchDriftInput = { violations: [] };
    const result = calculateArchDrift(input);

    expect(result.driftPercent).toBe(0);
    expect(result.activeViolations).toBe(0);
    expect(result.totalRules).toBe(0);
    expect(result.velocity).toBe(0);
    expect(result.velocityLabel).toBe('stable');
  });

  it('should report decelerating velocity when violations decrease', () => {
    // 2 active violations
    const violations: ArchViolation[] = [
      makeViolation({ id: 'v-0', ruleName: 'rule-0', resolvedAt: null }),
      makeViolation({ id: 'v-1', ruleName: 'rule-1', resolvedAt: null }),
      makeViolation({
        id: 'v-2',
        ruleName: 'rule-2',
        resolvedAt: new Date('2025-02-01T00:00:00Z'),
      }),
    ];

    const result = calculateArchDrift({
      violations,
      previousActiveViolations: 5,
    });

    // velocity: (2 - 5) / 5 * 100 = -60%
    expect(result.velocity).toBeCloseTo(-60, 1);
    expect(result.velocityLabel).toBe('decelerating');
  });

  it('should report stable velocity when change is within threshold', () => {
    // 10 active violations with previous 10 => 0% change
    const violations: ArchViolation[] = Array.from({ length: 10 }, (_, i) =>
      makeViolation({
        id: `v-${i}`,
        ruleName: `rule-${i}`,
        resolvedAt: null,
      }),
    );

    const result = calculateArchDrift({
      violations,
      previousActiveViolations: 10,
    });

    expect(result.velocity).toBe(0);
    expect(result.velocityLabel).toBe('stable');
  });
});
