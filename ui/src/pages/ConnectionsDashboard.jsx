import { useQuery } from '@tanstack/react-query';
import { insightsAPI } from '../api/insights';
import { actionsAPI } from '../api/actions';
import { personasAPI } from '../api/personas';
import { FiAlertCircle, FiCheckCircle, FiLink, FiTarget, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function ConnectionsDashboard() {
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['insights-all'],
    queryFn: () => insightsAPI.listAll(),
  });

  const { data: actionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ['actions-all'],
    queryFn: () => actionsAPI.listAll(),
  });

  const { data: personasData, isLoading: personasLoading } = useQuery({
    queryKey: ['personas-all'],
    queryFn: () => personasAPI.listAll(),
  });

  if (insightsLoading || actionsLoading || personasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading connection data...</div>
      </div>
    );
  }

  const insights = insightsData?.insights || [];
  const actions = actionsData?.actions || [];
  const personas = personasData?.personas || [];

  // Calculate connection statistics
  const orphanedInsights = insights.filter(insight => {
    const hasActions = actions.some(a => a.sourceInsight === insight.id);
    const hasPersonas = personas.some(p => p.supportingInsights?.includes(insight.id));
    return !hasActions && !hasPersonas;
  });

  const orphanedActions = actions.filter(action => !action.sourceInsight);

  const orphanedPersonas = personas.filter(persona => 
    !persona.supportingInsights || persona.supportingInsights.length === 0
  );

  const wellConnectedInsights = insights.filter(insight => {
    const actionCount = actions.filter(a => a.sourceInsight === insight.id).length;
    const personaCount = personas.filter(p => p.supportingInsights?.includes(insight.id)).length;
    return actionCount > 0 && personaCount > 0;
  });

  const connectionHealth = insights.length > 0 
    ? Math.round((wellConnectedInsights.length / insights.length) * 100)
    : 0;

  // Most connected insight
  const insightConnections = insights.map(insight => ({
    insight,
    actionCount: actions.filter(a => a.sourceInsight === insight.id).length,
    personaCount: personas.filter(p => p.supportingInsights?.includes(insight.id)).length,
    totalConnections: actions.filter(a => a.sourceInsight === insight.id).length + 
                     personas.filter(p => p.supportingInsights?.includes(insight.id)).length
  })).sort((a, b) => b.totalConnections - a.totalConnections);

  const mostConnected = insightConnections[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Connection Health</h1>
        <p className="text-gray-600 mt-2">
          See how your insights, actions, and personas are connected
        </p>
      </div>

      {/* Health Score */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Overall Connection Health
            </h2>
            <p className="text-sm text-gray-600">
              Percentage of insights with both actions and personas
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary-600">{connectionHealth}%</div>
            <div className="text-sm text-gray-500 mt-1">
              {wellConnectedInsights.length}/{insights.length} insights
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orphaned Insights */}
        <div className="card border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FiAlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Orphaned Insights</h3>
              <p className="text-sm text-gray-600">No actions or personas</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">{orphanedInsights.length}</div>
          {orphanedInsights.length > 0 && (
            <Link
              to={`/insights?category=${orphanedInsights[0]?.category || 'all'}`}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View orphaned insights →
            </Link>
          )}
        </div>

        {/* Orphaned Actions */}
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTarget className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Unlinked Actions</h3>
              <p className="text-sm text-gray-600">No source insight</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">{orphanedActions.length}</div>
          {orphanedActions.length > 0 && (
            <Link
              to="/actions"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View unlinked actions →
            </Link>
          )}
        </div>

        {/* Orphaned Personas */}
        <div className="card border-purple-200 bg-purple-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiUser className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Unsupported Personas</h3>
              <p className="text-sm text-gray-600">No supporting insights</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">{orphanedPersonas.length}</div>
          {orphanedPersonas.length > 0 && (
            <Link
              to="/personas"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View unsupported personas →
            </Link>
          )}
        </div>
      </div>

      {/* Well Connected Insights */}
      {wellConnectedInsights.length > 0 && (
        <div className="card border-green-200 bg-green-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Well-Connected Insights ({wellConnectedInsights.length})
              </h3>
              <p className="text-sm text-gray-600">
                These insights have both actions and personas
              </p>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {wellConnectedInsights.slice(0, 10).map(insight => {
              const actionCount = actions.filter(a => a.sourceInsight === insight.id).length;
              const personaCount = personas.filter(p => p.supportingInsights?.includes(insight.id)).length;
              
              return (
                <Link
                  key={insight.id}
                  to={`/insights?ids=${insight.id}`}
                  className="block p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <div className="flex gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <FiTarget className="w-3 h-3" />
                          {actionCount} action{actionCount !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          {personaCount} persona{personaCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <FiLink className="w-4 h-4 text-green-600" />
                  </div>
                </Link>
              );
            })}
          </div>
          {wellConnectedInsights.length > 10 && (
            <div className="text-sm text-gray-500 text-center mt-3">
              + {wellConnectedInsights.length - 10} more well-connected insights
            </div>
          )}
        </div>
      )}

      {/* Most Connected */}
      {mostConnected && mostConnected.totalConnections > 0 && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiLink className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Most Connected Insight</h3>
              <p className="text-sm text-gray-600">Highest number of connections</p>
            </div>
          </div>
          <Link
            to={`/insights?ids=${mostConnected.insight.id}`}
            className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <h4 className="font-medium text-gray-900 mb-2">{mostConnected.insight.title}</h4>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-2 text-primary-600">
                <FiTarget className="w-4 h-4" />
                <span className="font-semibold">{mostConnected.actionCount}</span> actions
              </span>
              <span className="flex items-center gap-2 text-purple-600">
                <FiUser className="w-4 h-4" />
                <span className="font-semibold">{mostConnected.personaCount}</span> personas
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <FiLink className="w-4 h-4" />
                <span className="font-semibold">{mostConnected.totalConnections}</span> total
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Orphaned Items Details */}
      {orphanedInsights.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Orphaned Insights Need Attention
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {orphanedInsights.slice(0, 15).map(insight => (
              <Link
                key={insight.id}
                to={`/insights?ids=${insight.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {insight.category} • {insight.projectSlug}
                    </p>
                  </div>
                  <span className="badge bg-orange-100 text-orange-800 text-xs">
                    No connections
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {orphanedInsights.length > 15 && (
            <div className="text-sm text-gray-500 text-center mt-3">
              + {orphanedInsights.length - 15} more orphaned insights
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConnectionsDashboard;
