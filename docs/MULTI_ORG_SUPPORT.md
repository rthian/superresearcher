# Multi-Organization Support

## Overview

SuperResearcher now supports multi-organization research management, allowing you to track insights, actions, and personas across different organizations (GXS, GXB, Superbank, and competitors).

## Supported Organizations

- **GXS** - GXS Bank (Singapore digital bank)
- **GXB** - GXBank (Malaysia digital bank)
- **Superbank** - Superbank product line
- **Competitors** - Any competitor organizations you want to track

You can add more organizations as needed.

---

## Configuration

### 1. Project Configuration

Each project must specify its organization in `study.config.json`:

```json
{
  "id": "uuid",
  "name": "Project Name",
  "slug": "project-slug",
  "type": "interview",
  "organization": "GXS",  // ← ADD THIS FIELD
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "status": "Planning",
  "notion": {
    "enabled": false,
    "studyPageId": null,
    "insightsDatabaseId": null
  },
  "metadata": {
    "participants": 0,
    "startDate": null,
    "endDate": null,
    "owner": null
  }
}
```

**Valid organization values:**
- `"GXS"`
- `"GXB"`
- `"Superbank"`
- Any custom organization name

### 2. Existing Projects

Update your existing `study.config.json` files:

```bash
# Example: Update appstore project
projects/appstore/study.config.json
  → Add: "organization": "GXS"

# Example: Update post-flexicredit project  
projects/post-flexicredit/study.config.json
  → Add: "organization": "GXB"
```

---

## How It Works

### Backend (API)

The organization field is automatically enriched when serving data:

**Insights API** (`GET /api/insights`)
- Reads `study.config.json` for each project
- Adds `organization` field to each insight
- Returns: `{ ...insight, organization: "GXS" }`

**Actions API** (`GET /api/actions`)
- Reads `study.config.json` for each project
- Adds `organization` field to each action
- Returns: `{ ...action, organization: "GXB" }`

**Personas API** (`GET /api/personas`)
- Reads `study.config.json` based on persona's `studyId`
- Adds `organization` field to each persona
- Returns: `{ ...persona, organization: "GXS" }`

### Frontend (UI)

Organization filters are available on all major views:

#### 1. **Insights Explorer** (`/insights`)
- 🏢 Organization filter (top of filters section)
- Organization badge on each insight card
- Filter by: GXS, GXB, Superbank, or All
- Combines with category, impact, and project filters

#### 2. **Action Center** (`/actions`)
- 🏢 Organization filter
- Organization badge on each action card
- Filter by organization + status
- Export includes organization data

#### 3. **Persona Gallery** (`/personas`)
- 🏢 Organization filter
- Organization badge on each persona card
- Filter by organization + persona type
- Drill-down to persona detail shows organization

---

## UI Features

### Organization Filter

All pages with organization support show:

```
🏢 Organization
[All Organizations] [GXS] [GXB] [Superbank]
```

- **Blue highlighting** for selected organization
- **Prominent placement** at top of filters
- **Badge display** on cards with 🏢 icon

### Active Filters

When organization filter is active:

```
Active filters: 🏢 GXS [×]  Category: Pain Point [×]  [Clear all]
```

- Organization shown first with blue badge
- Click × to remove individual filter
- "Clear all" removes all filters

### Card Display

**Insight Card:**
```
┌─────────────────────────────────────┐
│ Users demand Apple Pay integration  │
│                                     │
│ 🏢 GXS  Unmet Need  High Impact    │
│                                     │
│ Multiple users requested...         │
│                                     │
│ From: appstore                      │
└─────────────────────────────────────┘
```

**Action Card:**
```
┌─────────────────────────────────────┐
│ Implement Apple Pay integration     │
│ 🏢 GXS                              │
│                                     │
│ High Priority  Not Started          │
│ ...                                 │
└─────────────────────────────────────┘
```

**Persona Card:**
```
┌─────────────────────────────────────┐
│ 👤 Digital-First Maya               │
│ 🏢 GXS  Primary                     │
│                                     │
│ "Tech-savvy iOS user..."            │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## Use Cases

### 1. Single Organization View

**Scenario:** Product team wants to see only GXS insights

```
1. Go to Insights Explorer
2. Click "GXS" in Organization filter
3. View all GXS-specific insights
4. Export GXS insights only
```

### 2. Cross-Organization Comparison

**Scenario:** Compare pain points across GXS and GXB

```
1. Go to Insights Explorer
2. Filter: Category = "Pain Point"
3. Review insights from both orgs
4. Note organization badges to identify source
5. Compare patterns and differences
```

### 3. Competitor Analysis

**Scenario:** Track competitor research separately

```
1. Create project: "competitor-analysis"
2. Set organization: "Competitor-Bank-X"
3. Extract insights from competitor data
4. Filter by "Competitor-Bank-X" to view
5. Compare with your own org's insights
```

### 4. Multi-Product Portfolio

**Scenario:** Manage GXS, GXB, and Superbank together

```
1. Projects tagged with respective orgs
2. Dashboard shows aggregated stats
3. Filter by org to focus on specific product
4. Personas show which org they belong to
5. Actions can be filtered by org for roadmap planning
```

---

## Workflow Integration

### Creating New Projects

When creating a new research project:

```bash
# 1. Create project structure
superresearcher init my-new-study

