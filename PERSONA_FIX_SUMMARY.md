# Persona System Fix - Complete Overhaul

## 🐛 Problem Identified

### The Old Broken Architecture:
```
❌ projects/appstore/personas/updates.json (5 personas) 
   → Manually copied to shared/personas/personas.json
   
❌ projects/post-flexicredit/personas/updates.json (5 personas)
   → NEVER visible in UI!
   
❌ projects/demo-study/personas/updates.json (0 personas)
   → Empty
   
❌ API only read from shared/personas/personas.json
   → Showed same 5 personas regardless of filters
   → Archiving projects had no effect
   → post-flexicredit personas were invisible
```

**Result:** UI showed duplicated personas, archiving didn't work, and personas from most projects were missing.

---

## ✅ The Fix - Dynamic Aggregation

### New Architecture (matches insights/actions pattern):
```
✓ API reads from ALL project folders dynamically
✓ projects/appstore/personas/updates.json → 5 personas tagged with "appstore"
✓ projects/post-flexicredit/personas/updates.json → 5 personas tagged with "post-flexicredit"
✓ projects/demo-study/personas/updates.json → 0 personas (empty project)

✓ Each persona gets enriched with:
  - projectSlug: Source project identifier
  - studyId: Same as projectSlug
  - organization: From project config (GXS, GXB, etc.)
  - archived: Whether source project is archived

✓ Archiving a project immediately hides its personas
✓ No more manual copying to shared folder needed
```

---

## 📝 Changes Made

### File: `server/routes/personas.js`

**1. GET /api/personas - Completely rewritten**
   - ❌ OLD: Read from `shared/personas/personas.json`
   - ✅ NEW: Loop through all projects and aggregate personas
   - Tags each persona with source project and organization
   - Filters out archived projects (unless `includeArchived=true`)
   - Returns unified list with correct metadata

**2. GET /api/personas/:id - Updated**
   - ❌ OLD: Search in shared folder only
   - ✅ NEW: Search across all project folders
   - Returns persona with enriched metadata

**3. PUT /api/personas/:id - Made project-aware**
   - Finds persona in its source project folder
   - Updates in place within that project
   - No longer uses shared folder

**4. POST /api/personas - Made project-aware**
   - Requires `projectSlug` in request body
   - Creates persona in specific project folder
   - No longer uses shared folder

**5. PUT /api/personas - Made project-aware**
   - Requires `projectSlug` in request body
   - Writes to specific project folder

**6. Removed unused imports**
   - Removed `readSharedPersonas`, `writeSharedPersonas`
   - Removed `getSharedDir`, `readProjectConfig` (not used in new impl)
   - Kept only `getProjectDir`, `listProjects`

---

## 🧪 How to Test

### 1. Restart the Server
```bash
superresearcher serve
```

### 2. Navigate to Personas Gallery
```
http://localhost:3000/personas
```

### Expected Results:

**Before archiving any projects:**
- ✅ Should see **10 personas total**
  - 5 from `appstore` (tagged with "GXS" or organization)
  - 5 from `post-flexicredit` (tagged with "GXB" or organization)
  - 0 from `demo-study` (no personas generated yet)

**After archiving `appstore` project:**
- ✅ Should see **5 personas** (only from `post-flexicredit`)
- ✅ Personas from `appstore` should disappear

**After archiving BOTH projects:**
- ✅ Should see **0 personas**
- ✅ Empty state message should appear

**After unarchiving a project:**
- ✅ Personas should reappear immediately

### 3. Test Persona Detail View
- Click on any persona card
- ✅ Should navigate to detail page
- ✅ Should show correct project linkage
- ✅ "Supporting Insights" should link to correct project

### 4. Test Organization Filters
- Filter by "GXS" → See only appstore personas
- Filter by "GXB" → See only post-flexicredit personas

---

## 🎯 Benefits of New Architecture

1. **Consistency**: Matches insights and actions pattern
2. **Automatic**: No manual copying to shared folder
3. **Accurate**: Archive status reflects immediately
4. **Complete**: All project personas are visible
5. **Scalable**: Works with unlimited projects
6. **Maintainable**: Single source of truth (project folders)

---

## 📊 Verification Checklist

- [ ] Server restarts without errors
- [ ] `/api/personas` returns 10 personas (5 + 5)
- [ ] Each persona has `projectSlug`, `organization`, `archived` fields
- [ ] Archiving `appstore` hides its 5 personas
- [ ] Archiving `post-flexicredit` hides its 5 personas
- [ ] Archiving both shows 0 personas
- [ ] Unarchiving restores personas
- [ ] Organization filters work correctly
- [ ] Persona detail pages show correct project linkage
- [ ] Supporting insights links work

---

## 🚀 Next Steps

1. **Generate personas for demo-study:**
   ```bash
   # Run the persona generation prompt for demo-study
   # This will create projects/demo-study/personas/updates.json
   ```

2. **Consider cleanup:**
   - `shared/personas/personas.json` is now obsolete
   - Can be safely deleted or kept as backup
   - API no longer uses it

3. **Verify cross-project deduplication:**
   - If same persona appears in multiple projects
   - Currently shows both (tagged with different projects)
   - Consider if deduplication logic is needed

---

## 🔧 Technical Notes

### API Response Format
```json
{
  "lastUpdated": "2026-01-31T10:45:00Z",
  "totalPersonas": 10,
  "personas": [
    {
      "id": "persona-001",
      "name": "Digital-First Maya",
      "type": "Primary",
      "projectSlug": "appstore",
      "studyId": "appstore",
      "organization": "GXS",
      "archived": false,
      "supportingInsights": ["insight-001", "insight-002"],
      ...
    }
  ]
}
```

### Archive Logic
- Reads `study.config.json` for each project
- Checks `config.archived === true` OR `config.status === 'Archived'`
- Skips project if archived (unless `includeArchived=true`)

---

**Status:** ✅ Fixed and ready for testing  
**Date:** January 31, 2026  
**Impact:** High - Core persona functionality now works correctly
