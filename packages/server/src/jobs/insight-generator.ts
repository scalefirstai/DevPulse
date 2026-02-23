import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '../config/queues.js';
import { query } from '../config/database.js';
import { KpiType } from '@devpulse/core';
import {
  detectCorrelations,
  detectAnomalies,
  detectHotspots,
} from './insight-detectors.js';

export function startInsightGenerator(): Worker {
  const connection = getRedisConnection();

  const worker = new Worker(
    QUEUE_NAMES.INSIGHT_GENERATION,
    async (job: Job) => {
      console.log(`[insight-generator] Starting insight generation job ${job.id}`);

      const teams = await query<{ id: string; slug: string; name: string }>(
        'SELECT id, slug, name FROM teams ORDER BY name',
      );

      if (teams.rows.length === 0) {
        console.log('[insight-generator] No teams, skipping');
        return { insightsGenerated: 0 };
      }

      const kpiTypes = Object.values(KpiType);
      let insightsGenerated = 0;

      // 1. Correlation detection across all KPI pairs (org-wide)
      const correlationInsights = await detectCorrelations(kpiTypes, teams.rows);
      for (const insight of correlationInsights) {
        await upsertInsight(insight);
        insightsGenerated++;
      }

      // 2. Anomaly detection per team per KPI
      for (const team of teams.rows) {
        for (const kpiType of kpiTypes) {
          const anomalyInsights = await detectAnomalies(team, kpiType);
          for (const insight of anomalyInsights) {
            await upsertInsight(insight);
            insightsGenerated++;
          }
        }
      }

      // 3. Hotspot detection (team vs org average)
      for (const kpiType of kpiTypes) {
        const hotspotInsights = await detectHotspots(teams.rows, kpiType);
        for (const insight of hotspotInsights) {
          await upsertInsight(insight);
          insightsGenerated++;
        }
      }

      console.log(`[insight-generator] Generated ${insightsGenerated} insights`);
      return { insightsGenerated };
    },
    {
      connection: connection as any,
      concurrency: 1,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[insight-generator] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

interface InsightInput {
  teamId: string | null;
  insightType: string;
  severity: string;
  title: string;
  description: string;
  kpisInvolved: string[];
  data: Record<string, unknown>;
}

async function upsertInsight(insight: InsightInput): Promise<void> {
  await query(
    `INSERT INTO insights (team_id, insight_type, severity, title, description, kpis_involved, data)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT DO NOTHING`,
    [
      insight.teamId,
      insight.insightType,
      insight.severity,
      insight.title,
      insight.description,
      insight.kpisInvolved,
      JSON.stringify(insight.data),
    ],
  );
}
