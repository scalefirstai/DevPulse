CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    kpi_type VARCHAR(20) NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    breakdown JSONB DEFAULT '{}',
    health_level VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, kpi_type, period_end)
);
CREATE INDEX idx_snapshots_team_kpi ON kpi_snapshots(team_id, kpi_type, period_end DESC);
