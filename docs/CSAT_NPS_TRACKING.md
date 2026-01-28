# CSAT & NPS Tracking System

## Overview

The CSAT & NPS Tracking System enables SuperResearcher to collect, analyze, and report on bank-wide customer satisfaction metrics. This system supports multi-dimensional CSAT scoring, benchmarking, trend analysis, and integration with research insights.

## Key Features

### 1. Multi-Dimensional CSAT Tracking

- **10-point scale** (1-10) matching GXS/GXB standards
- **Flexible dimensions**:
  - Bank Customer Satisfaction (Bank CSAT) - Primary metric for corporate scorecard
  - Product Quality
  - Service Quality
  - Trust
  - Customer Expectations
  - Information Clarity
  - Security Assurance
  - Value
- **Custom dimensions** can be added via configuration

### 2. Multi-Level Aggregation

- **Bank-wide**: Overall customer satisfaction across all organizations
- **Per-Organization**: Separate tracking for GXS, GXB, Superbank, and others
- **Per-Product**: Product-specific metrics (FlexiCredit, Mobile App, Savings Account, etc.)
- **Per-Dimension**: Granular tracking of each CSAT dimension

### 3. Change Tracking

- **QoQ (Quarter-over-Quarter)**: Automatic calculation of quarterly changes
- **YoY (Year-over-Year)**: Automatic calculation of year-over-year changes
- **Trend visualization**: Line charts showing performance over time

### 4. Benchmarking & Targets

- **SD-based performance bands**:
  - Far Below: < -3 SD
  - Missed: < -2 SD
  - Target: Within ±2 SD
  - Exceed: > +2 SD
  - Outshied Exceed: > +3 SD
- **Configurable thresholds** for alerts

### 5. Alert System

- **Automatic alerts** when scores breach thresholds
- **QoQ drop detection**: Alerts when score drops significantly
- **Alert management**: Track status (open, acknowledged, resolved)
- **Severity levels**: Critical, High, Medium

### 6. Data Import

- **CSV/Excel upload** with validation
- **Survey platform integration** ready (Qualtrics/SurveyMonkey)
- **Manual entry** for quick updates
- **Bulk import** support

### 7. Scorecard Export

- **CSV format** for corporate reporting
- **Customizable** export templates
- **Includes**: Bank-wide, organization, dimension, and product metrics
- **QoQ/YoY changes** included in export

### 8. Verbatim Analysis

- **Customer comments** linked to scores
- **Sentiment tracking** (planned)
- **Theme extraction** for common patterns
- **Integration** with research insights workflow

## System Architecture

### Data Flow

```
Survey Platform → CSV Export → SuperResearcher Upload → 
  → Data Aggregation → CSAT Metrics Storage → 
    → Dashboard Display + Alerts + Export
```

### Data Model

**Primary Storage**: `shared/csat-metrics.json`

```json
{
  "lastUpdated": "ISO timestamp",
  "dataCollectionCadence": "quarterly | monthly",
  "scale": {
    "min": 1,
    "max": 10,
    "type": "10-point"
  },
  "dimensions": [...],
  "periods": [
    {
      "id": "uuid",
      "period": "2026-Q1",
      "periodType": "quarterly",
      "bankWide": {
        "csat": {
          "score": 8.47,
          "responses": 1245,
          "qoqChange": 0.15,
          "yoyChange": 0.30
        },
        "nps": {
          "score": 42,
          "responses": 1245,
          "promoters": 456,
          "passives": 612,
          "detractors": 177
        }
      },
      "byOrganization": {...},
      "byProduct": {...},
      "byDimension": {...},
      "verbatims": [...],
      "alerts": [...]
    }
  ]
}
```

## Usage Guide

### 1. Uploading CSAT Data

#### Via UI

1. Navigate to **CSAT & NPS** in the sidebar
2. Click **Upload Data** button
3. Fill in the form:
   - **Period**: Enter in format `YYYY-Q#` (e.g., `2026-Q1`) or `YYYY-MM` (e.g., `2026-01`)
   - **Period Type**: Select Quarterly or Monthly
   - **Organization**: Optional - leave empty if file contains multiple orgs
   - **File**: Upload CSV or Excel file
4. Click **Upload**

#### CSV Format

```csv
period,organization,dimension,product,score,responses,survey_question,verbatim
2026-Q1,GXS,bank-csat,MobileApp,8.47,456,"How satisfied are you with GXS Bank?","Great app but needs Apple Pay"
2026-Q1,GXS,product-quality,MobileApp,8.10,456,"How satisfied are you with product quality?",
2026-Q1,GXB,bank-csat,FlexiCredit,8.51,234,"Overall satisfaction with GX Bank?","Easy approval process"
```

