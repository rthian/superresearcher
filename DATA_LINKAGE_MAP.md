# SuperResearcher Data Linkage Map

**Visual guide to how Insights, Actions, Personas, Projects, and Metrics connect**

---

## 🗺️ Complete Data Relationship Map

```
                    ┌──────────────────┐
                    │   ORGANIZATION   │
                    │  (GXS, GXB, etc) │
                    └────────┬─────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
          ┌──────▼──────┐    │    ┌──────▼──────┐
          │   PROJECT   │    │    │ CSAT/NPS    │
          │  (voc, etc) │    │    │  METRICS    │
          └──────┬──────┘    │    └──────┬──────┘
                 │           │           │
         ┌───────┼───────────┼───────────┼────────┐
         │       │           │           │        │
    ┌────▼────┐  │      ┌────▼────┐     │   ┌────▼────┐
    │ INSIGHT │◄─┼──────┤ PERSONA │     │   │ ACTION  │
    └────┬────┘  │      └────┬────┘     │   └────┬────┘
         │       │           │          │        │
         │       │           │          │        │
         └───────┼───────────┴──────────┼────────┘
                 │                      │
            [Organization]        [Tags, Metrics]
            [Project]             [Product Area]
            [Tags]                [Customer Segment]


Legend:
  ──►  Direct Reference (ID field)
  ◄──  Reverse Lookup (search by)
  ─┬─  Shared Attribute
```

---

## 📊 Detailed Entity Relationships

### 1. INSIGHT → Other Entities

**Insight Contains:**
```json
{
  "id": "voc-006",
  "title": "Absence of Apple Pay and Google Pay",
  "category": "Unmet Need",
  "impactLevel": "High",
  "evidence": "...",
  "recommendedActions": "...",
  "productArea": "Payments",
  "customerSegment": "All Customers",
  "tags": ["Apple-Pay", "Google-Pay", "Critical"],
  
  // Links
  "projectSlug": "voc",              // → PROJECT
  "organization": "GXB",             // → ORGANIZATION
  "source": "filename.pdf"           // Source document
}
```

**Relationships:**
- **Insight → Project**: Direct via `projectSlug`
- **Insight → Organization**: Direct via `organization`
- **Insight → Actions**: Reverse (actions reference insight via `sourceInsight`)
- **Insight → Personas**: Reverse (personas reference via `supportingInsights`)
- **Insight → Metrics**: Tag-based matching (e.g., "NPS" tag → NPS data)

---

### 2. ACTION → Other Entities

**Action Contains:**
```json
{
  "id": "action-001",
  "title": "Integrate Apple Pay and Google Pay",
  "description": "...",
  "priority": "Critical",
  "status": "Not Started",
  "department": "Engineering",
  "owner": "Engineering Lead",
  "successMetrics": "...",
  
  // Links
  "sourceInsight": "voc-006",        // → INSIGHT
  "projectSlug": "voc",              // → PROJECT
  "organization": "GXB",             // → ORGANIZATION
  "tags": ["Payments", "Apple-Pay"]
}
```

**Relationships:**
- **Action → Insight**: Direct via `sourceInsight` (ONE insight)
- **Action → Project**: Direct via `projectSlug`
- **Action → Organization**: Direct via `organization`
- **Action → Personas**: Reverse (personas affected by this action)

---

### 3. PERSONA → Other Entities

**Persona Contains:**
```json
{
  "id": "persona-voc-003",
  "name": "Mobile-First Maya",
  "type": "Primary",
  "tagline": "...",
  "needsFromProduct": [...],
  
  // Links
  "supportingInsights": [            // → INSIGHTS (many)
    "voc-006",
    "voc-015",
    "voc-018"
  ],
  "projectSlug": "voc",              // → PROJECT
  "organization": "GXB"              // → ORGANIZATION (derived from project)
}
```

**Relationships:**
- **Persona → Insights**: Direct via `supportingInsights` array (MANY insights)
- **Persona → Actions**: Indirect (via linked insights)
- **Persona → Project**: Direct via `projectSlug` (stored in path)
- **Persona → Organization**: Derived from project config

---

### 4. PROJECT → Other Entities

**Project Config Contains:**
```json
{
  "id": "c75f9ad1...",
  "name": "Quarterly Voice of Customer Study",
  "slug": "voc",
  "type": "voc-quarterly",
  "organization": "Multi-Org",       // → ORGANIZATION
  "organizations": ["GXS", "GXB"],   // → ORGANIZATIONS (array)
  "status": "Planning",
  "archived": false
}
```

