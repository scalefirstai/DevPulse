export { BaseConnector } from './base-connector.js';

// GitHub
export { GitHubConnector, type GitHubConnectorConfig, type GitHubPrRaw } from './github/github-connector.js';
export { PrAnalyzer, type PrAnalyzerConfig } from './github/pr-analyzer.js';
export { ReworkDetector, type ReworkDetectorConfig } from './github/rework-detector.js';
export { CommitClassifier, type CommitType, type ClassifiedCommit } from './github/commit-classifier.js';

// Jira
export { JiraConnector, type JiraConnectorConfig, type JiraIssueRaw } from './jira/jira-connector.js';
export { IssueLifecycle, type IssueLifecycleConfig, type IssueLifecycleMetrics, type IssueTransition } from './jira/issue-lifecycle.js';
export { DefectClassifier, type ClassifiedDefect, type DefectCategory } from './jira/defect-classifier.js';

// Incidents
export { PagerDutyConnector, type PagerDutyConnectorConfig, type PagerDutyIncidentRaw } from './incidents/pagerduty-connector.js';
export { OpsGenieConnector, type OpsGenieConnectorConfig, type OpsGenieAlertRaw } from './incidents/opsgenie-connector.js';
export { IncidentAnalyzer, type IncidentAnalysis, type IncidentSummary } from './incidents/incident-analyzer.js';

// CI
export { GitHubActionsConnector, type GitHubActionsConnectorConfig, type GitHubWorkflowRunRaw, type CiBuild } from './ci/github-actions-connector.js';
export { JenkinsConnector, type JenkinsConnectorConfig, type JenkinsBuildRaw } from './ci/jenkins-connector.js';
export { BuildAnalyzer, type BuildAnalysisSummary, type BuildTrend } from './ci/build-analyzer.js';

// Architecture
export { ArchUnitConnector } from './architecture/archunit-connector.js';
export { DependencyAnalyzer } from './architecture/dependency-analyzer.js';
export { FitnessFunctionConnector } from './architecture/fitness-function-connector.js';
