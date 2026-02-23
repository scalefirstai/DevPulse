## ADDED Requirements

### Requirement: Application layout with sidebar navigation
The system SHALL provide a responsive layout with a persistent sidebar for navigation and a top header showing the org name and last-updated timestamp. Navigation items SHALL include: Overview, Trends, Teams, and Settings. The layout SHALL use dark theme by default.

#### Scenario: Desktop layout
- **WHEN** the viewport is 1280px or wider
- **THEN** the sidebar is visible alongside the main content area

#### Scenario: Mobile layout
- **WHEN** the viewport is narrower than 768px
- **THEN** the sidebar collapses to a hamburger menu and the content area fills the screen

### Requirement: KPI card component
Each KPI SHALL be displayed as a card showing: the KPI name, current value with unit, health badge (Elite/Strong/Moderate/Alert with color coding), and shift indicator (arrow up/down/flat with percentage). The health badge SHALL use green (Elite), blue (Strong), yellow (Moderate), and red (Alert).

#### Scenario: KPI card rendering
- **WHEN** cycle time is 2.1 days, classified as Elite, with a -15% shift
- **THEN** the card shows "Cycle Time", "2.1 days", a green "Elite" badge, and a downward arrow with "-15%"

#### Scenario: Alert state styling
- **WHEN** a KPI is classified as Alert
- **THEN** the card uses red accent color for the health badge and value text

### Requirement: Five-card KPI grid on overview page
The Overview page SHALL display all five KPIs in a grid layout. On desktop, the grid SHALL show 5 cards in a single row. On tablet, it SHALL wrap to 3+2. On mobile, cards SHALL stack vertically.

#### Scenario: Desktop grid
- **WHEN** the viewport is 1280px or wider
- **THEN** all 5 KPI cards are displayed in a single row

#### Scenario: Mobile stack
- **WHEN** the viewport is narrower than 768px
- **THEN** KPI cards stack vertically in a single column

### Requirement: Health radar chart
The Overview page SHALL include a radar chart (Recharts RadarChart) plotting all five KPIs for a selected team. Each axis SHALL represent one KPI normalized to a 0-100 scale. The chart SHALL overlay threshold bands showing Elite, Strong, Moderate, and Alert zones.

#### Scenario: Radar chart rendering
- **WHEN** a team is selected on the Overview page
- **THEN** a radar chart displays with 5 axes, one per KPI, with the team's values plotted as a filled polygon

#### Scenario: Threshold bands
- **WHEN** the radar chart renders
- **THEN** concentric bands show the Elite (inner), Strong, Moderate, and Alert (outer) zones with distinct fill colors at low opacity

### Requirement: Trend chart with threshold bands
The Trends page SHALL display an area chart (Recharts AreaChart) for a selected KPI over a configurable time range (default 90 days). The chart SHALL overlay horizontal threshold bands showing Elite, Strong, Moderate, and Alert zones as colored background regions.

#### Scenario: 90-day trend view
- **WHEN** a user navigates to the Trends page and selects "Cycle Time"
- **THEN** an area chart displays daily cycle time values for the past 90 days with threshold bands

#### Scenario: Range selection
- **WHEN** a user changes the time range to 30 days
- **THEN** the chart updates to show only the last 30 days of data

### Requirement: Team comparison bar chart
The Teams page SHALL include a bar chart (Recharts BarChart) comparing a selected KPI across all teams. Bars SHALL be color-coded by health tier. Teams SHALL be sorted by KPI value.

#### Scenario: Cross-team comparison
- **WHEN** a user selects "Defect Escape Rate" on the Teams page
- **THEN** a horizontal bar chart shows each team's escape rate, sorted from lowest to highest, with bars colored by tier

### Requirement: Cycle time breakdown chart
The KPI detail view for Cycle Time SHALL include a stacked bar chart showing the four phases: ideation, coding, review, and deploy. Each phase SHALL be a distinct color.