**Required Columns**:
- `period`: Period identifier (e.g., 2026-Q1)
- `organization`: Organization name (GXS, GXB, Superbank)
- `score`: CSAT score (1-10 scale)
- `responses`: Number of responses

**Optional Columns**:
- `dimension`: CSAT dimension (bank-csat, product-quality, etc.)
- `product`: Product name
- `survey_question`: Survey question text
- `verbatim`: Customer comment

### 2. Viewing CSAT Dashboard

Navigate to **CSAT & NPS** to see:

- **Bank-wide scores** with QoQ/YoY changes
- **NPS breakdown** (Promoters, Passives, Detractors)
- **Trend charts** showing performance over time
- **Organization comparison** with all orgs side-by-side
- **Product performance table** with linked projects
- **Active alerts** banner

### 3. Exporting Scorecard

1. Go to **CSAT & NPS** dashboard
2. Click **Export Scorecard** button
3. Choose period and format (currently CSV only)
4. File downloads automatically

The export includes:
- Bank-wide CSAT and NPS
- All organization scores
- All dimension scores per organization
- Product scores
- QoQ and YoY changes

### 4. Managing Alerts

Alerts are generated automatically when:
- CSAT score drops below threshold (default: 7.0 on 10-point scale)
- QoQ change exceeds drop threshold (default: -0.3)
- YoY change exceeds drop threshold (default: -0.5)

To manage alerts:
1. Click on the alerts banner in CSAT Dashboard
2. Review alert details
3. Update status: Open → Acknowledged → Resolved

### 5. Linking Verbatims to Insights

Customer verbatim comments can be analyzed and linked to research insights:

1. View verbatims in CSAT dashboard (future feature)
2. Identify themes and patterns
3. Extract insights using VoC workflow
4. Link verbatim to insight for traceability

## API Reference

### Bank Customer Metrics Endpoints

#### Get All Metrics

```
GET /api/csat/metrics
```

Returns complete CSAT/NPS data including all periods, organizations, products.

#### Get Specific Scores

```
GET /api/csat/metrics/scores?level=bank&period=2026-Q1
GET /api/csat/metrics/scores?level=organization&entity=GXS&period=2026-Q1
GET /api/csat/metrics/scores?level=product&entity=FlexiCredit&period=2026-Q1
```

Parameters:
- `level`: bank | organization | product | dimension
- `entity`: Organization, product, or dimension name
- `period`: Period identifier (required)
- `dimension`: Dimension ID (for dimension-level queries)

#### Get Trends

```
GET /api/csat/metrics/trends?entity=GXS&entityType=organization&periods=8
```

Parameters:
- `entity`: Entity name
- `entityType`: bank | organization | product | dimension
- `dimension`: Dimension ID (for dimension trends)
- `periods`: Number of periods to return (default: 8)

#### Upload Data

```
POST /api/csat/metrics/upload
Content-Type: multipart/form-data

{
  file: <CSV/Excel file>,
  period: "2026-Q1",
  periodType: "quarterly",
  dataSource: "manual_upload",
  organization: "GXS" (optional)
}
```

Returns:
```json
{
  "success": true,
  "period": {...},
  "alerts": 2
}
```

#### Manual Entry

```
POST /api/csat/metrics/manual
Content-Type: application/json

{
  "period": "2026-Q1",
  "periodType": "quarterly",
  "organization": "GXS",
  "dimension": "bank-csat",
  "score": 8.47,
  "responses": 456,
  "npsScore": 52,
  "npsPromoters": 187,
  "npsPassives": 198,
  "npsDetractors": 71
}
```

#### Get Alerts

```
GET /api/csat/metrics/alerts?status=open&severity=critical
```

Parameters:
- `status`: open | acknowledged | resolved
- `severity`: critical | high | medium

#### Update Alert Status

```
PUT /api/csat/metrics/alerts/:id
Content-Type: application/json

{
  "status": "acknowledged"
}
```

#### Export Scorecard

```
GET /api/csat/metrics/export?period=2026-Q1&format=csv
```

Parameters:
- `period`: Period to export (required)
- `format`: csv | excel (currently only csv supported)

Returns: CSV file download

#### Get Verbatims

```
GET /api/csat/metrics/verbatims?period=2026-Q1&needsAnalysis=true
```

Parameters:
- `period`: Period filter (optional)
- `needsAnalysis`: Filter for unanalyzed verbatims (true/false)
- `product`: Product filter
- `organization`: Organization filter
- `limit`: Max results (default: 100)

#### Link Verbatim to Insight

```
POST /api/csat/metrics/verbatims/:id/link
Content-Type: application/json

{
  "insightId": "insight-uuid",
  "projectSlug": "project-name"
}
```

## Configuration

### Setting Thresholds

Edit `shared/csat-metrics.json`:

