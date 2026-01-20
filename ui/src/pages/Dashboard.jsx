import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../api/stats';
import { FiFolder, FiZap, FiCheckSquare, FiUsers } from 'react-icons/fi';

// Static color mapping for Tailwind CSS
const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
};

function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsAPI.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Projects', value: stats?.totalProjects || 0, icon: FiFolder, color: 'blue' },
    { label: 'Insights', value: stats?.totalInsights || 0, icon: FiZap, color: 'yellow' },
    { label: 'Actions', value: stats?.totalActions || 0, icon: FiCheckSquare, color: 'green' },
    { label: 'Personas', value: stats?.totalPersonas || 0, icon: FiUsers, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your research insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const colors = colorClasses[stat.color] || colorClasses.blue;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center">
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{activity.project}</p>
                    <p className="text-gray-600">{activity.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        {/* High-Impact Insights */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">High-Impact Insights</h2>
          <div className="space-y-3">
            {stats?.highImpactInsights?.length > 0 ? (
              stats.highImpactInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 text-sm">{insight.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge bg-red-100 text-red-800">High Impact</span>
                    <span className="text-xs text-gray-500">{insight.projectSlug}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No high-impact insights yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions by Status */}
      {stats?.actionsByStatus && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.actionsByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600 mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

