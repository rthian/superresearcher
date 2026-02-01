# Project Archive Feature

## Overview

The Project Archive feature allows you to archive completed or inactive research projects to keep your workspace organized. Archived projects and their associated insights, actions, and personas are automatically filtered out from all views by default.

## Key Features

✅ **Soft Delete** - Data is preserved, not deleted  
✅ **Automatic Filtering** - Archived projects excluded from insights/actions/personas  
✅ **Easy Toggle** - Show/hide archived projects with one click  
✅ **Reversible** - Unarchive projects anytime  
✅ **Visual Indicators** - Clear archived status on project cards  

---

## How It Works

### Archiving a Project

When you archive a project:
1. Project status changes to "Archived"
2. `archived: true` flag is set in `study.config.json`
3. `archivedAt` timestamp is recorded
4. Project is hidden from default project list
5. **All insights, actions, and personas from that project are automatically filtered out**

### What Gets Filtered

**Automatically excluded when project is archived:**
- ❌ Insights Explorer - insights from archived projects
- ❌ Action Center - actions from archived projects
- ❌ Persona Gallery - personas from archived projects
- ❌ Projects Library - archived projects (unless "Show Archived" is toggled)
- ❌ Dashboard stats - archived project data

**Still accessible:**
- ✅ Project detail page (if you have direct link)
- ✅ All data files remain intact
- ✅ Can be unarchived to restore visibility

---

## Usage

### Archive a Project

**Via UI:**
1. Go to Projects Library
2. Find the project you want to archive
3. Click "Archive Project" button at bottom of project card
4. Confirm the action
5. Project is immediately hidden from default view

**Via API:**
```bash
POST /api/projects/:slug/archive
```

### Unarchive a Project

**Via UI:**
1. Go to Projects Library
2. Click "Show Archived" button (top right)
3. Find the archived project
4. Click "Unarchive Project" button
5. Project is restored to active status

**Via API:**
```bash
POST /api/projects/:slug/unarchive
```

### View Archived Projects

**Via UI:**
- Click "Show Archived" button in Projects Library
- Toggle back to "Show Active" to hide them again

**Via API:**
```bash
GET /api/projects?includeArchived=true
GET /api/insights?includeArchived=true
GET /api/actions?includeArchived=true
GET /api/personas?includeArchived=true
```

---

## Technical Details

### Data Structure

**study.config.json changes:**
```json
{
  "id": "uuid",
  "name": "Project Name",
  "slug": "project-slug",
  "status": "Archived",      // ← Changed from "Active"
  "archived": true,           // ← Added
  "archivedAt": "2026-01-28T10:00:00Z",  // ← Added
  "organization": "GXS",
  "updatedAt": "2026-01-28T10:00:00Z"
}
```

### Backend API Changes

**Projects Route:**
- `GET /api/projects` - Excludes archived by default
- `GET /api/projects?includeArchived=true` - Includes archived
- `POST /api/projects/:slug/archive` - Archive a project
- `POST /api/projects/:slug/unarchive` - Unarchive a project

**Insights Route:**
- `GET /api/insights` - Excludes insights from archived projects
- `GET /api/insights?includeArchived=true` - Includes all

**Actions Route:**
- `GET /api/actions` - Excludes actions from archived projects
- `GET /api/actions?includeArchived=true` - Includes all

**Personas Route:**
- `GET /api/personas` - Excludes personas from archived projects
- `GET /api/personas?includeArchived=true` - Includes all

### Frontend API Methods

```javascript
// Projects API
projectsAPI.list(includeArchived)  // Default: false
projectsAPI.archive(slug)
projectsAPI.unarchive(slug)

// Insights API
insightsAPI.listAll(includeArchived)  // Default: false

// Actions API
actionsAPI.listAll(includeArchived)  // Default: false

// Personas API
personasAPI.list(includeArchived)  // Default: false
```

---

## UI Components

### Projects Library

**Active View (Default):**
```
┌─────────────────────────────────────────────┐
│ Projects                  [Show Archived]   │
│ 2 active projects                           │
├─────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐         │
│ │ Project A    │  │ Project B    │         │
│ │ 🏢 GXS       │  │ 🏢 GXB       │         │
│ │              │  │              │         │
│ │ [Archive]    │  │ [Archive]    │         │
│ └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────┘
```

