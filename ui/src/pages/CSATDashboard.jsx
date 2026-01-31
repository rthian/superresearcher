import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { csatAPI } from '../api/csat';
import { Link } from 'react-router-dom';
import { 
  FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiDownload, FiUpload,
  FiBarChart2, FiActivity
} from 'react-icons/fi';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';
import UploadModal from '../components/csat/UploadModal';

function CSATDashboard() {
  const [selectedOrg, setSelectedOrg] = useState('GXS');
  const [selectedPeriod, setSelectedPeriod] = useState('latest');
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'comparison'
  
  const { data: csatData, isLoading } = useQuery({
    queryKey: ['csat-metrics'],
    queryFn: () => csatAPI.getMetrics()
  });
  
  const { data: alerts } = useQuery({
    queryKey: ['csat-alerts', 'open'],
    queryFn: () => csatAPI.getAlerts({ status: 'open' })
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading CSAT metrics...</div>
      </div>
    );
  }
  
  const periods = csatData?.periods || [];
  const latestPeriod = periods[periods.length - 1];
  const scale = csatData?.scale || { min: 1, max: 10, type: '10-point' };
  
  // Get list of unique organizations from the data
  const organizations = Array.from(
    new Set(periods.flatMap(p => Object.keys(p.byOrganization || {})))
  );
  
  // Use first available org if selected org doesn't exist
  const activeOrg = organizations.includes(selectedOrg) ? selectedOrg : (organizations[0] || 'GXS');
  
  // Get selected organization's data
  const selectedOrgData = latestPeriod?.byOrganization?.[activeOrg] || {};
  
  const handleExport = async () => {
    try {
      const period = latestPeriod?.period;
      if (!period) {
        toast.error('No data to export');
        return;
      }
      
      const blob = await csatAPI.export(period, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `csat-scorecard-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Scorecard exported successfully');
    } catch (error) {
      toast.error('Failed to export scorecard');
    }
  };
  
  const prepareTrendData = (periods, organizations) => {
    return periods.slice(-8).map(p => {
      const dataPoint = { period: p.period };
      
      // Add data for each organization as separate series
      organizations.forEach(org => {
        dataPoint[`${org}_csat`] = p.byOrganization?.[org]?.csat?.score || null;
        dataPoint[`${org}_nps`] = p.byOrganization?.[org]?.nps?.score || null;
      });
      
      return dataPoint;
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSAT & NPS Tracking</h1>
          <p className="mt-2 text-gray-600">
            Customer satisfaction metrics - {csatData?.dataCollectionCadence || 'quarterly'} reporting
          </p>
          {csatData?.targetTransitionDate && (
            <p className="mt-1 text-sm text-gray-500">
              Transitioning to monthly reporting by {csatData.targetTransitionDate}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'individual' ? 'comparison' : 'individual')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FiBarChart2 className="w-4 h-4" />
            {viewMode === 'individual' ? 'Comparison View' : 'Individual View'}
          </button>
          
          <button
            onClick={() => setShowUpload(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Upload Data
          </button>
          
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2"
            disabled={!latestPeriod}
          >
            <FiDownload className="w-4 h-4" />
            Export Scorecard
          </button>
        </div>
      </div>
      
      {/* Organization Tabs - Only show in individual view */}
      {viewMode === 'individual' && organizations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 border-b border-gray-200 -mb-px">
            {organizations.map((org) => (
              <button
                key={org}
                onClick={() => setSelectedOrg(org)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeOrg === org
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                🏢 {org}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Alerts Banner */}
      {alerts?.alerts?.length > 0 && (
        <div className="card bg-red-50 border-red-200 border-l-4 border-l-red-600">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">
                {alerts.alerts.length} Active Alert{alerts.alerts.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700">
                {alerts.alerts[0].entity} {alerts.alerts[0].metric.toUpperCase()} 
                {' '}{alerts.alerts[0].type === 'threshold_breach' 
                  ? `dropped to ${alerts.alerts[0].currentValue}` 
                  : `decreased by ${alerts.alerts[0].change}`}
              </p>
            </div>
            <Link to="/csat/alerts" className="btn btn-sm bg-red-600 text-white hover:bg-red-700">
              View All
            </Link>
          </div>
        </div>
      )}
      
      {/* Organization-Specific Score Cards */}
      {viewMode === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSAT Card for Selected Organization */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Satisfaction (Bank CSAT)
                </h2>
                <p className="text-xs text-gray-500">
                  {activeOrg} - {scale.type} scale ({scale.min}-{scale.max})
                </p>
              </div>
              {selectedOrgData.csat?.qoqChange !== undefined && (
                selectedOrgData.csat.qoqChange >= 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      +{selectedOrgData.csat.qoqChange.toFixed(2)} QoQ
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <FiTrendingDown className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {selectedOrgData.csat.qoqChange.toFixed(2)} QoQ
                    </span>
                  </div>
                )
              )}
            </div>
            
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {selectedOrgData.csat?.score?.toFixed(2) || 'N/A'} 
              <span className="text-2xl text-gray-500">/ {scale.max}</span>
            </div>
            
            {selectedOrgData.csat?.yoyChange !== undefined && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <span className={selectedOrgData.csat.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {selectedOrgData.csat.yoyChange >= 0 ? '+' : ''}{selectedOrgData.csat.yoyChange.toFixed(2)} YoY
                </span>
                <span className="text-gray-600">(Year-over-Year)</span>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Total Responses:</span>
                  <span className="font-medium text-gray-900">
                    {selectedOrgData.csat?.responses?.toLocaleString() || '0'}
                  </span>
                </div>
                {latestPeriod && (
                  <div className="flex justify-between mt-1">
                    <span>Period:</span>
                    <span className="font-medium text-gray-900">{latestPeriod.period}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* NPS Card for Selected Organization */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Net Promoter Score (NPS)
                </h2>
                <p className="text-xs text-gray-500">{activeOrg} - Scale: -100 to +100</p>
              </div>
              {selectedOrgData.nps?.qoqChange !== undefined && (
                selectedOrgData.nps.qoqChange >= 0 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <FiTrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      +{selectedOrgData.nps.qoqChange} QoQ
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <FiTrendingDown className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {selectedOrgData.nps.qoqChange} QoQ
                    </span>
                  </div>
                )
              )}
            </div>
            
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {selectedOrgData.nps?.score !== undefined ? (
                <>
                  {selectedOrgData.nps.score >= 0 ? '+' : ''}{selectedOrgData.nps.score}
                </>
              ) : 'N/A'}
            </div>
            
            {selectedOrgData.nps?.yoyChange !== undefined && (
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className={selectedOrgData.nps.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {selectedOrgData.nps.yoyChange >= 0 ? '+' : ''}{selectedOrgData.nps.yoyChange} YoY
                </span>
                <span className="text-gray-600">(Year-over-Year)</span>
              </div>
            )}
            
            {selectedOrgData.nps && selectedOrgData.nps.promoters !== undefined && (
              <div className="space-y-1 mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs">
                  <span className="text-green-600 font-medium">Promoters (9-10)</span>
                  <span className="font-medium text-gray-900">{selectedOrgData.nps.promoters || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-yellow-600 font-medium">Passives (7-8)</span>
                  <span className="font-medium text-gray-900">{selectedOrgData.nps.passives || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-600 font-medium">Detractors (0-6)</span>
                  <span className="font-medium text-gray-900">{selectedOrgData.nps.detractors || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Comparison View - Show All Organizations Side by Side */}
      {viewMode === 'comparison' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Organization Comparison - {latestPeriod?.period}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organizations.map(org => {
              const orgData = latestPeriod?.byOrganization?.[org] || {};
              return (
                <div key={org} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-3 text-lg">🏢 {org}</div>
                  
                  {/* CSAT */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-1">Bank CSAT</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {orgData.csat?.score?.toFixed(2) || 'N/A'}
                      </span>
                      {orgData.csat?.qoqChange !== undefined && (
                        <span className={`text-sm font-medium ${orgData.csat.qoqChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {orgData.csat.qoqChange >= 0 ? '+' : ''}{orgData.csat.qoqChange.toFixed(2)} QoQ
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* NPS */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1">NPS</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {orgData.nps?.score !== undefined ? (
                          <>{orgData.nps.score >= 0 ? '+' : ''}{orgData.nps.score}</>
                        ) : 'N/A'}
                      </span>
                      {orgData.nps?.qoqChange !== undefined && (
                        <span className={`text-sm font-medium ${orgData.nps.qoqChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {orgData.nps.qoqChange >= 0 ? '+' : ''}{orgData.nps.qoqChange} QoQ
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-300 text-xs text-gray-500">
                    {orgData.csat?.responses?.toLocaleString() || '0'} responses
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Trend Charts - Multiple Lines per Organization */}
      {periods.length > 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {viewMode === 'individual' ? `${activeOrg} Performance Trends` : 'All Organizations - CSAT Trends'}
            </h2>
          </div>
          
          {viewMode === 'individual' ? (
            /* Individual bank trend chart */
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={periods.slice(-8).map(p => ({
                period: p.period,
                csat: p.byOrganization?.[activeOrg]?.csat?.score || null,
                nps: p.byOrganization?.[activeOrg]?.nps?.score || null
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  yAxisId="left" 
                  domain={[scale.min, scale.max]} 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'CSAT', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[-100, 100]} 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'NPS', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="csat" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name={`${activeOrg} CSAT`} 
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="nps" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name={`${activeOrg} NPS`} 
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            /* Comparison view with all banks */
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={prepareTrendData(periods, organizations)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  domain={[scale.min, scale.max]} 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'CSAT Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <Legend />
                {organizations.map((org, index) => {
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                  return (
                    <Line 
                      key={org}
                      type="monotone" 
                      dataKey={`${org}_csat`} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={2}
                      name={`${org} CSAT`} 
                      dot={{ fill: colors[index % colors.length], r: 4 }}
                      connectNulls
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
      
      {/* Organization Dimensions (only in individual view) */}
      {viewMode === 'individual' && selectedOrgData.dimensions && Object.keys(selectedOrgData.dimensions).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeOrg} - CSAT by Dimension
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dimension
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Survey Question
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(selectedOrgData.dimensions).map(([dimId, dimData]) => {
                  const dimension = csatData.dimensions?.find(d => d.id === dimId);
                  return (
                    <tr key={dimId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {dimension?.name || dimId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <span className={`font-bold ${
                          dimData.score >= 8.0 ? 'text-green-600' : 
                          dimData.score >= 7.0 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {dimData.score?.toFixed(2) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                        {dimData.responses?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {dimData.surveyQuestion || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* By Product */}
      {latestPeriod?.byProduct && Object.keys(latestPeriod.byProduct).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Product
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CSAT
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPS
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Project
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(latestPeriod.byProduct).map(([product, data]) => (
                  <tr key={product} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                      {product}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="badge bg-blue-100 text-blue-800">
                        {data.organization}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                      {data.csat?.score?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                      {data.nps?.score !== undefined ? (
                        <>{data.nps.score >= 0 ? '+' : ''}{data.nps.score}</>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-600">
                      {data.csat?.responses?.toLocaleString() || '0'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {data.linkedProject ? (
                        <Link 
                          to={`/projects/${data.linkedProject}`}
                          className="text-primary-600 hover:text-primary-800 hover:underline text-sm"
                        >
                          View Project
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {(!periods || periods.length === 0) && (
        <div className="card text-center py-12">
          <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CSAT Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Upload your first CSAT/NPS data file to start tracking customer satisfaction metrics.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="btn btn-primary mx-auto"
          >
            <FiUpload className="w-4 h-4 mr-2" />
            Upload Data
          </button>
        </div>
      )}
      
      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}

export default CSATDashboard;

