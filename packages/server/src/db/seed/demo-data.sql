-- DevPulse Demo Data
-- 4 teams with 6 months of realistic KPI data

-- Teams
INSERT INTO teams (id, name, slug, metadata) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Platform', 'platform', '{"department": "engineering", "size": 8}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Payments', 'payments', '{"department": "engineering", "size": 6}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Identity', 'identity', '{"department": "engineering", "size": 5}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Data Engineering', 'data-engineering', '{"department": "engineering", "size": 7}')
ON CONFLICT (slug) DO NOTHING;

-- KPI Snapshots: 6 months of data per team (monthly periods)
-- Platform team: Strong overall, improving cycle time
INSERT INTO kpi_snapshots (team_id, kpi_type, value, unit, period_start, period_end, breakdown) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 5.2, 'days', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"ideation":1.2,"coding":2.0,"review":1.0,"deploy":1.0}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 4.8, 'days', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"ideation":1.0,"coding":1.8,"review":1.0,"deploy":1.0}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 4.5, 'days', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"ideation":1.0,"coding":1.7,"review":0.9,"deploy":0.9}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 4.1, 'days', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"ideation":0.9,"coding":1.5,"review":0.8,"deploy":0.9}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 3.8, 'days', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"ideation":0.8,"coding":1.4,"review":0.8,"deploy":0.8}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'cycle_time', 3.5, 'days', NOW() - INTERVAL '1 month', NOW(), '{"ideation":0.7,"coding":1.3,"review":0.7,"deploy":0.8}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 4.2, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"escapedCount":3,"totalCount":71}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 3.8, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"escapedCount":2,"totalCount":53}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 3.5, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"escapedCount":2,"totalCount":57}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 3.1, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"escapedCount":2,"totalCount":65}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 2.9, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"escapedCount":2,"totalCount":69}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'defect_escape', 2.5, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"escapedCount":1,"totalCount":40}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 3.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"activeViolations":6,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 2.8, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"activeViolations":5,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 2.5, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"activeViolations":5,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 2.3, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"activeViolations":4,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 2.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"activeViolations":4,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'arch_drift', 1.8, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"activeViolations":3,"totalRules":200}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 3.5, 'hours', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"unknownRootCausePercent":10,"sampleSize":4}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 3.2, 'hours', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"unknownRootCausePercent":8,"sampleSize":3}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 3.0, 'hours', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"unknownRootCausePercent":5,"sampleSize":5}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 2.8, 'hours', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"unknownRootCausePercent":5,"sampleSize":3}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 2.5, 'hours', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"unknownRootCausePercent":3,"sampleSize":4}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'mttrc', 2.3, 'hours', NOW() - INTERVAL '1 month', NOW(), '{"unknownRootCausePercent":2,"sampleSize":3}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 12.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"reworkPrs":6,"totalPrs":50}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 11.5, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"reworkPrs":5,"totalPrs":43}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 10.8, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"reworkPrs":5,"totalPrs":46}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 10.0, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"reworkPrs":5,"totalPrs":50}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 9.5, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"reworkPrs":4,"totalPrs":42}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'rework', 8.8, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"reworkPrs":4,"totalPrs":45}');