**Archived View:**
```
┌─────────────────────────────────────────────┐
│ Projects                   [Show Active]    │
│ 1 archived project                          │
├─────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ 📦 Project C (Archived)              │   │
│ │ 🏢 GXS  [Archived]                   │   │
│ │                                      │   │
│ │ [Unarchive Project]                  │   │
│ └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Visual Indicators

**Archived Project Card:**
- Grayed out background (`bg-gray-50`)
- Reduced opacity (`opacity-75`)
- Archive icon (📦) next to project name
- "Archived" badge
- "Unarchive Project" button

**Active Project Card:**
- Normal colors
- Full opacity
- No archive icon
- "Archive Project" button

---

## Use Cases

### 1. Completed Research Projects

**Scenario:** You've completed a research study, extracted all insights, and implemented all actions.

**Action:**
1. Archive the project to clean up your workspace
2. Insights/actions/personas remain available for reference
3. New research won't be cluttered with old data

### 2. Seasonal/Periodic Research

**Scenario:** You run quarterly research studies and want to focus on current quarter only.

**Action:**
1. Archive previous quarters after completion
2. View only current quarter's data by default
3. Toggle to archived view when you need historical comparison

### 3. Failed/Cancelled Studies

**Scenario:** A research project was cancelled or didn't yield useful results.

**Action:**
1. Archive the project to hide it from active view
2. Data is preserved if you need it later
3. Workspace stays focused on active research

### 4. Organization-Specific Cleanup

**Scenario:** You manage research for multiple organizations and want to focus on one.

**Action:**
1. Archive projects from other organizations
2. Filter by active organization only
3. Cleaner insights/actions/personas view

### 5. Annual Review

**Scenario:** End of year, you want to review all research including archived.

**Action:**
1. Toggle "Show Archived" in Projects Library
2. Review all projects from the year
3. Decide which to keep archived vs. unarchive

---

## Best Practices

### When to Archive

✅ **Archive when:**
- Research study is complete
- All insights have been extracted
- All actions have been implemented or cancelled
- Project is no longer actively referenced
- You want to clean up your workspace

❌ **Don't archive when:**
- Research is still in progress
- Actions are still being implemented
- Insights are frequently referenced
- You're unsure if you'll need the data

### Naming Convention

Consider adding date prefixes to project names for easy identification:
```
✅ Good:
- "2025-Q1-appstore-research"
- "2025-12-flexicredit-survey"

❌ Less Clear:
- "appstore"
- "research-project-1"
```

### Archive vs. Delete

**Archive:**
- ✅ Reversible
- ✅ Data preserved
- ✅ Can reference later
- ✅ Recommended approach

**Delete (manual):**
- ❌ Permanent
- ❌ Data lost
- ❌ Cannot undo
- ❌ Not recommended

---

## Troubleshooting

### Archived project still showing in insights

**Problem:** Insights from archived project appear in Insights Explorer

**Solution:**
1. Check project's `study.config.json` has `"archived": true`
2. Restart server: `superresearcher serve`
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Check API response includes `archived` field

### Cannot find archived project

**Problem:** Need to access archived project but can't find it

**Solution:**
1. Go to Projects Library
2. Click "Show Archived" button (top right)
3. Find project in archived list
4. Click project to view details
5. Or unarchive if you need it active again

### Accidentally archived wrong project

**Problem:** Archived the wrong project

**Solution:**
1. Click "Show Archived" in Projects Library
2. Find the project
3. Click "Unarchive Project"
4. Project is immediately restored

### Want to permanently delete archived project

**Problem:** Need to free up disk space or remove sensitive data

**Solution:**
```bash
# Manual deletion (use with caution!)
rm -rf projects/PROJECT_SLUG

# Or move to backup location
mv projects/PROJECT_SLUG ~/archived-research-backup/
```

---

## Migration Guide

### For Existing Projects

No migration needed! Existing projects without `archived` field are treated as active by default.

**Optional:** Add `archived: false` explicitly:
```json
{
  "id": "uuid",
  "name": "Project Name",
  "archived": false,  // ← Optional, defaults to false
  "status": "Active"
}
```

---

## API Reference

### Archive Project

**Endpoint:** `POST /api/projects/:slug/archive`

**Request:**
```bash
curl -X POST http://localhost:3000/api/projects/appstore/archive
```

**Response:**
```json
{
  "success": true,
  "config": {
    "id": "uuid",
    "name": "Appstore",
    "slug": "appstore",
    "status": "Archived",
    "archived": true,
    "archivedAt": "2026-01-28T10:00:00Z",
    "updatedAt": "2026-01-28T10:00:00Z"
  }
}
```

### Unarchive Project

**Endpoint:** `POST /api/projects/:slug/unarchive`

**Request:**
```bash
curl -X POST http://localhost:3000/api/projects/appstore/unarchive
```

**Response:**
```json
{
  "success": true,
  "config": {
    "id": "uuid",
    "name": "Appstore",
    "slug": "appstore",
    "status": "Active",
    "archived": false,
    "archivedAt": null,
    "updatedAt": "2026-01-28T10:00:00Z"
  }
}
```

### List Projects (with archived)

**Endpoint:** `GET /api/projects?includeArchived=true`

**Response:**
```json
{
  "projects": [
    {
      "slug": "appstore",
      "name": "Appstore",
      "status": "Active",
      "archived": false
    },
    {
      "slug": "old-study",
      "name": "Old Study",
      "status": "Archived",
      "archived": true,
      "archivedAt": "2025-12-31T00:00:00Z"
    }
  ]
}
```

---

## Summary

✅ **Implemented:**
- Archive/unarchive projects via UI and API
- Automatic filtering of archived project data
- Toggle to show/hide archived projects
- Visual indicators for archived status
- Reversible soft-delete approach

✅ **Benefits:**
- Cleaner workspace focused on active research
- Historical data preserved for reference
- Easy organization management
- Flexible filtering across all views

🚀 **Ready to Use:**
- Refresh browser to see new archive buttons
- Start archiving completed projects
- Toggle between active and archived views

