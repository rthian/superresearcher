import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { FiFolder, FiCalendar, FiMessageSquare, FiZap, FiCheckSquare } from 'react-icons/fi';
import { formatRelativeTime } from '../utils/helpers';

function ProjectsLibrary() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.list(),
  });

  const projects = data?.projects || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Browse and manage research studies</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600">Create your first research study to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.slug}
              to={`/projects/${project.slug}`}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    {project.type}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiZap className="w-4 h-4" />
                  <span>{project.metrics?.insights || 0} insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCheckSquare className="w-4 h-4" />
                  <span>{project.metrics?.actions || 0} actions</span>
                </div>
                {project.metrics?.feedbackOpen > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{project.metrics.feedbackOpen} open feedback</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiCalendar className="w-3 h-3" />
                  <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsLibrary;

