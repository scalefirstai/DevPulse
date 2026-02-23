import { ArchViolation } from '@devpulse/core';

interface DependencyNode {
  name: string;
  dependencies: Set<string>;
  dependents: Set<string>;
}

export interface DriftAnalysis {
  totalRules: number;
  activeViolations: number;
  driftPercent: number;
  hotspots: { component: string; violationCount: number }[];
  cycles: string[][];
}

export class DependencyAnalyzer {
  private graph: Map<string, DependencyNode> = new Map();

  buildGraph(violations: ArchViolation[]): void {
    this.graph.clear();

    for (const v of violations) {
      if (!v.resolvedAt) {
        this.addEdge(v.sourceComponent, v.targetComponent);
      }
    }
  }

  analyzeDrift(violations: ArchViolation[], totalRules: number): DriftAnalysis {
    this.buildGraph(violations);

    const activeViolations = violations.filter((v) => !v.resolvedAt).length;
    const driftPercent = totalRules > 0 ? (activeViolations / totalRules) * 100 : 0;

    const hotspots = this.findHotspots(violations);
    const cycles = this.detectCycles();

    return {
      totalRules,
      activeViolations,
      driftPercent: parseFloat(driftPercent.toFixed(2)),
      hotspots,
      cycles,
    };
  }

  private addEdge(source: string, target: string): void {
    if (!this.graph.has(source)) {
      this.graph.set(source, { name: source, dependencies: new Set(), dependents: new Set() });
    }
    if (!this.graph.has(target)) {
      this.graph.set(target, { name: target, dependencies: new Set(), dependents: new Set() });
    }
    this.graph.get(source)!.dependencies.add(target);
    this.graph.get(target)!.dependents.add(source);
  }

  private findHotspots(violations: ArchViolation[]): { component: string; violationCount: number }[] {
    const counts = new Map<string, number>();
    for (const v of violations.filter((v) => !v.resolvedAt)) {
      counts.set(v.sourceComponent, (counts.get(v.sourceComponent) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([component, violationCount]) => ({ component, violationCount }))
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, 10);
  }

  private detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (stack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }
      if (visited.has(node)) return;

      visited.add(node);
      stack.add(node);
      path.push(node);

      const deps = this.graph.get(node)?.dependencies || new Set();
      for (const dep of deps) {
        dfs(dep, [...path]);
      }

      stack.delete(node);
    };

    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }
}
