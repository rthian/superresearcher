# Insights & Actions Page Enhancement Plan

**Date:** January 31, 2026  
**Goal:** Add drill-down detail views and cross-database linkages

---

## 📊 Current State Analysis

### What Works Well ✅
- **Filtering System**: Both pages have robust filters (organization, category, impact, project, status)
- **Export Functionality**: CSV/JSON export available
- **Basic Display**: Grid/list views show key information
- **Organization Support**: Multi-org filtering works correctly

### What's Missing ❌
- **❌ No Click-Through Details**: Cards are not clickable - no drill-down view
- **❌ No Relationship Visualization**: Can't see how insights → actions → personas connect
- **❌ No CSAT/NPS Integration**: Metrics data not linked to insights
- **❌ No Cross-Navigation**: Can't jump from insight to related actions/personas
- **❌ Limited Context**: Can't see full evidence, metrics, or source documents
- **❌ No Action Status Tracking**: Can't update action status from UI

---

## 🎯 Proposed Enhancements

### Phase 1: Drill-Down Detail Views (Week 1-2)

#### 1.1 Insight Detail Modal/Page
**What:** Click any insight card to see full details

**Components to Show:**
```
┌─ INSIGHT DETAIL ───────────────────────────────────────┐
│ [X Close]                                              │
│                                                        │
│ voc-006: Absence of Apple Pay and Google Pay          │
│ 🏢 GXB | 📁 voc | 📊 High Impact | ⚡ Unmet Need     │
│                                                        │
│ ──────────────────────────────────────────────────    │
│                                                        │
│ 📝 FULL EVIDENCE                                       │
│ [Complete verbatim quote with source]                 │
│                                                        │
│ 💡 RECOMMENDED ACTIONS                                │
│ [Full recommended actions text]                       │
│                                                        │
│ 🎯 METADATA                                           │
│ • Product Area: Payments                              │
│ • Customer Segment: All Customers                     │
│ • Confidence: High                                     │
│ • Source: GXB Voice-of-Customers 2025 Q4.pdf          │
│ • Tags: [Apple-Pay] [Google-Pay] [Critical]           │
│                                                        │
│ ──────────────────────────────────────────────────    │
│                                                        │
│ 🔗 LINKED ACTIONS (2)                                 │
│ ┌─────────────────────────────────────────┐          │
│ │ action-001: Integrate Apple Pay          │          │
│ │ 🔴 Critical | 🔧 Engineering | ⏱️ 90 days │          │
│ │ [View Details →]                          │          │
│ └─────────────────────────────────────────┘          │
│                                                        │
│ 👥 LINKED PERSONAS (1)                                │
│ ┌─────────────────────────────────────────┐          │
│ │ Mobile-First Maya                        │          │
│ │ Digital native expecting Apple Pay       │          │
│ │ [View Persona →]                          │          │
│ └─────────────────────────────────────────┘          │
│                                                        │
│ 📊 RELATED METRICS (if available)                     │
│ • CSAT Score: 7.50 (CASA)                             │
│ • NPS Score: 31 (CASA)                                │
│ • Complaint %: 2% of Q4 issues                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**UI Pattern:** Modal overlay OR dedicated `/insights/:id` route

---

#### 1.2 Action Detail Modal/Page
**What:** Click any action card to see full details + update status

**Components to Show:**
```
┌─ ACTION DETAIL ────────────────────────────────────────┐
│ [X Close]                                              │
│                                                        │
│ action-001: Integrate Apple Pay and Google Pay        │
│ 🏢 GXB | 📁 voc | 🔴 Critical | 🔧 Engineering        │
│                                                        │
│ Status: [Not Started ▼] [Update]                      │
│                                                        │
│ ──────────────────────────────────────────────────    │
│                                                        │
│ 📋 FULL DESCRIPTION                                    │
│ [Complete description with context]                   │
│                                                        │
│ 📊 DETAILS                                            │
│ • Owner: Engineering Lead                             │
│ • Support Team: Product, Compliance                   │
│ • Effort: Large (90 days)                             │
│ • Impact: High                                         │
│ • Phase: 3 - Strategic Features (Weeks 12-24)         │
│                                                        │
│ ✅ MILESTONES (5)                                     │
│ [ ] Week 2: Technical feasibility confirmed           │
│ [ ] Week 4: Apple/Google approval (Go/No-Go)          │
│ [ ] Week 8: Beta testing with 100 users               │
│ [ ] Week 12: Public launch                            │
│ [ ] Week 16: Review adoption metrics                  │
│                                                        │
│ ⚠️ PREREQUISITES (3)                                  │
│ • Banking license compliance review                   │
│ • Apple/Google partnership agreements                 │
│ • Card processor integration approval                 │
│                                                        │
│ 🎯 SUCCESS METRICS                                    │
│ 1. Apple Pay & Google Pay live within 90 days        │
│ 2. Reduce complaints from 2% to <0.5%                 │
│ 3. Track adoption rate (target 40% in 6 months)       │
│ 4. NPS lift +3-5 pts expected                         │
│                                                        │
│ ──────────────────────────────────────────────────    │
│                                                        │
│ 🔗 SOURCE INSIGHT                                     │
│ ┌─────────────────────────────────────────┐          │
│ │ voc-006: Absence of Apple Pay            │          │
│ │ ⚡ Unmet Need | 📊 High Impact            │          │
│ │ [View Insight →]                          │          │
│ └─────────────────────────────────────────┘          │
│                                                        │
│ 👥 IMPACTED PERSONAS (1)                              │
│ ┌─────────────────────────────────────────┐          │
│ │ Mobile-First Maya (30-35% of base)       │          │
│ │ Critical priority for this segment       │          │
│ │ [View Persona →]                          │          │
│ └─────────────────────────────────────────┘          │
│                                                        │
│ 📈 CURRENT METRICS                                    │
│ • Mobile wallet requests: 2% of Q4 complaints         │
│ • CASA NPS: 31 (target: 35+)                          │
│ • Competitor gap: Ryt & Boost have this feature       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Key Features:**
- Status update dropdown (Not Started → In Progress → Complete)
- Milestone checklist (interactive)
- Cross-links to insights and personas

