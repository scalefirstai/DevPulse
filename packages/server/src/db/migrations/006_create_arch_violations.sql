CREATE TABLE arch_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    rule_name VARCHAR(200) NOT NULL,
    violation_type VARCHAR(50),
    source_component VARCHAR(200),
    target_component VARCHAR(200),
    file_path TEXT,
    first_detected_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    scan_source VARCHAR(50),
    metadata JSONB DEFAULT '{}'
);
