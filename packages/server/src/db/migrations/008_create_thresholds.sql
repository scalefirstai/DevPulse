CREATE TABLE thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    kpi_type VARCHAR(20) NOT NULL,
    elite_max DECIMAL(10,2) NOT NULL,
    strong_max DECIMAL(10,2) NOT NULL,
    moderate_max DECIMAL(10,2) NOT NULL,
    UNIQUE(team_id, kpi_type)
);

INSERT INTO thresholds (team_id, kpi_type, elite_max, strong_max, moderate_max) VALUES
    (NULL, 'cycle_time', 1, 3, 14),
    (NULL, 'defect_escape', 5, 10, 20),
    (NULL, 'arch_drift', 2, 5, 15),
    (NULL, 'mttrc', 1, 4, 24),
    (NULL, 'rework', 10, 20, 35);