-- Payments team: Elite in most KPIs
INSERT INTO kpi_snapshots (team_id, kpi_type, value, unit, period_start, period_end, breakdown) VALUES
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.8, 'days', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"ideation":0.5,"coding":1.2,"review":0.6,"deploy":0.5}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.6, 'days', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"ideation":0.5,"coding":1.1,"review":0.5,"deploy":0.5}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.5, 'days', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"ideation":0.4,"coding":1.0,"review":0.6,"deploy":0.5}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.3, 'days', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"ideation":0.4,"coding":1.0,"review":0.5,"deploy":0.4}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.1, 'days', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"ideation":0.4,"coding":0.9,"review":0.4,"deploy":0.4}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'cycle_time', 2.0, 'days', NOW() - INTERVAL '1 month', NOW(), '{"ideation":0.3,"coding":0.9,"review":0.4,"deploy":0.4}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 1.5, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"escapedCount":1,"totalCount":67}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 1.3, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"escapedCount":1,"totalCount":77}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 1.2, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"escapedCount":1,"totalCount":83}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 1.0, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"escapedCount":1,"totalCount":100}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 0.8, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"escapedCount":0,"totalCount":62}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'defect_escape', 0.9, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"escapedCount":1,"totalCount":111}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 1.5, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"activeViolations":3,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 1.5, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"activeViolations":3,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 1.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"activeViolations":2,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 1.0, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"activeViolations":2,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 0.5, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"activeViolations":1,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'arch_drift', 0.5, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"activeViolations":1,"totalRules":200}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.8, 'hours', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"unknownRootCausePercent":5,"sampleSize":4}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.6, 'hours', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"unknownRootCausePercent":3,"sampleSize":3}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.5, 'hours', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"unknownRootCausePercent":2,"sampleSize":5}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.4, 'hours', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"unknownRootCausePercent":0,"sampleSize":4}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.3, 'hours', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"unknownRootCausePercent":0,"sampleSize":3}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'mttrc', 1.2, 'hours', NOW() - INTERVAL '1 month', NOW(), '{"unknownRootCausePercent":0,"sampleSize":2}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 6.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"reworkPrs":3,"totalPrs":50}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 5.5, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"reworkPrs":3,"totalPrs":55}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 5.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"reworkPrs":2,"totalPrs":40}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 4.8, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"reworkPrs":2,"totalPrs":42}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 4.5, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"reworkPrs":2,"totalPrs":44}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'rework', 4.2, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"reworkPrs":2,"totalPrs":48}');

-- Identity team: Moderate with rework hotspot
INSERT INTO kpi_snapshots (team_id, kpi_type, value, unit, period_start, period_end, breakdown) VALUES
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 8.5, 'days', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"ideation":2.0,"coding":3.5,"review":1.5,"deploy":1.5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 8.0, 'days', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"ideation":1.8,"coding":3.2,"review":1.5,"deploy":1.5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 7.8, 'days', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"ideation":1.8,"coding":3.0,"review":1.5,"deploy":1.5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 7.5, 'days', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"ideation":1.5,"coding":3.0,"review":1.5,"deploy":1.5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 7.2, 'days', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"ideation":1.5,"coding":2.8,"review":1.4,"deploy":1.5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'cycle_time', 7.0, 'days', NOW() - INTERVAL '1 month', NOW(), '{"ideation":1.5,"coding":2.8,"review":1.3,"deploy":1.4}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 6.5, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"escapedCount":5,"totalCount":77}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 6.8, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"escapedCount":5,"totalCount":74}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 7.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"escapedCount":6,"totalCount":86}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 6.5, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"escapedCount":5,"totalCount":77}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 6.2, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"escapedCount":4,"totalCount":65}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'defect_escape', 6.0, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"escapedCount":4,"totalCount":67}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 8.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"activeViolations":16,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 8.5, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"activeViolations":17,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 9.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"activeViolations":18,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 8.5, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"activeViolations":17,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 8.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"activeViolations":16,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'arch_drift', 7.5, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"activeViolations":15,"totalRules":200}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 6.0, 'hours', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"unknownRootCausePercent":20,"sampleSize":5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 5.8, 'hours', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"unknownRootCausePercent":18,"sampleSize":4}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 5.5, 'hours', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"unknownRootCausePercent":15,"sampleSize":6}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 5.2, 'hours', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"unknownRootCausePercent":12,"sampleSize":4}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 5.0, 'hours', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"unknownRootCausePercent":10,"sampleSize":5}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mttrc', 4.8, 'hours', NOW() - INTERVAL '1 month', NOW(), '{"unknownRootCausePercent":10,"sampleSize":3}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 22.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"reworkPrs":11,"totalPrs":50}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 24.0, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"reworkPrs":12,"totalPrs":50}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 25.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"reworkPrs":12,"totalPrs":48}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 23.0, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"reworkPrs":11,"totalPrs":48}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 21.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"reworkPrs":10,"totalPrs":48}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'rework', 20.0, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"reworkPrs":10,"totalPrs":50}');

