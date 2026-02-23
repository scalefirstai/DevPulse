import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { OrgConfig, DEFAULT_THRESHOLDS } from '@devpulse/core';

const CONFIG_PATHS = ['devpulse.config.yaml', 'devpulse.config.yml'];

function substituteEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_match, envVar) => {
    const envValue = process.env[envVar];
    if (envValue === undefined) {
      console.warn(`Warning: Environment variable ${envVar} is not set`);
      return '';
    }
    return envValue;
  });
}

function processObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return substituteEnvVars(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(processObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = processObject(value);
    }
    return result;
  }
  return obj;
}

const DEFAULT_CONFIG: OrgConfig = {
  name: 'DevPulse Demo',
  connectors: {},
  collection: { schedule: '0 2 * * *', lookbackDays: 90 },
  rework: { windowDays: 21 },
  thresholds: DEFAULT_THRESHOLDS,
  dashboard: { refreshInterval: 300, defaultRange: '90d', anonymizeContributors: false },
};

export function loadConfig(basePath: string = process.cwd()): OrgConfig {
  for (const configPath of CONFIG_PATHS) {
    const fullPath = path.resolve(basePath, configPath);
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const parsed = yaml.load(raw) as Record<string, unknown>;
      const processed = processObject(parsed) as Partial<OrgConfig>;
      return { ...DEFAULT_CONFIG, ...processed };
    }
  }
  console.log('No config file found. Starting in demo mode with defaults.');
  return DEFAULT_CONFIG;
}
