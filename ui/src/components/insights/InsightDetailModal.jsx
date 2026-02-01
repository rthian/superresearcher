import { useEffect, useState } from 'react';
import { FiX, FiArrowRight, FiUser, FiTarget, FiDownload, FiShare2, FiChevronLeft, FiPrinter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { CATEGORY_COLORS, PRIORITY_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

function InsightDetailModal({ insight, onClose, relatedActions = [], relatedPersonas = [], onViewAction, navigationHistory = [] }) {
  const [actionFilter, setActionFilter] = useState('all');

  // Filtered related actions
  const filteredActions = actionFilter === 'all' 
    ? relatedActions 
    : relatedActions.filter(a => a.priority === actionFilter);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Export functions
  const exportAsJSON = () => {
    const data = {
      ...insight,
      relatedActions: relatedActions.map(a => ({ id: a.id, title: a.title })),
      relatedPersonas: relatedPersonas.map(p => ({ id: p.id, name: p.name }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insight-${insight.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  };

  const exportAsMarkdown = () => {
    const md = `# ${insight.title}

**Category:** ${insight.category}  
**Impact:** ${insight.impactLevel}  
**Confidence:** ${insight.confidenceLevel}  
**Organization:** ${insight.organization || 'N/A'}  
**Project:** ${insight.projectSlug}

## Evidence

${insight.evidence}

${insight.recommendedActions ? `## Recommended Actions\n\n${insight.recommendedActions}` : ''}

${relatedActions.length > 0 ? `## Linked Actions (${relatedActions.length})\n\n${relatedActions.map(a => `- [${a.priority}] ${a.title}`).join('\n')}` : ''}

${relatedPersonas.length > 0 ? `## Related Personas (${relatedPersonas.length})\n\n${relatedPersonas.map(p => `- ${p.name}`).join('\n')}` : ''}

---
*Exported from SuperResearcher on ${new Date().toLocaleDateString()}*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insight-${insight.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  const copyLink = () => {
    const url = `${window.location.origin}/insights?ids=${insight.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          {/* Breadcrumb Trail */}
          {navigationHistory.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
                Back
              </button>
              <span>•</span>
              <div className="flex items-center gap-2">
                {navigationHistory.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="text-gray-400">{item.type === 'insight' ? '💡' : '🎯'}</span>
                    <span className="truncate max-w-[150px]">{item.title}</span>
                    {idx < navigationHistory.length - 1 && <span className="text-gray-300">→</span>}
                  </span>
                ))}
                <span className="text-gray-300">→</span>
                <span className="text-primary-600 font-medium">Current</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between">
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
              className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
              aria-label="Close"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
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
          {relatedActions.length > 0 ? (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiTarget className="w-5 h-5" />
                  Linked Actions ({relatedActions.length})
                </h3>
                {relatedActions.length > 1 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActionFilter('all')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        actionFilter === 'all'
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActionFilter('Critical')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        actionFilter === 'Critical'
                          ? 'bg-red-100 text-red-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Critical
                    </button>
                    <button
                      onClick={() => setActionFilter('High')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        actionFilter === 'High'
                          ? 'bg-orange-100 text-orange-700 font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      High
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {filteredActions.length > 0 ? filteredActions.map(action => (
                  <div 
                    key={action.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => onViewAction && onViewAction(action)}
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
                      {action.department && (
                        <span className="text-gray-600">
                          {action.department}
                        </span>
                      )}
                      {action.effort && (
                        <span className="text-gray-500">
                          {action.effort}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500">No {actionFilter} priority actions</p>
                    <button
                      onClick={() => setActionFilter('all')}
                      className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                    >
                      Show all actions
                    </button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiTarget className="w-5 h-5" />
                Linked Actions
              </h3>
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <FiTarget className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No actions linked to this insight yet</p>
              </div>
            </section>
          )}

          {/* Related Personas */}
          {relatedPersonas.length > 0 ? (
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
                    className="block border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                    onClick={onClose}
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
          ) : (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Related Personas
              </h3>
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No personas reference this insight yet</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 print:hidden">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-xs text-gray-500 hidden md:flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">←</kbd>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">→</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd>
                <span>Close</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copy shareable link"
            >
              <FiShare2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={exportAsJSON}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export as JSON"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={exportAsMarkdown}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Export as Markdown"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Markdown</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Print"
            >
              <FiPrinter className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightDetailModal;