#### Scenario: Phase breakdown display
- **WHEN** a user drills into the Cycle Time KPI
- **THEN** a stacked bar chart shows the median duration of each phase (ideation, coding, review, deploy) per period

### Requirement: Rework pie chart
The KPI detail view for Rework % SHALL include a pie chart showing the breakdown by rework reason: bug_fix, requirement_change, refactor, and scope_creep.

#### Scenario: Rework cause distribution
- **WHEN** a user drills into the Rework % KPI
- **THEN** a pie chart displays the proportion of rework attributed to each cause category

### Requirement: Insight cards panel
The Overview page SHALL include an insights panel displaying auto-generated insights as cards. Each insight card SHALL show: title, description, severity badge (info/warning/critical), and involved KPIs as tags. Cards SHALL be color-coded by severity: blue (info), yellow (warning), red (critical).

#### Scenario: Insight card rendering
- **WHEN** an insight with severity "warning" involves cycle_time and defect_escape
- **THEN** the card displays a yellow "Warning" badge, the insight title and description, and tags for "Cycle Time" and "Defect Escape Rate"

#### Scenario: Dismissing an insight
- **WHEN** a user clicks the dismiss button on an insight card
- **THEN** the insight is marked as dismissed (dismissed_at is set) and removed from the active insights panel

### Requirement: Team comparison table
The Teams page SHALL include a data table showing all teams with columns for each KPI's current value and health tier. The table SHALL be sortable by any column.

#### Scenario: Table sorting
- **WHEN** a user clicks the "Cycle Time" column header
- **THEN** the table sorts teams by cycle time value in ascending order

#### Scenario: Health tier display in cells
- **WHEN** a team's rework % is classified as Alert
- **THEN** the cell shows the value with a red Alert badge

### Requirement: Settings page for threshold configuration
The Settings page SHALL display the current threshold configuration in an editable form. Users SHALL be able to modify elite_max, strong_max, and moderate_max for each KPI. Changes SHALL be saved via `PUT /api/config/thresholds`.

#### Scenario: Editing thresholds
- **WHEN** a user changes the cycle_time elite_max from 1 to 2 and clicks Save
- **THEN** the updated thresholds are sent to the API and a success confirmation is shown

#### Scenario: Validation
- **WHEN** a user enters elite_max=10, strong_max=5 (elite > strong)
- **THEN** a validation error is shown indicating elite_max must be less than strong_max

### Requirement: Onboarding setup wizard
The system SHALL display a first-run onboarding wizard when no teams are configured. The wizard SHALL guide users through: creating a team, configuring at least one connector, and triggering an initial data collection.

#### Scenario: First-run detection
- **WHEN** the dashboard loads and the API returns zero teams
- **THEN** the user is redirected to the onboarding wizard instead of the Overview page

#### Scenario: Wizard completion
- **WHEN** the user completes all onboarding steps
- **THEN** they are redirected to the Overview page showing the newly created team's data

### Requirement: Auto-refresh dashboard data
The dashboard SHALL auto-refresh data at a configurable interval (default 300 seconds). The refresh SHALL update KPI values, insights, and shift indicators without a full page reload.

#### Scenario: Automatic data refresh
- **WHEN** 300 seconds have elapsed since the last data fetch
- **THEN** the dashboard fetches fresh data from the API and updates all displayed values

#### Scenario: Manual refresh
- **WHEN** a user clicks the refresh button in the header
- **THEN** all dashboard data is immediately re-fetched

### Requirement: API client with error handling
The frontend SHALL use an Axios instance with request/response interceptors for base URL configuration, auth token injection, and error handling. Failed API requests SHALL display user-friendly error messages. Network errors SHALL show a connection error banner.

#### Scenario: API error display
- **WHEN** an API request returns a 500 status
- **THEN** a toast notification displays "Something went wrong. Please try again."

#### Scenario: Network failure
- **WHEN** the API is unreachable
- **THEN** a persistent banner displays "Unable to connect to the server" until connectivity is restored