```json
{
  "alertThresholds": {
    "csatMinimum": 7.0,
    "qoqDropThreshold": -0.3,
    "yoyDropThreshold": -0.5
  }
}
```

### Adding Custom Dimensions

Edit `shared/csat-metrics.json`:

```json
{
  "dimensions": [
    {
      "id": "custom-dimension",
      "name": "Custom Dimension Name",
      "label": "Custom Dim",
      "primary": false
    }
  ]
}
```

### Changing Data Collection Cadence

```json
{
  "dataCollectionCadence": "monthly",
  "targetTransitionDate": "2026-Q3"
}
```

## Integration with Research Workflow

### Linking CSAT to Projects

Products can be linked to research projects in the data upload:

1. Use `linkedProject` field in product data
2. System automatically creates clickable links in dashboard
3. Navigate between CSAT metrics and project insights seamlessly

Example:
```csv
period,organization,product,score,responses,linkedProject
2026-Q1,GXS,MobileApp,8.47,456,appstore
```

### Extracting Insights from Verbatims

1. Export verbatims from CSAT dashboard
2. Use VoC workflow to extract insights
3. Link verbatims back to generated insights
4. Track which customer feedback led to which insights

## Quarterly to Monthly Transition

The system supports transitioning from quarterly to monthly reporting:

1. **Current**: Quarterly collection (Q1, Q2, Q3, Q4)
2. **Transition**: Mixed quarters and months
3. **Target**: Full monthly collection by target date

Both formats are supported simultaneously:
- Quarterly periods: `2026-Q1`, `2026-Q2`
- Monthly periods: `2026-01`, `2026-02`

Trend charts and comparisons work across both formats.

## Best Practices

### 1. Data Collection

- **Consistency**: Collect data at same time each period
- **Sample size**: Ensure minimum 100+ responses for reliable metrics
- **Survey design**: Use consistent questions across periods
- **Verbatims**: Collect open-ended feedback for qualitative insights

### 2. Data Entry

- **Validation**: Review data before upload
- **Completeness**: Include all required fields
- **Organization tagging**: Always specify organization
- **Product linking**: Link products to research projects when possible

### 3. Analysis

- **Trend focus**: Look at trends over time, not single points
- **Segmentation**: Analyze by organization and product
- **Dimensions**: Review dimension scores for detailed insights
- **Verbatims**: Read customer comments to understand "why" behind scores

### 4. Action Taking

- **Alert response**: Address alerts within 48 hours
- **Root cause**: Investigate drops with supporting research
- **Tracking**: Link improvement actions to CSAT projects
- **Follow-up**: Measure impact of changes in next period

## Troubleshooting

### Upload Fails

**Issue**: CSV upload returns error

**Solutions**:
- Check CSV format matches expected columns
- Verify period format (YYYY-Q# or YYYY-MM)
- Ensure scores are within 1-10 range
- Check for special characters in text fields

### Missing Data

**Issue**: Dashboard shows N/A for metrics

**Solutions**:
- Verify data was uploaded successfully
- Check period selection matches uploaded data
- Ensure organization names match exactly
- Review browser console for API errors

### Alerts Not Generating

**Issue**: Expected alerts not appearing

**Solutions**:
- Verify thresholds are configured correctly
- Check if scores actually breach thresholds
- Ensure previous period data exists for comparison
- Review alert generation logic in backend logs

### Export Fails

**Issue**: Scorecard export doesn't download

**Solutions**:
- Check browser popup blocker settings
- Verify period has data to export
- Try different browser
- Check network tab for API errors

## Future Enhancements

### Planned Features

1. **Advanced Visualizations**
   - Heatmaps for dimension performance
   - Sparklines for quick trends
   - Benchmark comparison charts

2. **Automated Insights**
   - AI-powered trend detection
   - Anomaly identification
   - Predictive analytics

3. **Survey Integration**
   - Direct Qualtrics connection
   - SurveyMonkey API integration
   - Real-time data sync

4. **Enhanced Verbatim Analysis**
   - Sentiment analysis
   - Theme clustering
   - Keyword extraction
   - Auto-linking to insights

5. **Benchmarking**
   - Industry benchmark comparison
   - Competitor tracking
   - Historical baseline comparison

6. **Reporting**
   - Automated monthly reports
   - Executive summaries
   - Email distribution
   - PowerPoint export

## Support

For questions or issues:
1. Check this documentation
2. Review TROUBLESHOOTING.md
3. Check GitHub issues
4. Contact the development team

## Version History

### v1.0.0 (2026-01-28)
- Initial implementation
- 10-point CSAT scale support
- Multi-dimensional tracking
- QoQ/YoY change calculations
- Alert system
- CSV upload and scorecard export
- Dashboard integration
- Organization and product level tracking

