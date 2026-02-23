CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    insight_type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20),
    kpis_involved VARCHAR(50)[] NOT NULL,
    data JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    dismissed_at TIMESTAMPTZ
);
