import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { insightsAPI } from '../api/insights';
import { actionsAPI } from '../api/actions';
import { personasAPI } from '../api/personas';
import { FiDownload } from 'react-icons/fi';
import { exportInsights, exportToJSON } from '../utils/export';
import { CATEGORY_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';
import InsightDetailModal from '../components/insights/InsightDetailModal';

function InsightsExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || 'all');
  const [filterImpact, setFilterImpact] = useState(searchParams.get('impact') || 'all');
  const [filterProject, setFilterProject] = useState(searchParams.get('project') || 'all');
  const [filterOrganization, setFilterOrganization] = useState(searchParams.get('org') || 'all');
  const [filterInsightIds, setFilterInsightIds] = useState(
    searchParams.get('ids') ? searchParams.get('ids').split(',') : []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights-all'],
    queryFn: () => insightsAPI.listAll(),
  });

  const { data: allActions } = useQuery({
    queryKey: ['actions-all'],
    queryFn: () => actionsAPI.listAll(),
  });

  const { data: allPersonas } = useQuery({
    queryKey: ['personas-all'],
    queryFn: () => personasAPI.listAll(),
  });

  const insights = data?.insights || [];

  // Calculate related items when insight is selected
  const relatedActions = selectedInsight 
    ? (allActions?.actions || []).filter(a => a.sourceInsight === selectedInsight.id)
    : [];

  const relatedPersonas = selectedInsight
    ? (allPersonas?.personas || []).filter(p => 
        p.supportingInsights?.includes(selectedInsight.id)
      )
    : [];

  const actionSourceInsight = selectedAction && allActions?.actions
    ? insights.find(i => i.id === selectedAction.sourceInsight)
    : null;

  const actionRelatedPersonas = selectedAction && actionSourceInsight
    ? (allPersonas?.personas || []).filter(p => 
        p.supportingInsights?.includes(actionSourceInsight.id)
      )
    : [];

  const handleViewAction = (action) => {
    // Add current insight to history before switching
    if (selectedInsight) {
      setNavigationHistory([...navigationHistory, { type: 'insight', title: selectedInsight.title, id: selectedInsight.id }]);
    }
    setSelectedInsight(null);
    setSelectedAction(action);
  };

  const handleViewInsight = (insight) => {
    // Add current action to history before switching
    if (selectedAction) {
      setNavigationHistory([...navigationHistory, { type: 'action', title: selectedAction.title, id: selectedAction.id }]);
    }
    setSelectedAction(null);
    setSelectedInsight(insight);
  };

  const handleCloseModal = () => {
    setSelectedInsight(null);
    setSelectedAction(null);
    setNavigationHistory([]);
  };

  // Keyboard navigation for insights
  useEffect(() => {
    if (!selectedInsight || selectedAction) return;

    const handleKeyNav = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentIndex = filteredInsights.findIndex(i => i.id === selectedInsight.id);
        if (currentIndex === -1) return;

        let nextIndex;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % filteredInsights.length;
        } else {
          nextIndex = (currentIndex - 1 + filteredInsights.length) % filteredInsights.length;
        }

        setSelectedInsight(filteredInsights[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [selectedInsight, selectedAction, filteredInsights]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCategory !== 'all') params.set('category', filterCategory);
    if (filterImpact !== 'all') params.set('impact', filterImpact);
    if (filterProject !== 'all') params.set('project', filterProject);
    if (filterOrganization !== 'all') params.set('org', filterOrganization);
    if (filterInsightIds.length > 0) params.set('ids', filterInsightIds.join(','));
    setSearchParams(params, { replace: true });
  }, [filterCategory, filterImpact, filterProject, filterOrganization, filterInsightIds, setSearchParams]);

  // Apply filters
  let filteredInsights = [...insights];
  
  // Filter by specific insight IDs if provided (from persona page)
  if (filterInsightIds.length > 0) {
    filteredInsights = filteredInsights.filter(i => filterInsightIds.includes(i.id));
  }
  
  // Filter by category
  if (filterCategory !== 'all') {
    filteredInsights = filteredInsights.filter(i => i.category === filterCategory);
  }
  
  // Filter by impact level
  if (filterImpact !== 'all') {
    filteredInsights = filteredInsights.filter(i => i.impactLevel === filterImpact);
  }
  
  // Filter by project
  if (filterProject !== 'all') {
    filteredInsights = filteredInsights.filter(i => i.projectSlug === filterProject);
  }
  
  // Filter by organization
  if (filterOrganization !== 'all') {
    filteredInsights = filteredInsights.filter(i => i.organization === filterOrganization);
  }
  
  // Filter by search term
  if (searchTerm) {
    filteredInsights = filteredInsights.filter(i =>
      i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.evidence?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.recommendedActions?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Get unique values for filters
  const categories = ['all', ...new Set(insights.map(i => i.category).filter(Boolean))];
  const impactLevels = ['all', ...new Set(insights.map(i => i.impactLevel).filter(Boolean))];
  const projects = ['all', ...new Set(insights.map(i => i.projectSlug).filter(Boolean))];
  const organizations = ['all', ...new Set(insights.map(i => i.organization).filter(Boolean))];

  const handleExport = (format) => {
    if (filteredInsights.length === 0) {
      toast.error('No insights to export');
      return;
    }

    const filename = `insights-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      exportInsights(filteredInsights, `${filename}.csv`);
      toast.success('Insights exported to CSV');
    } else {
      exportToJSON(filteredInsights, `${filename}.json`);
      toast.success('Insights exported to JSON');
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading insights...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Insights Explorer</h1>
          <p className="mt-2 text-gray-600">{filteredInsights.length} insights found</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiDownload className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search insights by title or evidence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        {/* Active Filters Summary */}
        {(filterCategory !== 'all' || filterImpact !== 'all' || filterProject !== 'all' || filterOrganization !== 'all' || filterInsightIds.length > 0) && (
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filterOrganization !== 'all' && (
              <span className="badge bg-blue-100 text-blue-700 font-semibold">
                🏢 {filterOrganization}
                <button
                  onClick={() => setFilterOrganization('all')}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="badge bg-primary-100 text-primary-700">
                Category: {filterCategory}
                <button
                  onClick={() => setFilterCategory('all')}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterImpact !== 'all' && (
              <span className="badge bg-primary-100 text-primary-700">
                Impact: {filterImpact}
                <button
                  onClick={() => setFilterImpact('all')}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterProject !== 'all' && (
              <span className="badge bg-primary-100 text-primary-700">
                Project: {filterProject}
                <button
                  onClick={() => setFilterProject('all')}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterInsightIds.length > 0 && (
              <span className="badge bg-primary-100 text-primary-700">
                {filterInsightIds.length} specific insights
                <button
                  onClick={() => setFilterInsightIds([])}
                  className="ml-1 hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterImpact('all');
                setFilterProject('all');
                setFilterOrganization('all');
                setFilterInsightIds([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

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

        {/* Category Filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Impact Level Filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Impact Level</h3>
          <div className="flex flex-wrap gap-2">
            {impactLevels.map((level) => (
              <button
                key={level}
                onClick={() => setFilterImpact(level)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterImpact === level
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Project Filter */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Project</h3>
          <div className="flex flex-wrap gap-2">
            {projects.map((proj) => (
              <button
                key={proj}
                onClick={() => setFilterProject(proj)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterProject === proj
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {proj === 'all' ? 'All Projects' : proj}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInsights.map((insight) => (
          <div 
            key={insight.id} 
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
              <div className="flex flex-wrap gap-2">
                {insight.organization && (
                  <span className="badge bg-blue-100 text-blue-800 font-semibold">
                    🏢 {insight.organization}
                  </span>
                )}
                <span className={`badge ${CATEGORY_COLORS[insight.category] || 'bg-gray-100 text-gray-800'}`}>
                  {insight.category}
                </span>
                <span className={`badge ${
                  insight.impactLevel === 'High' ? 'bg-red-100 text-red-800' :
                  insight.impactLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insight.impactLevel} Impact
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {insight.evidence}
            </p>
            
            <div className="text-xs text-gray-500">
              From: <span className="font-medium">{insight.projectSlug}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <InsightDetailModal
          insight={selectedInsight}
          relatedActions={relatedActions}
          relatedPersonas={relatedPersonas}
          onClose={handleCloseModal}
          onViewAction={handleViewAction}
          navigationHistory={navigationHistory}
        />
      )}
    </div>
  );
}

export default InsightsExplorer;