---

### Phase 2: Cross-Database Linkages (Week 2-3)

#### 2.1 Insight → Actions Linkage
**API Enhancement:**
```javascript
// GET /api/insights/:id/actions
// Returns all actions where sourceInsight === insightId
{
  "insightId": "voc-006",
  "actions": [
    { "id": "action-001", "title": "...", "status": "Not Started", ... }
  ]
}
```

**UI:** Show linked actions in insight detail modal

---

#### 2.2 Action → Insight Linkage
**Already exists:** `sourceInsight` field in actions

**UI:** Show source insight in action detail modal (clickable)

---

#### 2.3 Persona → Insights Linkage
**Already exists:** `supportingInsights` array in personas

**UI Enhancement:** In PersonaDetail page, make insight IDs clickable:
- Click insight ID → Navigate to `/insights?ids=voc-008,voc-015`
- Opens Insights Explorer filtered to those specific insights

---

#### 2.4 Insight/Action → Persona Linkage (Reverse)
**API Enhancement:**
```javascript
// GET /api/insights/:id/personas
// Returns all personas where supportingInsights includes insightId
{
  "insightId": "voc-006",
  "personas": [
    { "id": "persona-voc-003", "name": "Mobile-First Maya", ... }
  ]
}
```

**UI:** Show impacted personas in insight/action detail modal

---

#### 2.5 CSAT/NPS → Insights Linkage
**New Feature:** Link metrics to relevant insights

**Approach:**
1. **Tag-Based Matching**: Use insight tags to find related metrics
   - Insight tagged `["NPS", "Q4-2025", "GXB"]` → Show GXB NPS metrics
   - Insight tagged `["CASA", "GXB"]` → Show CASA CSAT for GXB

2. **Manual Mapping** (future): Add `relatedMetrics` field to insights:
```json
{
  "id": "voc-001",
  "title": "GXB narrowly missed FY 2025 NPS OKR",
  "relatedMetrics": {
    "nps": {
      "organization": "GXB",
      "product": "Blended",
      "period": "2025 Q4",
      "score": 32
    }
  }
}
```