-- Data Engineering team: Alert on MTTRC (recent P1 incident), strong elsewhere
INSERT INTO kpi_snapshots (team_id, kpi_type, value, unit, period_start, period_end, breakdown) VALUES
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 4.0, 'days', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"ideation":0.8,"coding":1.5,"review":0.9,"deploy":0.8}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 3.8, 'days', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"ideation":0.7,"coding":1.4,"review":0.9,"deploy":0.8}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 3.5, 'days', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"ideation":0.7,"coding":1.3,"review":0.8,"deploy":0.7}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 3.2, 'days', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"ideation":0.6,"coding":1.2,"review":0.7,"deploy":0.7}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 3.0, 'days', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"ideation":0.6,"coding":1.1,"review":0.7,"deploy":0.6}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'cycle_time', 2.8, 'days', NOW() - INTERVAL '1 month', NOW(), '{"ideation":0.5,"coding":1.0,"review":0.7,"deploy":0.6}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 3.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"escapedCount":2,"totalCount":67}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 2.8, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"escapedCount":2,"totalCount":71}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 2.5, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"escapedCount":2,"totalCount":80}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 2.2, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"escapedCount":1,"totalCount":45}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 2.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"escapedCount":1,"totalCount":50}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'defect_escape', 1.8, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"escapedCount":1,"totalCount":56}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 2.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"activeViolations":4,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 2.0, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"activeViolations":4,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 1.5, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"activeViolations":3,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 1.5, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"activeViolations":3,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 1.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"activeViolations":2,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'arch_drift', 1.0, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"activeViolations":2,"totalRules":200}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 4.0, 'hours', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"unknownRootCausePercent":8,"sampleSize":5}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 3.5, 'hours', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"unknownRootCausePercent":5,"sampleSize":3}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 3.0, 'hours', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"unknownRootCausePercent":5,"sampleSize":4}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 8.5, 'hours', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"unknownRootCausePercent":25,"sampleSize":6}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 10.0, 'hours', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"unknownRootCausePercent":30,"sampleSize":4}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'mttrc', 9.5, 'hours', NOW() - INTERVAL '1 month', NOW(), '{"unknownRootCausePercent":28,"sampleSize":5}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 10.0, 'percent', NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 months', '{"reworkPrs":5,"totalPrs":50}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 9.5, 'percent', NOW() - INTERVAL '5 months', NOW() - INTERVAL '4 months', '{"reworkPrs":5,"totalPrs":53}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 9.0, 'percent', NOW() - INTERVAL '4 months', NOW() - INTERVAL '3 months', '{"reworkPrs":4,"totalPrs":44}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 8.5, 'percent', NOW() - INTERVAL '3 months', NOW() - INTERVAL '2 months', '{"reworkPrs":4,"totalPrs":47}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 8.0, 'percent', NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', '{"reworkPrs":4,"totalPrs":50}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'rework', 7.5, 'percent', NOW() - INTERVAL '1 month', NOW(), '{"reworkPrs":3,"totalPrs":40}');

-- Demo PR events (recent 30 days for each team)
INSERT INTO pr_events (team_id, external_id, title, author, created_at, first_commit_at, first_review_at, approved_at, merged_at, deployed_at, is_rework, rework_reason, files_changed, additions, deletions, labels) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'PR-101', 'Add caching layer for user profiles', 'alice', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days', NOW() - INTERVAL '22 days', false, NULL, 8, 250, 30, '{"feature"}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'PR-102', 'Fix race condition in session handler', 'bob', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', true, 'bug_fix', 3, 45, 12, '{"bug","fix"}'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'PR-103', 'Refactor middleware pipeline', 'carol', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', false, NULL, 12, 180, 90, '{"refactor"}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'PR-201', 'Implement Stripe webhook handler', 'dave', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', false, NULL, 5, 200, 15, '{"feature"}'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'PR-202', 'Add retry logic for payment failures', 'eve', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days', false, NULL, 4, 120, 20, '{"feature"}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'PR-301', 'Fix SAML token parsing', 'frank', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', true, 'bug_fix', 6, 80, 35, '{"bug"}'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'PR-302', 'Extend OAuth scope handling', 'grace', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', true, 'scope_creep', 9, 300, 50, '{"scope"}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'PR-401', 'Add Kafka consumer for events', 'heidi', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days', false, NULL, 7, 220, 10, '{"feature"}'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'PR-402', 'Fix data pipeline backpressure', 'ivan', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', true, 'bug_fix', 4, 60, 25, '{"bug","fix"}');

-- Demo defects
INSERT INTO defects (team_id, external_id, severity, found_in, escaped, category, created_at, resolved_at) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'DEF-001', 'minor', 'staging', false, 'logic_error', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'DEF-002', 'major', 'production', true, 'integration', NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'DEF-003', 'critical', 'production', true, 'requirements_gap', NOW() - INTERVAL '10 days', NOW() - INTERVAL '7 days'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'DEF-004', 'major', 'production', true, 'logic_error', NOW() - INTERVAL '5 days', NULL),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'DEF-005', 'minor', 'qa', false, 'config_drift', NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days');