**Relationships:**
- **Project → Organization**: Direct via `organization` or `organizations[]`
- **Project → Insights**: Reverse (insights have `projectSlug`)
- **Project → Actions**: Reverse (actions have `projectSlug`)
- **Project → Personas**: Reverse (personas in project folder)

---

### 5. CSAT/NPS METRICS → Other Entities

**CSAT Data Contains:**
```json
{
  "periods": [
    {
      "period": "2025 Q4",
      "byOrganization": {
        "GXB": {
          "csat": {
            "score": 8.04,
            "byProduct": {
              "CASA": { "score": 7.50 },
              "FlexiCredit": { "score": 8.58 }
            }
          },
          "nps": {
            "score": 32,
            "byProduct": {
              "CASA": { "score": 31 },
              "FlexiCredit": { "score": 61 }
            }
          }
        }
      }
    }
  ]
}
```

**Relationships:**
- **Metrics → Organization**: Direct via nested `byOrganization`
- **Metrics → Insights**: Tag-based matching (insights tagged "NPS" → NPS metrics)
- **Metrics → Actions**: Via insights (actions sourced from metric-related insights)
- **Metrics → Personas**: Indirect (personas impacted by low scores)

---

## 🔍 Query Patterns

### Pattern 1: Get All Related Items for an Insight

**Input:** `insightId = "voc-006"`

```
1. Get Insight Data
   GET /api/insights/voc-006
   → Returns full insight with projectSlug, organization

2. Get Related Actions
   GET /api/actions?project=voc
   → Filter where action.sourceInsight === "voc-006"
   → Returns [action-001]

3. Get Related Personas
   GET /api/personas?project=voc
   → Filter where persona.supportingInsights includes "voc-006"
   → Returns [persona-voc-003 (Mobile-First Maya)]

4. Get Related Metrics (tag-based)
   - Insight tags: ["Apple-Pay", "Google-Pay", "Critical"]
   - Insight organization: "GXB"
   - Insight category: "Unmet Need"
   
   GET /api/csat/metrics
   → Filter to organization === "GXB"
   → Show CASA scores (related to digital banking experience)
```

**Result:**
```json
{
  "insight": { ... },
  "relatedActions": [
    { "id": "action-001", "title": "Integrate Apple Pay...", ... }
  ],
  "relatedPersonas": [
    { "id": "persona-voc-003", "name": "Mobile-First Maya", ... }
  ],
  "relatedMetrics": {
    "csat": {
      "CASA": 7.50,
      "overall": 8.04
    },
    "nps": {
      "CASA": 31,
      "overall": 32
    }
  }
}
```

---

### Pattern 2: Get All Related Items for an Action

**Input:** `actionId = "action-001"`

```
1. Get Action Data
   GET /api/actions/action-001
   → Returns full action with sourceInsight, projectSlug

2. Get Source Insight
   sourceInsight = "voc-006"
   GET /api/insights/voc-006
   → Returns insight that generated this action

3. Get Impacted Personas
   GET /api/personas?project=voc
   → Filter where persona.supportingInsights includes "voc-006"
   → Returns personas affected by source insight

4. Get Current Metrics
   - Action organization: "GXB"
   - Action tags: ["Apple-Pay"]
   - Action successMetrics mention "NPS lift +3-5 pts"
   
   GET /api/csat/metrics
   → Show current baseline for GXB NPS (32)
```

**Result:**
```json
{
  "action": { ... },
  "sourceInsight": {
    "id": "voc-006",
    "title": "Absence of Apple Pay...",
    ...
  },
  "impactedPersonas": [
    { "id": "persona-voc-003", "name": "Mobile-First Maya", "prevalence": "30-35%" }
  ],
  "currentMetrics": {
    "baselineNPS": 32,
    "targetNPS": 38,
    "complaintRate": "2%"
  }
}
```

---

### Pattern 3: Get All Items for a Persona

**Input:** `personaId = "persona-voc-001"` (Rate-Chasing Rachel)

```
1. Get Persona Data
   GET /api/personas/persona-voc-001
   → Returns persona with supportingInsights, projectSlug

2. Get Supporting Insights
   supportingInsights = ["voc-008", "voc-015", "voc-019"]
   GET /api/insights?ids=voc-008,voc-015,voc-019
   → Returns 3 insights

3. Get Related Actions (via insights)
   For each insight, find actions where sourceInsight === insightId
   → Returns [action-006, action-015, action-009]

4. Get Relevant Metrics
   - Persona: "Rate-Chasing Rachel"
   - Related insights about interest rates, competition
   
   GET /api/csat/metrics?org=GXB
   → Show perceived value score (7.45)
   → Show CASA NPS (31)
```