# 2. Edit study.config.json
# Add: "organization": "GXS"

# 3. Add research data
# projects/my-new-study/context/transcripts/...

# 4. Extract insights
superresearcher extract my-new-study

# 5. Organization automatically included in output
```

### Extracting Insights

The organization is automatically inherited from `study.config.json`:

```json
// projects/my-study/insights/insights.json
{
  "extractedAt": "timestamp",
  "studyId": "my-study",
  "organization": "GXS",  // ← Automatically added by API
  "insights": [...]
}
```

### Generating Actions & Personas

Actions and personas inherit organization from their source project:

```json
// API response includes organization
{
  "actions": [
    {
      "id": "action-001",
      "title": "...",
      "organization": "GXS"  // ← From source project
    }
  ]
}
```

---

## Best Practices

### 1. Consistent Naming

Use consistent organization names across projects:
- ✅ "GXS" (all projects)
- ❌ "GXS", "gxs", "GXS Bank" (inconsistent)

### 2. Project Organization

Structure projects by organization:

```
projects/
├── gxs-appstore/          (organization: "GXS")
├── gxs-onboarding/        (organization: "GXS")
├── gxb-flexicredit/       (organization: "GXB")
├── gxb-savings/           (organization: "GXB")
└── superbank-research/    (organization: "Superbank")
```

### 3. Tagging Strategy

- **Primary org:** The organization being researched
- **Competitor studies:** Tag with competitor name
- **Cross-org studies:** Use primary stakeholder org

### 4. Filtering Workflow

Recommended filter order:
1. **Organization** (narrow to specific org)
2. **Category/Status** (narrow by type)
3. **Impact/Priority** (narrow by importance)
4. **Search** (find specific items)

---

## API Reference

### GET /api/insights

**Response:**
```json
{
  "insights": [
    {
      "id": "insight-001",
      "title": "...",
      "category": "Pain Point",
      "organization": "GXS",  // ← Added
      "projectSlug": "appstore",
      "studyId": "appstore"
    }
  ]
}
```

### GET /api/actions

**Response:**
```json
{
  "actions": [
    {
      "id": "action-001",
      "title": "...",
      "priority": "High",
      "organization": "GXB",  // ← Added
      "projectSlug": "post-flexicredit"
    }
  ]
}
```

### GET /api/personas

**Response:**
```json
{
  "personas": [
    {
      "id": "persona-001",
      "name": "Digital-First Maya",
      "type": "Primary",
      "organization": "GXS",  // ← Added
      "studyId": "appstore"
    }
  ]
}
```

---

## Migration Guide

### For Existing Projects

1. **Identify organization for each project:**
   ```
   appstore → GXS
   post-flexicredit → GXB
   ```

2. **Update study.config.json files:**
   ```bash
   # For each project
   cd projects/PROJECT_NAME
   # Edit study.config.json
   # Add: "organization": "GXS"
   ```

3. **Restart server:**
   ```bash
   superresearcher serve
   ```

4. **Verify in UI:**
   - Check Insights Explorer for organization badges
   - Test organization filter
   - Confirm all projects show correct org

### For New Projects

New projects created after this update should include organization in their initial config.

---

## Troubleshooting

### Organization not showing in UI

**Problem:** Organization badge missing on cards

**Solution:**
1. Check `study.config.json` has `"organization"` field
2. Restart server: `superresearcher serve`
3. Clear browser cache and refresh
4. Check browser console for errors

### Organization filter not working

**Problem:** Clicking organization filter doesn't filter results

**Solution:**
1. Ensure UI is rebuilt: `cd ui && npm run build`
2. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
3. Check that insights have `organization` field in API response

### Mixed/inconsistent organization names

**Problem:** Same org appears multiple times (e.g., "GXS", "gxs", "GXS Bank")

**Solution:**
1. Standardize naming in all `study.config.json` files
2. Use exact same string (case-sensitive)
3. Restart server after updates

---

## Future Enhancements

### Planned Features

1. **Organization Comparison View**
   - Side-by-side comparison of insights
   - Metrics dashboard per organization
   - Cross-org pattern analysis

2. **Organization Management**
   - Add/edit organizations via UI
   - Organization metadata (logo, color, description)
   - Organization-level settings

3. **Advanced Filtering**
   - Multi-select organizations
   - Organization + date range
   - Organization-specific exports

4. **Organization Analytics**
   - Insights count by org
   - Action completion rate by org
   - Persona distribution by org

---

## Summary

✅ **Implemented:**
- Organization field in `study.config.json`
- Backend enrichment of insights/actions/personas
- Organization filters on all major UI pages
- Organization badges on cards
- URL parameter support for filters
- Export includes organization data

✅ **Fixed:**
- Insights Explorer filters now work correctly
- Persona supporting insights navigation filters properly
- Active filters display and clear functionality

🚀 **Ready to Use:**
- Add `"organization": "GXS"` to your project configs
- Refresh browser to see organization filters
- Start filtering by organization immediately!

