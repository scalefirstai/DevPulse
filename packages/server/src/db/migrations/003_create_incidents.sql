CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    external_id VARCHAR(100) NOT NULL,
    severity VARCHAR(10) NOT NULL,
    title TEXT,
    detected_at TIMESTAMPTZ NOT NULL,
    mitigated_at TIMESTAMPTZ,
    root_cause_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    root_cause_method VARCHAR(30),
    root_cause_description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_of UUID REFERENCES incidents(id),
    metadata JSONB DEFAULT '{}'
);