**Result:**
```json
{
  "persona": { ... },
  "supportingInsights": [
    { "id": "voc-008", "title": "Interest rate uncompetitive", ... },
    { "id": "voc-015", "title": "Competition intensified", ... },
    { "id": "voc-019", "title": "Perceived value low", ... }
  ],
  "relatedActions": [
    { "id": "action-006", "title": "Review interest rates", ... },
    { "id": "action-015", "title": "Competitor monitoring", ... }
  ],
  "impactMetrics": {
    "prevalence": "35-40% of CASA",
    "currentCASA_NPS": 31,
    "targetCASA_NPS": 35,
    "perceivedValue": 7.45
  }
}
```

---

## 🔗 UI Navigation Flows

### Flow 1: Insight Exploration
```
User starts at: Insights Explorer

1. Clicks insight card "voc-006"
   ↓
2. Modal/Page opens showing:
   - Full insight details
   - Related Actions section
   - Related Personas section
   - Current metrics section
   ↓
3. User clicks [action-001]
   ↓
4. Action modal opens showing:
   - Full action details
   - Source: voc-006 (clickable back)
   - Impacted personas
   - Current baseline metrics
   ↓
5. User clicks [Mobile-First Maya]
   ↓
6. Persona detail page showing:
   - Full persona
   - Supporting insights (includes voc-006)
   - Related actions
```

### Flow 2: Bottom-Up Discovery
```
User starts at: Persona Gallery

1. Views persona "Mobile-First Maya"
   ↓
2. Sees: Supporting Insights: voc-006, voc-015, voc-018
   ↓
3. Clicks "voc-006" badge
   ↓
4. Navigates to: /insights?ids=voc-006
   ↓
5. Insights Explorer filters to 1 insight
   ↓
6. Clicks insight card
   ↓
7. Sees action-001 in Related Actions
   ↓
8. Can track progress on fixing this persona's pain point
```

### Flow 3: Project-Centric View
```
User starts at: Project Detail (voc)

1. Tab: Insights (28 insights)
   ↓
2. Clicks specific insight
   ↓
3. Modal shows related actions from same project
   ↓
4. User realizes action-001 addresses 3 different insights
   ↓
5. Clicks through to see full scope of action
```

---

## 📊 Data Warehouse Query Examples

### Query 1: Find All Actions Missing Source Insights
```javascript
// Find actions with no sourceInsight or invalid sourceInsight
const allActions = await actionsAPI.listAll();
const allInsights = await insightsAPI.listAll();
const insightIds = new Set(allInsights.map(i => i.id));

const orphanedActions = allActions.filter(action => 
  !action.sourceInsight || !insightIds.has(action.sourceInsight)
);
```

### Query 2: Find Insights With No Actions
```javascript
// Find insights that haven't generated any actions yet
const allInsights = await insightsAPI.listAll();
const allActions = await actionsAPI.listAll();
const actionSourceInsights = new Set(allActions.map(a => a.sourceInsight));

const unactionableInsights = allInsights.filter(insight =>
  !actionSourceInsights.has(insight.id)
);
```

### Query 3: Find Persona Coverage Gaps
```javascript
// Find insights not linked to any persona
const allInsights = await insightsAPI.listAll();
const allPersonas = await personasAPI.listAll();

const insightsCoveredByPersonas = new Set();
allPersonas.forEach(persona => {
  persona.supportingInsights?.forEach(id => {
    insightsCoveredByPersonas.add(id);
  });
});

const uncoveredInsights = allInsights.filter(insight =>
  !insightsCoveredByPersonas.has(insight.id)
);
```

---

## 🎯 Key Takeaways

1. **Actions ALWAYS link to ONE insight** via `sourceInsight`
2. **Personas link to MANY insights** via `supportingInsights[]`
3. **Insights DON'T directly reference actions/personas** (reverse lookup needed)
4. **Metrics link to insights via tags** (tag-based matching)
5. **All entities link to project** via `projectSlug`
6. **All entities link to organization** via `organization` field

---

## 🚀 Implementation Priority

### Phase 1: Direct Links (Easiest)
✅ Action → Insight (sourceInsight)
✅ Persona → Insights (supportingInsights)
✅ All → Project (projectSlug)
✅ All → Organization (organization)

### Phase 2: Reverse Lookups (Medium)
🔄 Insight → Actions (search actions where sourceInsight === id)
🔄 Insight → Personas (search personas where supportingInsights includes id)

### Phase 3: Smart Matching (Advanced)
🧠 Insights → Metrics (tag-based or manual mapping)
🧠 Actions → Metrics (via source insight tags)
🧠 Cross-project patterns (themes, recurring issues)

---

**Next Step:** Use this map to implement the relationships in code!