**UI:** Display related metrics in insight detail modal

---

### Phase 3: Navigation & Visualization (Week 3-4)

#### 3.1 Breadcrumb Navigation
Add breadcrumbs when drilling down:
```
Home > Insights > voc-006 > action-001
                ↑ Click to go back to filtered insights view
```

#### 3.2 Quick Links Panel
Add a "Related Items" sidebar when viewing details:
```
┌─ RELATED ITEMS ───┐
│ 📊 1 Source Insight │
│ 🎯 2 Actions        │
│ 👤 1 Persona        │
│ 📁 Project: voc     │
│ 🏢 Org: GXB         │
└─────────────────────┘
```

#### 3.3 Relationship Graph (Advanced - Phase 4)
Visual network graph showing connections:
- Center: Selected insight
- Connected nodes: Actions, personas, related insights
- Click node to navigate

---

## 🛠️ Implementation Plan

### Week 1: Insight Detail View
**Files to Create/Modify:**
1. `ui/src/pages/InsightDetail.jsx` (NEW)
2. `ui/src/components/insights/InsightDetailModal.jsx` (NEW)
3. `ui/src/pages/InsightsExplorer.jsx` (MODIFY - add click handler)
4. `ui/src/api/insights.js` (ADD - getById, getRelatedActions, getRelatedPersonas)
5. `server/routes/insights.js` (ADD - GET /api/insights/:id/actions, /api/insights/:id/personas)

**Tasks:**
- [ ] Create InsightDetail component with all sections
- [ ] Add API endpoint for single insight retrieval
- [ ] Add API endpoint for related actions
- [ ] Add API endpoint for related personas
- [ ] Add onClick handler to insight cards
- [ ] Add modal/page routing

**Priority:** 🔴 Critical

---

### Week 2: Action Detail View
**Files to Create/Modify:**
1. `ui/src/pages/ActionDetail.jsx` (NEW)
2. `ui/src/components/actions/ActionDetailModal.jsx` (NEW)
3. `ui/src/pages/ActionCenter.jsx` (MODIFY - add click handler)
4. `ui/src/api/actions.js` (ADD - getById, updateStatus)
5. `server/routes/actions.js` (ADD - GET /api/actions/:id, PUT /api/actions/:id/status)

**Tasks:**
- [ ] Create ActionDetail component
- [ ] Add status update functionality
- [ ] Add milestone checklist (if interactive)
- [ ] Link to source insight
- [ ] Link to impacted personas
- [ ] Add onClick handler to action cards

**Priority:** 🔴 Critical

---

### Week 3: Cross-Database Linkages
**Files to Modify:**
1. `server/routes/insights.js` (ADD linkage endpoints)
2. `server/routes/actions.js` (ADD linkage endpoints)
3. `server/routes/personas.js` (ADD linkage endpoints)
4. `ui/src/pages/PersonaDetail.jsx` (MODIFY - make insight IDs clickable)
5. `ui/src/components/MetricsCard.jsx` (NEW - for CSAT/NPS display)

**Tasks:**
- [ ] Implement GET /api/insights/:id/actions
- [ ] Implement GET /api/insights/:id/personas
- [ ] Implement GET /api/actions/:id/personas
- [ ] Add tag-based CSAT/NPS matching logic
- [ ] Update PersonaDetail to link to insights
- [ ] Create MetricsCard component

**Priority:** 🟠 High

---

### Week 4: Enhanced Navigation
**Files to Create/Modify:**
1. `ui/src/components/Breadcrumbs.jsx` (NEW)
2. `ui/src/components/RelatedItemsPanel.jsx` (NEW)
3. `ui/src/App.jsx` (ADD new routes)

**Tasks:**
- [ ] Add breadcrumb navigation
- [ ] Create related items sidebar
- [ ] Add keyboard shortcuts (Esc to close, arrows to navigate)
- [ ] Improve loading states
- [ ] Add error boundaries

**Priority:** 🟡 Medium

---

## 📐 Technical Architecture

### API Endpoints to Add

