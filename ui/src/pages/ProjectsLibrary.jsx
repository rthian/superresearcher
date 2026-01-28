import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/projects';
import { FiFolder, FiCalendar, FiMessageSquare, FiZap, FiCheckSquare, FiArchive, FiRefreshCw } from 'react-icons/fi';
import { formatRelativeTime } from '../utils/helpers';
import toast from 'react-hot-toast';

function ProjectsLibrary() {
  const [showArchived, setShowArchived] = useState(false);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['projects', showArchived],
    queryFn: () => projectsAPI.list(showArchived),
  });

  const archiveMutation = useMutation({
    mutationFn: (slug) => projectsAPI.archive(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project archived successfully');
    },
    onError: () => {
      toast.error('Failed to archive project');
    }
  });

  const unarchiveMutation = useMutation({
    mutationFn: (slug) => projectsAPI.unarchive(slug),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project unarchived successfully');
    },
    onError: () => {
      toast.error('Failed to unarchive project');
    }
  });

  const handleArchive = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to archive this project? You can unarchive it later.')) {
      archiveMutation.mutate(slug);
    }
  };

  const handleUnarchive = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    unarchiveMutation.mutate(slug);
  };

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
          <p className="mt-2 text-gray-600">
            {showArchived ? `${projects.length} archived projects` : `${projects.length} active projects`}
          </p>
        </div>
        
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FiArchive className="w-4 h-4" />
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FiFolder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600">Create your first research study to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const isArchived = project.status === 'Archived' || project.archived === true;
            
            return (
              <div
                key={project.slug}
                className={`card hover:shadow-md transition-shadow ${isArchived ? 'opacity-75 bg-gray-50' : ''}`}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        {isArchived && (
                          <FiArchive className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          isArchived 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.type}
                        </span>
                        {project.organization && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                            🏢 {project.organization}
                          </span>
                        )}
                        {isArchived && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700">
                            Archived
                          </span>
                        )}
                      </div>
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
                
                {/* Archive/Unarchive Button */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {isArchived ? (
                    <button
                      onClick={(e) => handleUnarchive(e, project.slug)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={unarchiveMutation.isLoading}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      {unarchiveMutation.isLoading ? 'Unarchiving...' : 'Unarchive Project'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleArchive(e, project.slug)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={archiveMutation.isLoading}
                    >
                      <FiArchive className="w-4 h-4" />
                      {archiveMutation.isLoading ? 'Archiving...' : 'Archive Project'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProjectsLibrary;

