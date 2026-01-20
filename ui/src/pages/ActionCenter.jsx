import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { actionsAPI } from '../api/actions';
import { STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants';
import { FiDownload } from 'react-icons/fi';
import { exportActions } from '../utils/export';
import toast from 'react-hot-toast';

function ActionCenter() {
  const [filterStatus, setFilterStatus] = useState('all');
  const { data, isLoading } = useQuery({
    queryKey: ['actions-all'],
    queryFn: () => actionsAPI.listAll(),
  });

  const actions = data?.actions || [];

  // Filter actions
  const filteredActions = filterStatus === 'all'
    ? actions
    : actions.filter(a => a.status === filterStatus);

  const statuses = ['all', 'Not Started', 'In Progress', 'Blocked', 'Complete'];

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

      {/* Status Filter */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredActions.map((action) => (
          <div key={action.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 flex-1">{action.title}</h3>
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

