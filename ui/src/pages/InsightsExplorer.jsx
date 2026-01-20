import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsAPI } from '../api/insights';
import { FiDownload } from 'react-icons/fi';
import { exportInsights, exportToJSON } from '../utils/export';
import { CATEGORY_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

function InsightsExplorer() {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['insights-all'],
    queryFn: () => insightsAPI.listAll(),
  });

  const insights = data?.insights || [];

  // Apply filters
  let filteredInsights = insights;
  
  if (filterCategory !== 'all') {
    filteredInsights = filteredInsights.filter(i => i.category === filterCategory);
  }
  
  if (searchTerm) {
    filteredInsights = filteredInsights.filter(i =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.evidence?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const categories = ['all', ...new Set(insights.map(i => i.category))];

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
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="card hover:shadow-md transition-shadow">
            <div className="mb-3">
              <h3 className="font-medium text-gray-900 mb-2">{insight.title}</h3>
              <div className="flex flex-wrap gap-2">
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
    </div>
  );
}

export default InsightsExplorer;
