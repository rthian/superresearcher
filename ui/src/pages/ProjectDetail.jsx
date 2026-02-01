import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { useState } from 'react';

function ProjectDetail() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsAPI.get(slug),
  });

  const { data: insights } = useQuery({
    queryKey: ['project-insights', slug],
    queryFn: () => projectsAPI.getInsights(slug),
  });

  const { data: actions } = useQuery({
    queryKey: ['project-actions', slug],
    queryFn: () => projectsAPI.getActions(slug),
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: `Insights (${insights?.insights?.length || 0})` },
    { id: 'actions', label: `Actions (${actions?.actions?.length || 0})` },
    { id: 'context', label: 'Context' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
        <p className="mt-2 text-gray-600">{project?.type} Study</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Study Metadata</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{project?.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(project?.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights?.insights?.map((insight) => (
              <div key={insight.id} className="card">
                <h3 className="font-medium text-gray-900">{insight.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="badge bg-blue-100 text-blue-800">{insight.category}</span>
                  <span className="badge bg-red-100 text-red-800">
                    Impact: {insight.impactLevel}
                  </span>
                </div>
              </div>
            )) || <p className="text-gray-500">No insights yet</p>}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            {actions?.actions?.map((action) => (
              <div key={action.id} className="card">
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{action.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge bg-orange-100 text-orange-800">{action.priority}</span>
                  <span className="badge bg-gray-100 text-gray-800">{action.status}</span>
                </div>
              </div>
            )) || <p className="text-gray-500">No actions yet</p>}
          </div>
        )}

        {activeTab === 'context' && (
          <div className="card">
            <h3 className="font-semibold mb-4">Study Context</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {project?.studyMetadata || 'No context available'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;