```javascript
// Insights
GET /api/insights/:id                    // Get single insight with full details
GET /api/insights/:id/actions            // Get all actions sourced from this insight
GET /api/insights/:id/personas           // Get all personas referencing this insight
GET /api/insights/:id/metrics            // Get related CSAT/NPS metrics (future)

// Actions
GET /api/actions/:id                     // Get single action with full details
GET /api/actions/:id/insight             // Get source insight for this action
GET /api/actions/:id/personas            // Get personas impacted by this action
PUT /api/actions/:id/status              // Update action status
PUT /api/actions/:id/milestones          // Update milestone completion (future)

// Personas (enhance existing)
GET /api/personas/:id/insights           // Get insights supporting this persona (enhance)
GET /api/personas/:id/actions            // Get actions impacting this persona (new)

// Cross-references
GET /api/relationships/:type/:id         // Get all relationships for any entity type
```

### Component Structure

```
pages/
├── InsightsExplorer.jsx        (existing - add click handling)
├── InsightDetail.jsx           (NEW - full detail page)
├── ActionCenter.jsx            (existing - add click handling)
├── ActionDetail.jsx            (NEW - full detail page)
└── PersonaDetail.jsx           (existing - enhance with linkages)

components/
├── insights/
│   ├── InsightCard.jsx         (existing)
│   ├── InsightDetailModal.jsx  (NEW)
│   └── RelatedActionsPanel.jsx (NEW)
├── actions/
│   ├── ActionCard.jsx          (existing)
│   ├── ActionDetailModal.jsx   (NEW)
│   ├── StatusUpdateForm.jsx    (NEW)
│   └── MilestoneChecklist.jsx  (NEW)
├── shared/
│   ├── Breadcrumbs.jsx         (NEW)
│   ├── RelatedItemsPanel.jsx   (NEW)
│   ├── MetricsCard.jsx         (NEW)
│   └── LinkageGraph.jsx        (NEW - Phase 4)
```

---

## 🎨 UI/UX Patterns

### Pattern 1: Modal Overlay (Recommended for Phase 1)
**Pros:**
- Keep user in context
- Faster navigation (no page reload)
- Easy to implement
- Better for quick scanning

**Cons:**
- Limited screen real estate for complex data
- Mobile experience less optimal

**Implementation:**
```jsx
// In InsightsExplorer.jsx
const [selectedInsight, setSelectedInsight] = useState(null);

<InsightCard 
  onClick={() => setSelectedInsight(insight)}
  ...
/>

{selectedInsight && (
  <InsightDetailModal
    insight={selectedInsight}
    onClose={() => setSelectedInsight(null)}
  />
)}
```

---

### Pattern 2: Dedicated Detail Page (Better for Phase 2+)
**Pros:**
- Full screen space for complex data
- Shareable URLs
- Better for deep analysis
- Support browser back button

**Cons:**
- Slight navigation delay
- Requires routing setup

**Implementation:**
```jsx
// In App.jsx routing
<Route path="/insights/:id" element={<InsightDetail />} />

// In InsightsExplorer.jsx
<Link to={`/insights/${insight.id}`}>
  <InsightCard {...insight} />
</Link>
```

**Recommendation:** Start with Modal (Phase 1), migrate to dedicated pages (Phase 2)

---

## 📊 Data Flow Examples

### Example 1: View Insight Details
```
User clicks insight card "voc-006"
  ↓
Frontend: Open modal with basic insight data (already loaded)
  ↓
API Call: GET /api/insights/voc-006/actions
  ↓
Backend: Search all actions where sourceInsight === "voc-006"
  ↓
Return: [action-001]
  ↓
API Call: GET /api/insights/voc-006/personas
  ↓
Backend: Search all personas where supportingInsights includes "voc-006"
  ↓
Return: [persona-voc-003 (Mobile-First Maya)]
  ↓
Frontend: Display modal with:
  - Full insight details
  - 1 linked action (action-001)
  - 1 linked persona (Mobile-First Maya)
  - Related metrics (CASA NPS 31, CSAT 7.50)
```

---

