import { KpiType } from './kpi.js';

export interface ThresholdConfig {
  eliteMax: number;
  strongMax: number;
  moderateMax: number;
}

export type ThresholdMap = Record<KpiType, ThresholdConfig>;

export const DEFAULT_THRESHOLDS: ThresholdMap = {
  [KpiType.CycleTime]: { eliteMax: 1, strongMax: 3, moderateMax: 14 },
  [KpiType.DefectEscape]: { eliteMax: 5, strongMax: 10, moderateMax: 20 },
  [KpiType.ArchDrift]: { eliteMax: 2, strongMax: 5, moderateMax: 15 },
  [KpiType.Mttrc]: { eliteMax: 1, strongMax: 4, moderateMax: 24 },
  [KpiType.Rework]: { eliteMax: 10, strongMax: 20, moderateMax: 35 },
};

export interface TeamConfig {
  id: string;
  name: string;
  slug: string;
  metadata: Record<string, unknown>;
}

export interface ConnectorConfig {
  enabled: boolean;
  type: string;
  config: Record<string, unknown>;
}

export interface CollectionConfig {
  schedule: string;
  lookbackDays: number;
}

export interface ReworkConfig {
  windowDays: number;
}

export interface DashboardConfig {
  refreshInterval: number;
  defaultRange: string;
  anonymizeContributors: boolean;
}

export interface OrgConfig {
  name: string;
  connectors: Record<string, ConnectorConfig>;
  collection: CollectionConfig;
  rework: ReworkConfig;
  thresholds: ThresholdMap;
  dashboard: DashboardConfig;
}
