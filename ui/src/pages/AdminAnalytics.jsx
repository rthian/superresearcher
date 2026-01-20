import { useQuery } from '@tanstack/react-query';
import { csatAPI } from '../api/csat';

function AdminAnalytics() {
  const { data: aggregates, isLoading } = useQuery({
    queryKey: ['csat-aggregates'],
    queryFn: () => csatAPI.getAggregates(),
  });

  const { data: verbatims } = useQuery({
    queryKey: ['csat-verbatims'],
    queryFn: () => csatAPI.getVerbatims(20),
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading analytics...</div>;
  }

  const stats = aggregates?.aggregates || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
        <p className="mt-2 text-gray-600">CSAT metrics and platform health</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Overall CSAT</p>
          <p className="text-3xl font-bold text-gray-900">{stats.averageCSAT?.toFixed(1) || '0.0'}/5.0</p>
          <p className="text-sm text-gray-500 mt-1">⭐⭐⭐⭐⭐</p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">NPS Score</p>
          <p className="text-3xl font-bold text-gray-900">+{stats.npsScore || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Net Promoter Score</p>
        </div>
        
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Total Responses</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalResponses || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Survey submissions</p>
        </div>
      </div>

      {/* By Role */}
      {stats.byRole && Object.keys(stats.byRole).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">CSAT by Role</h2>
          <div className="space-y-3">
            {Object.entries(stats.byRole).map(([role, data]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{role}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{data.count} responses</span>
                  <span className="font-bold text-primary-600">{data.avgCSAT?.toFixed(1)}/5.0</span>
                  <span className="text-sm text-gray-600">NPS: +{data.nps}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Verbatims */}
      {verbatims?.verbatims && verbatims.verbatims.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {verbatims.verbatims.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 mb-2">"{item.feedback}"</p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{item.role}</span>
                  <span>•</span>
                  <span>CSAT: {item.score}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;