-- Demo incidents (including a P1 for Data Engineering)
INSERT INTO incidents (team_id, external_id, severity, title, detected_at, mitigated_at, root_cause_at, resolved_at, root_cause_method, root_cause_description, is_recurring, recurrence_of) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'INC-001', 'p3', 'Elevated error rates on user service', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '30 minutes', NOW() - INTERVAL '20 days' + INTERVAL '2 hours', NOW() - INTERVAL '20 days' + INTERVAL '3 hours', 'observability', 'Memory leak in connection pool', false, NULL),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'INC-002', 'p2', 'Payment processing delays', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '20 minutes', NOW() - INTERVAL '15 days' + INTERVAL '1 hour', NOW() - INTERVAL '15 days' + INTERVAL '2 hours', 'log_analysis', 'Stripe API rate limiting', false, NULL),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'INC-003', 'p1', 'Data pipeline complete failure', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '45 minutes', NOW() - INTERVAL '8 days' + INTERVAL '8 hours', NOW() - INTERVAL '8 days' + INTERVAL '12 hours', 'brute_force', 'Kafka partition rebalancing storm after broker failure', false, NULL),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'INC-004', 'p2', 'Partial data loss in ETL pipeline', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour', NULL, NULL, NULL, NULL, true, 'INC-003'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'INC-005', 'p3', 'SAML SSO login failures', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '40 minutes', NOW() - INTERVAL '12 days' + INTERVAL '3 hours', NOW() - INTERVAL '12 days' + INTERVAL '5 hours', 'code_review', 'Token validation regex too strict', false, NULL);

-- Demo arch violations
INSERT INTO arch_violations (team_id, rule_name, violation_type, source_component, target_component, file_path, first_detected_at, resolved_at, scan_source) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'no-circular-deps', 'dependency', 'auth-service', 'user-service', 'src/auth/user-lookup.ts', NOW() - INTERVAL '60 days', NULL, 'eslint-plugin-import'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'layer-isolation', 'layer_violation', 'controller', 'repository', 'src/controllers/users.ts', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days', 'archunit'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'no-circular-deps', 'dependency', 'oauth-handler', 'session-manager', 'src/oauth/session.ts', NOW() - INTERVAL '90 days', NULL, 'eslint-plugin-import'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'api-boundary', 'boundary_violation', 'identity-core', 'payment-sdk', 'src/identity/payment-check.ts', NOW() - INTERVAL '75 days', NULL, 'archunit'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'no-internal-imports', 'encapsulation', 'admin-ui', 'identity-internals', 'src/admin/user-debug.ts', NOW() - INTERVAL '30 days', NULL, 'custom-scanner');

-- Demo insights
INSERT INTO insights (team_id, insight_type, severity, title, description, kpis_involved, data, dismissed_at) VALUES
  (NULL, 'correlation', 'info', 'Cycle Time correlates with Rework Rate', 'Across all teams, cycle time and rework rate show strong positive correlation (r=0.82). Teams with higher rework tend to have longer cycle times.', '{"cycle_time","rework"}', '{"r":0.82,"dataPoints":120,"teams":["platform","payments","identity","data-engineering"]}', NULL),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'hotspot', 'warning', 'Identity team rework rate significantly above org average', 'Identity team rework rate (20.0%) is 12.5 percentage points above the org average (7.6%). This may indicate requirements churn or technical debt.', '{"rework"}', '{"teamValue":20.0,"orgAverage":7.6,"delta":12.4}', NULL),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'anomaly', 'critical', 'MTTRC spike detected for Data Engineering', 'Data Engineering MTTRC jumped from 3.0h to 10.0h (mean + 3.2σ). This coincides with a P1 incident (INC-003) and recurring follow-up (INC-004).', '{"mttrc"}', '{"currentValue":10.0,"mean":3.5,"stdDev":2.03,"sigma":3.2}', NULL),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'anomaly', 'warning', 'Architecture drift trending upward for Identity', 'Identity arch drift has been above 7.5% for 6 consecutive months. Consider scheduling a focused cleanup sprint.', '{"arch_drift"}', '{"currentValue":7.5,"trend":"increasing","months":6}', NULL);
