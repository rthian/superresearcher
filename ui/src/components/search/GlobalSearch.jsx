import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiX } from 'react-icons/fi';
import { projectsAPI } from '../../api/projects';
import { insightsAPI } from '../../api/insights';
import { actionsAPI } from '../../api/actions';

function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], insights: [], actions: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all data for search
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.list(),
    enabled: isOpen,
  });

  const { data: insightsData } = useQuery({
    queryKey: ['insights-all'],
    queryFn: () => insightsAPI.listAll(),
    enabled: isOpen,
  });

  const { data: actionsData } = useQuery({
    queryKey: ['actions-all'],
    queryFn: () => actionsAPI.listAll(),
    enabled: isOpen,
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], insights: [], actions: [] });
      return;
    }

    const searchTerm = query.toLowerCase();
    
    const filteredProjects = (projectsData || [])
      .filter(p => 
        p.name?.toLowerCase().includes(searchTerm) ||
        p.slug?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5);

    const filteredInsights = (insightsData?.insights || [])
      .filter(i => 
        i.title?.toLowerCase().includes(searchTerm) ||
        i.evidence?.toLowerCase().includes(searchTerm) ||
        i.category?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8);

    const filteredActions = (actionsData?.actions || [])
      .filter(a => 
        a.title?.toLowerCase().includes(searchTerm) ||
        a.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 5);

    setResults({
      projects: filteredProjects,
      insights: filteredInsights,
      actions: filteredActions,
    });
  }, [query, projectsData, insightsData, actionsData]);

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  const totalResults = results.projects.length + results.insights.length + results.actions.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 p-4">
            <FiSearch className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects, insights, actions..."
              className="flex-1 outline-none text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="p-8 text-center text-gray-500">
                <FiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start typing to search...</p>
                <p className="text-sm mt-2">Search across projects, insights, and actions</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Projects */}
                {results.projects.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Projects ({results.projects.length})
                    </h3>
                    {results.projects.map((project) => (
                      <button
                        key={project.slug}
                        onClick={() => handleNavigate(`/projects/${project.slug}`)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.slug}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Insights */}
                {results.insights.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Insights ({results.insights.length})
                    </h3>
                    {results.insights.map((insight) => (
                      <button
                        key={insight.id}
                        onClick={() => handleNavigate('/insights')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {insight.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs badge bg-blue-100 text-blue-800">
                            {insight.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {insight.projectSlug}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {results.actions.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Actions ({results.actions.length})
                    </h3>
                    {results.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleNavigate('/actions')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {action.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs badge bg-yellow-100 text-yellow-800">
                            {action.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {action.projectSlug}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">↑↓</kbd> Navigate
              </span>
              <span>
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">↵</kbd> Select
              </span>
              <span>
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">esc</kbd> Close
              </span>
            </div>
            <div>
              {totalResults} results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;

