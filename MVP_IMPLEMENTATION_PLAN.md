# MVP Implementation Plan - Insights & Actions Detail Views

**Timeline:** 1 Week  
**Goal:** Add click-through detail modals showing full information and basic cross-links  
**Status:** Ready to Implement

---

## 🎯 MVP Scope

### What We're Building:

1. **Insight Detail Modal** - Click any insight → See full details + related items
2. **Action Detail Modal** - Click any action → See full details + source insight
3. **Basic Cross-Links** - Navigate between related entities
4. **Enhanced Persona Links** - Make insight badges clickable

### What We're NOT Building (Yet):

- ❌ Status update functionality
- ❌ CSAT/NPS integration
- ❌ Interactive milestone checklists
- ❌ Relationship graphs
- ❌ Advanced filtering in modals

---

## 📅 Day-by-Day Implementation Plan

### **Day 1-2: Insight Detail Modal**

#### Files to Create:
```
ui/src/components/insights/InsightDetailModal.jsx
```

#### What to Build:
```jsx
import { FiX, FiArrowRight, FiUser, FiTarget } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { CATEGORY_COLORS } from '../../utils/constants';

function InsightDetailModal({ insight, onClose, relatedActions = [], relatedPersonas = [] }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {insight.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {insight.organization && (
                <span className="badge bg-blue-100 text-blue-800 font-semibold">
                  🏢 {insight.organization}
                </span>
              )}
              <span className={`badge ${CATEGORY_COLORS[insight.category] || 'bg-gray-100 text-gray-800'}`}>
                {insight.category}
              </span>
              <span className={`badge ${
                insight.impactLevel === 'High' ? 'bg-red-100 text-red-800' :
                insight.impactLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {insight.impactLevel} Impact
              </span>
              <span className="badge bg-gray-100 text-gray-800">
                {insight.confidenceLevel} Confidence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Evidence */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📝 Evidence
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{insight.evidence}</p>
            </div>
            {insight.source && (
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium">Source:</span> {insight.source}
              </p>
            )}
          </section>

          {/* Recommended Actions */}
          {insight.recommendedActions && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Recommended Actions
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{insight.recommendedActions}</p>
              </div>
            </section>
          )}

          {/* Metadata */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎯 Metadata
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              {insight.productArea && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Area</dt>
                  <dd className="mt-1 text-sm text-gray-900">{insight.productArea}</dd>
                </div>
              )}
              {insight.customerSegment && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer Segment</dt>
                  <dd className="mt-1 text-sm text-gray-900">{insight.customerSegment}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Project</dt>
                <dd className="mt-1 text-sm text-gray-900">{insight.projectSlug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Insight ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{insight.id}</dd>
              </div>
            </dl>
            
            {insight.tags && insight.tags.length > 0 && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                <div className="flex flex-wrap gap-2">
                  {insight.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Related Actions */}
          {relatedActions.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTarget className="w-5 h-5" />
                Linked Actions ({relatedActions.length})
              </h3>
              <div className="space-y-3">
                {relatedActions.map(action => (
                  <div 
                    key={action.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
                    onClick={() => {
                      // Will implement action modal in Day 3-4
                      console.log('View action:', action.id);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">{action.title}</h4>
                      <FiArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className={`badge ${
                        action.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        action.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {action.priority}
                      </span>
                      <span className="text-gray-600">
                        {action.department}
                      </span>
                      <span className="text-gray-500">
                        {action.effort}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Personas */}
          {relatedPersonas.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Related Personas ({relatedPersonas.length})
              </h3>
              <div className="space-y-3">
                {relatedPersonas.map(persona => (
                  <Link
                    key={persona.id}
                    to={`/personas/${persona.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{persona.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{persona.tagline}</p>
                      </div>
                      <FiArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    {persona.prevalence && (
                      <p className="text-xs text-gray-500 mt-2">{persona.prevalence}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InsightDetailModal;
```

#### Update InsightsExplorer.jsx:
```jsx
// Add at top
import { useState } from 'react';
import InsightDetailModal from '../components/insights/InsightDetailModal';
import { useQuery } from '@tanstack/react-query';
import { actionsAPI } from '../api/actions';
import { personasAPI } from '../api/personas';

// Add state
const [selectedInsight, setSelectedInsight] = useState(null);

// Add queries for related data
const { data: allActions } = useQuery({
  queryKey: ['actions-all'],
  queryFn: () => actionsAPI.listAll(),
});

const { data: allPersonas } = useQuery({
  queryKey: ['personas-all'],
  queryFn: () => personasAPI.listAll(),
});

// Calculate related items when insight is selected
const relatedActions = selectedInsight 
  ? (allActions?.actions || []).filter(a => a.sourceInsight === selectedInsight.id)
  : [];

const relatedPersonas = selectedInsight
  ? (allPersonas?.personas || []).filter(p => 
      p.supportingInsights?.includes(selectedInsight.id)
    )
  : [];

// Update card onClick
<div 
  key={insight.id} 
  className="card hover:shadow-md transition-shadow cursor-pointer"
  onClick={() => setSelectedInsight(insight)}
>
  {/* existing card content */}
</div>

// Add modal at end of component
{selectedInsight && (
  <InsightDetailModal
    insight={selectedInsight}
    relatedActions={relatedActions}
    relatedPersonas={relatedPersonas}
    onClose={() => setSelectedInsight(null)}
  />
)}
```

---

### **Day 3-4: Action Detail Modal**

#### Files to Create:
```
ui/src/components/actions/ActionDetailModal.jsx
```

#### What to Build:
```jsx
import { FiX, FiArrowRight, FiUser, FiLightbulb, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';

function ActionDetailModal({ action, onClose, sourceInsight = null, relatedPersonas = [] }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {action.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {action.organization && (
                <span className="badge bg-blue-100 text-blue-800 font-semibold">
                  🏢 {action.organization}
                </span>
              )}
              <span className={`badge ${PRIORITY_COLORS[action.priority]}`}>
                {action.priority} Priority
              </span>
              <span className={`badge ${STATUS_COLORS[action.status]}`}>
                {action.status}
              </span>
              {action.department && (
                <span className="badge bg-gray-100 text-gray-800">
                  🔧 {action.department}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
            aria-label="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          {action.description && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📋 Description
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{action.description}</p>
              </div>
            </section>
          )}

          {/* Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📊 Action Details
            </h3>
            <dl className="grid grid-cols-2 gap-4">
              {action.owner && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.owner}</dd>
                </div>
              )}
              {action.supportTeam && action.supportTeam.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Support Team</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.supportTeam.join(', ')}</dd>
                </div>
              )}
              {action.effort && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Effort</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.effort}</dd>
                </div>
              )}
              {action.impact && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Impact</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.impact}</dd>
                </div>
              )}
              {action.timeline && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.timeline}</dd>
                </div>
              )}
              {action.phase && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phase</dt>
                  <dd className="mt-1 text-sm text-gray-900">{action.phase}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Project</dt>
                <dd className="mt-1 text-sm text-gray-900">{action.projectSlug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Action ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{action.id}</dd>
              </div>
            </dl>

            {action.tags && action.tags.length > 0 && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                <div className="flex flex-wrap gap-2">
                  {action.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Prerequisites */}
          {action.prerequisites && action.prerequisites.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ⚠️ Prerequisites ({action.prerequisites.length})
              </h3>
              <ul className="space-y-2">
                {action.prerequisites.map((prereq, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">▸</span>
                    <span className="text-gray-700">{prereq}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Milestones */}
          {action.milestones && action.milestones.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5" />
                Milestones ({action.milestones.length})
              </h3>
              <div className="space-y-2">
                {action.milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm font-medium flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 flex-1">{milestone}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Success Metrics */}
          {action.successMetrics && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Success Metrics
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{action.successMetrics}</p>
              </div>
            </section>
          )}

          {/* Source Insight */}
          {sourceInsight && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiLightbulb className="w-5 h-5" />
                Source Insight
              </h3>
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
                onClick={() => {
                  onClose();
                  // Will trigger insight modal
                  console.log('View source insight:', sourceInsight.id);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{sourceInsight.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge bg-blue-100 text-blue-800 text-xs">
                        {sourceInsight.category}
                      </span>
                      <span className="badge bg-red-100 text-red-800 text-xs">
                        {sourceInsight.impactLevel} Impact
                      </span>
                    </div>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                {sourceInsight.evidence && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{sourceInsight.evidence}</p>
                )}
              </div>
            </section>
          )}

          {/* Related Personas */}
          {relatedPersonas.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Impacted Personas ({relatedPersonas.length})
              </h3>
              <div className="space-y-3">
                {relatedPersonas.map(persona => (
                  <Link
                    key={persona.id}
                    to={`/personas/${persona.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{persona.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{persona.tagline}</p>
                      </div>
                      <FiArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    {persona.prevalence && (
                      <p className="text-xs text-gray-500 mt-2">{persona.prevalence}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionDetailModal;
```

#### Update ActionCenter.jsx:
```jsx
// Add at top
import { useState } from 'react';
import ActionDetailModal from '../components/actions/ActionDetailModal';
import { useQuery } from '@tanstack/react-query';
import { insightsAPI } from '../api/insights';
import { personasAPI } from '../api/personas';

// Add state
const [selectedAction, setSelectedAction] = useState(null);

// Add queries for related data
const { data: allInsights } = useQuery({
  queryKey: ['insights-all'],
  queryFn: () => insightsAPI.listAll(),
});

const { data: allPersonas } = useQuery({
  queryKey: ['personas-all'],
  queryFn: () => personasAPI.listAll(),
});

// Calculate related items when action is selected
const sourceInsight = selectedAction && allInsights?.insights
  ? allInsights.insights.find(i => i.id === selectedAction.sourceInsight)
  : null;

const relatedPersonas = selectedAction && sourceInsight && allPersonas?.personas
  ? allPersonas.personas.filter(p => 
      p.supportingInsights?.includes(sourceInsight.id)
    )
  : [];

// Update card onClick
<div 
  key={action.id} 
  className="card hover:shadow-md transition-shadow cursor-pointer"
  onClick={() => setSelectedAction(action)}
>
  {/* existing card content */}
</div>

// Add modal at end of component
{selectedAction && (
  <ActionDetailModal
    action={selectedAction}
    sourceInsight={sourceInsight}
    relatedPersonas={relatedPersonas}
    onClose={() => setSelectedAction(null)}
  />
)}
```

---

### **Day 5: Persona Detail Enhancements**

#### Update PersonaDetail.jsx:

Add clickable insight badges that link to filtered insights:

```jsx
// In the section showing supporting insights
<div className="mb-4">
  <h3 className="text-sm font-medium text-gray-500 mb-2">Supporting Insights</h3>
  <div className="flex flex-wrap gap-2">
    {persona.supportingInsights?.map(insightId => (
      <Link
        key={insightId}
        to={`/insights?ids=${insightId}`}
        className="badge bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
      >
        {insightId}
      </Link>
    )) || <span className="text-sm text-gray-400">No insights linked</span>}
  </div>
  
  {/* Add "View All" button if multiple insights */}
  {persona.supportingInsights && persona.supportingInsights.length > 1 && (
    <Link
      to={`/insights?ids=${persona.supportingInsights.join(',')}`}
      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2"
    >
      View all {persona.supportingInsights.length} insights →
    </Link>
  )}
</div>
```

---

### **Day 6: Cross-Modal Navigation**

#### Enable Modal Chaining:

Update both modals to support opening the other modal:

```jsx
// In InsightDetailModal - when clicking related action
onClick={() => {
  onClose(); // Close current modal
  // Trigger action modal (pass callback from parent)
  if (onViewAction) onViewAction(action);
}}

// In ActionDetailModal - when clicking source insight
onClick={() => {
  onClose(); // Close current modal
  // Trigger insight modal (pass callback from parent)
  if (onViewInsight) onViewInsight(sourceInsight);
}}
```

Update parent components to handle modal chaining:

```jsx
// In InsightsExplorer.jsx
const [selectedInsight, setSelectedInsight] = useState(null);
const [selectedAction, setSelectedAction] = useState(null);

const handleViewAction = (action) => {
  setSelectedAction(action);
};

{selectedInsight && (
  <InsightDetailModal
    insight={selectedInsight}
    relatedActions={relatedActions}
    relatedPersonas={relatedPersonas}
    onClose={() => setSelectedInsight(null)}
    onViewAction={handleViewAction}
  />
)}

{selectedAction && (
  <ActionDetailModal
    action={selectedAction}
    sourceInsight={sourceInsight}
    relatedPersonas={actionRelatedPersonas}
    onClose={() => setSelectedAction(null)}
    onViewInsight={setSelectedInsight}
  />
)}
```

---

### **Day 7: Testing & Polish**

#### Testing Checklist:

**Insight Modal:**
- [ ] Opens when clicking insight card
- [ ] Displays all fields correctly
- [ ] Shows related actions (if any)
- [ ] Shows related personas (if any)
- [ ] Closes with X button
- [ ] Closes with ESC key
- [ ] Closes when clicking backdrop
- [ ] Links to personas work
- [ ] Scrolls correctly when content is long
- [ ] Responsive on mobile

**Action Modal:**
- [ ] Opens when clicking action card
- [ ] Displays all fields correctly
- [ ] Shows source insight (if available)
- [ ] Shows related personas (if any)
- [ ] Closes with X button
- [ ] Closes with ESC key
- [ ] Closes when clicking backdrop
- [ ] Links work correctly
- [ ] Scrolls correctly when content is long
- [ ] Responsive on mobile

**Persona Detail:**
- [ ] Insight badges are clickable
- [ ] Links navigate to filtered insights
- [ ] URL params are correctly set
- [ ] Back navigation works

**Cross-Navigation:**
- [ ] Can navigate from insight → action → persona
- [ ] Can navigate from action → insight → persona
- [ ] Modal chaining works smoothly
- [ ] No console errors

#### Polish Items:

1. **Add keyboard shortcuts:**
```jsx
// In modal components
useEffect(() => {
  const handleEsc = (e) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, [onClose]);
```

2. **Add loading states:**
```jsx
{isLoadingRelatedData ? (
  <div className="text-center py-4">
    <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    <p className="text-sm text-gray-500 mt-2">Loading related items...</p>
  </div>
) : (
  // Related items content
)}
```

3. **Add empty states:**
```jsx
{relatedActions.length === 0 && (
  <div className="text-center py-6 bg-gray-50 rounded-lg">
    <FiTarget className="w-12 h-12 text-gray-300 mx-auto mb-2" />
    <p className="text-sm text-gray-500">No actions linked to this insight yet</p>
  </div>
)}
```

4. **Add animations:**
```css
/* In your CSS */
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## 📁 File Structure Summary

```
ui/src/
├── components/
│   ├── insights/
│   │   ├── InsightCard.jsx (existing)
│   │   └── InsightDetailModal.jsx (NEW)
│   ├── actions/
│   │   ├── ActionCard.jsx (existing)
│   │   └── ActionDetailModal.jsx (NEW)
│   └── shared/
│       └── (existing components)
├── pages/
│   ├── InsightsExplorer.jsx (MODIFY)
│   ├── ActionCenter.jsx (MODIFY)
│   └── PersonaDetail.jsx (MODIFY)
└── api/
    ├── insights.js (existing)
    ├── actions.js (existing)
    └── personas.js (existing)
```

---

## 🎯 Success Criteria

### By End of Week:

✅ **Functional:**
- [x] All insight cards are clickable
- [x] All action cards are clickable
- [x] Detail modals show all available data
- [x] Related items (actions/personas/insights) are visible
- [x] Cross-links work correctly

✅ **UX:**
- [x] Modals are responsive on mobile
- [x] Can close modals with X, ESC, or backdrop click
- [x] Smooth animations and transitions
- [x] Loading states for related data
- [x] Empty states when no related items

✅ **Code Quality:**
- [x] No console errors
- [x] Components are reusable
- [x] Code is documented
- [x] Follows existing patterns

---

## 🚫 Out of Scope (Phase 2)

These features are NOT included in MVP but can be added later:

- ❌ Editing action status inline
- ❌ Interactive milestone checklists
- ❌ CSAT/NPS metrics integration
- ❌ API endpoints for linkages (using client-side filtering for MVP)
- ❌ Relationship visualization graphs
- ❌ Advanced filtering within modals
- ❌ Commenting or notes on insights/actions
- ❌ Sharing or exporting individual insights/actions

---

## 🛠️ Quick Start

### Step 1: Create Components (Day 1-4)
```bash
# Create directories
mkdir -p ui/src/components/insights
mkdir -p ui/src/components/actions

# Create files
touch ui/src/components/insights/InsightDetailModal.jsx
touch ui/src/components/actions/ActionDetailModal.jsx
```

### Step 2: Install Dependencies (if needed)
```bash
cd ui
npm install  # All required packages should already be installed
```

### Step 3: Update Pages (Day 5-6)
- Modify `InsightsExplorer.jsx`
- Modify `ActionCenter.jsx`
- Modify `PersonaDetail.jsx`

### Step 4: Test (Day 7)
```bash
npm run dev
# Click through all interactions
# Test on different screen sizes
# Check for console errors
```

---

## 📊 Expected User Flow

### Scenario 1: Insight → Action → Persona
```
1. User opens Insights Explorer
2. Clicks "Absence of Apple Pay" insight
3. Modal opens showing:
   - Full evidence
   - Related action: "Integrate Apple Pay"
   - Related persona: "Mobile-First Maya"
4. Clicks "Integrate Apple Pay" action
5. Action modal opens showing:
   - Full description
   - Source insight (clickable back)
   - Milestones and success metrics
6. Clicks "Mobile-First Maya" persona
7. Navigates to persona detail page
8. Sees supporting insights as clickable badges
```

### Scenario 2: Action → Insight
```
1. User opens Action Center
2. Clicks "Integrate Apple Pay" action
3. Modal opens showing source insight
4. Clicks source insight card
5. Insight modal opens
6. Can see this insight generated 1 action
```

### Scenario 3: Persona → Insights → Actions
```
1. User viewing persona "Mobile-First Maya"
2. Sees supporting insights: voc-006, voc-015, voc-018
3. Clicks "voc-006" badge
4. Navigates to Insights Explorer filtered to voc-006
5. Clicks insight card
6. Modal shows related action
7. Can drill into action details
```

---

## 💡 Tips & Best Practices

### 1. **Reuse Constants**
```jsx
// Use existing utility constants
import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';
```

### 2. **Handle Missing Data**
```jsx
// Always check for null/undefined
{action.description && (
  <section>...</section>
)}
```

### 3. **Prevent Click Propagation**
```jsx
// In modal content
onClick={(e) => e.stopPropagation()}
```

### 4. **Use Semantic HTML**
```jsx
// Use proper ARIA labels
<button
  onClick={onClose}
  aria-label="Close modal"
>
  <FiX />
</button>
```

### 5. **Optimize Performance**
```jsx
// Only load related data when modal is open
{selectedInsight && (
  <InsightDetailModal ... />
)}
```

---

## 🎉 What You'll Have After 1 Week

✅ **Clickable Insights** - Every insight card opens a detailed modal  
✅ **Clickable Actions** - Every action card opens a detailed modal  
✅ **Cross-Links** - Navigate between insights, actions, and personas  
✅ **Better UX** - Users can explore relationships without leaving the page  
✅ **Foundation** - Ready for Phase 2 enhancements (status updates, metrics)

---

## 📞 Need Help?

**Common Issues:**

1. **Modal not closing?** Check ESC key handler and backdrop click
2. **Related items not showing?** Check filtering logic and data structure
3. **Links not working?** Verify URL params and React Router setup
4. **Performance slow?** Consider memoizing filtered arrays with `useMemo`

**Next Steps After MVP:**
- Add action status update functionality
- Integrate CSAT/NPS metrics
- Add interactive milestone checklists
- Create relationship visualization
- Add API endpoints for better performance

---

**Ready to implement? Start with Day 1-2 and iterate!** 🚀
