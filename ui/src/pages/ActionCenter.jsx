import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { actionsAPI } from '../api/actions';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import { FiDownload } from 'react-icons/fi';
import { exportActions } from '../utils/export';
import toast from 'react-hot-toast';

function ActionCenter() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const { data, isLoading } = useQuery({
    queryKey: ['actions-all'],
    queryFn: () => actionsAPI.listAll(),
  });

  const actions = data?.actions || [];

  // Filter actions
  let filteredActions = [...actions];
  
  if (filterStatus !== 'all') {
    filteredActions = filteredActions.filter(a => a.status === filterStatus);
  }
  
  if (filterOrganization !== 'all') {
    filteredActions = filteredActions.filter(a => a.organization === filterOrganization);
  }

  const statuses = ['all', 'Not Started', 'In Progress', 'Blocked', 'Complete'];
  const organizations = ['all', ...new Set(actions.map(a => a.organization).filter(Boolean))];

  const handleExport = () => {
    if (filteredActions.length === 0) {
      toast.error('No actions to export');
      return;
    }
    exportActions(filteredActions, `actions-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Actions exported to CSV');
  };

  if (isLoading) {
    return <div className="text-gray-500">Loading actions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Action Center</h1>
          <p className="mt-2 text-gray-600">{filteredActions.length} actions</p>
        </div>
        
        <button
          onClick={handleExport}
          className="btn btn-secondary flex items-center gap-2"
        >
          <FiDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        {/* Organization Filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm">🏢 Organization</h3>
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <button
                key={org}
                onClick={() => setFilterOrganization(org)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterOrganization === org
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {org === 'all' ? 'All Organizations' : org}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Status</h3>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Statuses' : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredActions.map((action) => (
          <div key={action.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                {action.organization && (
                  <span className="badge bg-blue-100 text-blue-800 font-semibold text-xs mt-1">
                    🏢 {action.organization}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <span className={`badge ${PRIORITY_COLORS[action.priority]}`}>
                  {action.priority}
                </span>
                <span className={`badge ${STATUS_COLORS[action.status]}`}>
                  {action.status}
                </span>
              </div>
            </div>
            
            {action.description && (
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 text-sm">
              {action.department && (
                <span className="text-gray-600">
                  <span className="font-medium">Department:</span> {action.department}
                </span>
              )}
              {action.effort && (
                <span className="text-gray-600">
                  <span className="font-medium">Effort:</span> {action.effort}
                </span>
              )}
              <span className="text-gray-500">
                Project: {action.projectSlug}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActionCenter;

