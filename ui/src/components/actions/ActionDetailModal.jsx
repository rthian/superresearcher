import { useEffect, useState } from 'react';
import { FiX, FiArrowRight, FiUser, FiZap, FiCheckCircle, FiDownload, FiShare2, FiChevronLeft, FiEdit2, FiSave, FiPrinter } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { PRIORITY_COLORS, STATUS_COLORS, ACTION_STATUSES, PRIORITIES } from '../../utils/constants';
import { actionsAPI } from '../../api/actions';
import toast from 'react-hot-toast';

function ActionDetailModal({ action, onClose, sourceInsight = null, relatedPersonas = [], onViewInsight, navigationHistory = [], onActionUpdate }) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [localStatus, setLocalStatus] = useState(action.status);
  const [localPriority, setLocalPriority] = useState(action.priority);
  const [isSaving, setIsSaving] = useState(false);
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
      ...action,
      sourceInsight: sourceInsight ? { id: sourceInsight.id, title: sourceInsight.title } : null,
      relatedPersonas: relatedPersonas.map(p => ({ id: p.id, name: p.name }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-${action.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  };

  const exportAsMarkdown = () => {
    const md = `# ${action.title}

**Priority:** ${action.priority}  
**Status:** ${action.status}  
**Department:** ${action.department || 'N/A'}  
**Owner:** ${action.owner || 'N/A'}  
**Effort:** ${action.effort || 'N/A'}  
**Impact:** ${action.impact || 'N/A'}  
**Organization:** ${action.organization || 'N/A'}  
**Project:** ${action.projectSlug}

## Description

${action.description || 'No description provided.'}

${action.prerequisites && action.prerequisites.length > 0 ? `## Prerequisites\n\n${action.prerequisites.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

${action.milestones && action.milestones.length > 0 ? `## Milestones\n\n${action.milestones.map((m, i) => `${i + 1}. ${m}`).join('\n')}` : ''}

${action.successMetrics ? `## Success Metrics\n\n${action.successMetrics}` : ''}

${sourceInsight ? `## Source Insight\n\n- **${sourceInsight.title}** (${sourceInsight.id})` : ''}

${relatedPersonas.length > 0 ? `## Impacted Personas (${relatedPersonas.length})\n\n${relatedPersonas.map(p => `- ${p.name}`).join('\n')}` : ''}

---
*Exported from SuperResearcher on ${new Date().toLocaleDateString()}*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `action-${action.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  const copyLink = () => {
    const url = `${window.location.origin}/actions?action=${action.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const saveStatus = async () => {
    setIsSaving(true);
    try {
      await actionsAPI.update(action.id, { projectSlug: action.projectSlug, status: localStatus });
      toast.success('Status updated successfully!');
      setIsEditingStatus(false);
      if (onActionUpdate) {
        onActionUpdate({ ...action, status: localStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const savePriority = async () => {
    setIsSaving(true);
    try {
      await actionsAPI.update(action.id, { projectSlug: action.projectSlug, priority: localPriority });
      toast.success('Priority updated successfully!');
      setIsEditingPriority(false);
      if (onActionUpdate) {
        onActionUpdate({ ...action, priority: localPriority });
      }
    } catch (error) {
      toast.error('Failed to update priority');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
                {action.title}
              </h2>
              <div className="flex flex-wrap gap-2 items-center">
                {action.organization && (
                  <span className="badge bg-blue-100 text-blue-800 font-semibold">
                    🏢 {action.organization}
                  </span>
                )}
                
                {/* Priority - Inline Editable */}
                {isEditingPriority ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-2 py-1">
                    <select
                      value={localPriority}
                      onChange={(e) => setLocalPriority(e.target.value)}
                      className="text-sm border-none focus:ring-0 pr-8"
                      disabled={isSaving}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button
                      onClick={savePriority}
                      disabled={isSaving}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Save"
                    >
                      <FiSave className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPriority(false);
                        setLocalPriority(action.priority);
                      }}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancel"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingPriority(true)}
                    className={`badge ${PRIORITY_COLORS[action.priority]} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all group flex items-center gap-1`}
                  >
                    {action.priority} Priority
                    <FiEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                
                {/* Status - Inline Editable */}
                {isEditingStatus ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 px-2 py-1">
                    <select
                      value={localStatus}
                      onChange={(e) => setLocalStatus(e.target.value)}
                      className="text-sm border-none focus:ring-0 pr-8"
                      disabled={isSaving}
                    >
                      {ACTION_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={saveStatus}
                      disabled={isSaving}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Save"
                    >
                      <FiSave className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingStatus(false);
                        setLocalStatus(action.status);
                      }}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Cancel"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className={`badge ${STATUS_COLORS[action.status]} hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 transition-all group flex items-center gap-1`}
                  >
                    {action.status}
                    <FiEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
                
                {action.department && (
                  <span className="badge bg-gray-100 text-gray-800">
                    🔧 {action.department}
                  </span>
                )}
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
          {sourceInsight ? (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiZap className="w-5 h-5" />
                Source Insight
              </h3>
              <div 
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onViewInsight && onViewInsight(sourceInsight)}
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
          ) : action.sourceInsight ? (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiZap className="w-5 h-5" />
                Source Insight
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Source Insight ID:</span> {action.sourceInsight}
                </p>
              </div>
            </section>
          ) : null}

          {/* Related Personas */}
          {relatedPersonas.length > 0 ? (
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
                Impacted Personas
              </h3>
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <FiUser className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No personas linked to this action yet</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 print:hidden">
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
  );
}

export default ActionDetailModal;