### Example 2: Navigate from Persona to Insights to Action
```
User viewing: persona-voc-001 (Rate-Chasing Rachel)
  ↓
Clicks: supportingInsights badge "voc-008, voc-015, voc-019"
  ↓
Navigate to: /insights?ids=voc-008,voc-015,voc-019
  ↓
Insights Explorer: Shows 3 filtered insights
  ↓
User clicks: voc-008 (Interest rate insight)
  ↓
Modal shows: Full insight + linked action-006 (Rate review)
  ↓
User clicks: [View action-006 →]
  ↓
Navigate to action detail showing:
  - Full action details
  - Source: voc-008
  - Impacted persona: Rate-Chasing Rachel
  - Current metric: CASA NPS 31 → Target 35+
```

---

## 🚀 Quick Win: Minimal Viable Product (1 Week)

If you need something quick, implement this MVP:

### MVP Features:
1. **Insight Click → Show Full Evidence**
   - Add `<InsightDetailModal>` component
   - Show: Full evidence, recommended actions, tags
   - NO linkages yet (Phase 2)

2. **Action Click → Show Full Description**
   - Add `<ActionDetailModal>` component  
   - Show: Full description, success metrics, milestones
   - Show sourceInsight ID as text (not clickable yet)

3. **Basic Cross-Links**
   - In PersonaDetail: Make insight IDs clickable → filter InsightsExplorer
   - In ActionDetail: Show source insight ID as link → open insight modal

### MVP Implementation (1 week):
```javascript
// Day 1-2: InsightDetailModal.jsx
function InsightDetailModal({ insight, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{insight.title}</h2>
        <p><strong>Evidence:</strong> {insight.evidence}</p>
        <p><strong>Recommended:</strong> {insight.recommendedActions}</p>
        <div>Tags: {insight.tags.join(', ')}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Day 3-4: ActionDetailModal.jsx
function ActionDetailModal({ action, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{action.title}</h2>
        <p>{action.description}</p>
        <p><strong>Metrics:</strong> {action.successMetrics}</p>
        <p><strong>Source:</strong> {action.sourceInsight}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// Day 5: Update InsightsExplorer.jsx and ActionCenter.jsx
// Add onClick handlers and modals

// Day 6-7: Testing and polish
```

---

## ✅ Success Metrics

### Phase 1 Success Criteria:
- [ ] 100% of insights are clickable
- [ ] 100% of actions are clickable
- [ ] Detail modals show all available data fields
- [ ] Users can close modals with X button or Esc key
- [ ] No console errors on click

### Phase 2 Success Criteria:
- [ ] Insight details show linked actions count
- [ ] Action details show source insight
- [ ] Persona page links work to insights
- [ ] API response time <500ms for linkage queries

### Phase 3 Success Criteria:
- [ ] Breadcrumb navigation works
- [ ] Related items panel shows correct counts
- [ ] CSAT/NPS metrics appear when relevant
- [ ] Cross-navigation doesn't lose filter state

---

## 🎯 Recommendation Summary

### **Start Here (Week 1):**
1. ✅ Implement InsightDetailModal with full evidence and recommended actions
2. ✅ Implement ActionDetailModal with full description and success metrics
3. ✅ Make insight cards and action cards clickable
4. ✅ Show basic linkages (sourceInsight ID as text)

### **Next Steps (Week 2-3):**
1. Add API endpoints for relationships
2. Show linked actions in insight modal (clickable)
3. Show source insight in action modal (clickable)
4. Show impacted personas in both modals

### **Future Enhancements (Week 4+):**
1. CSAT/NPS integration
2. Status update functionality for actions
3. Interactive milestone checklists
4. Relationship visualization graph
5. Keyboard shortcuts and power-user features

---

## 📁 Files to Create

Create these files in order:

1. `ui/src/components/insights/InsightDetailModal.jsx`
2. `ui/src/components/actions/ActionDetailModal.jsx`
3. `ui/src/api/insights.js` (enhance existing)
4. `ui/src/api/actions.js` (enhance existing)
5. `server/routes/insights.js` (add endpoints)
6. `server/routes/actions.js` (add endpoints)

---

**Ready to implement?** Start with the MVP and iterate based on user feedback!
