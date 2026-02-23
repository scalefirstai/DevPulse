CREATE TABLE defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    external_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    found_in VARCHAR(20) NOT NULL,
    escaped BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);
