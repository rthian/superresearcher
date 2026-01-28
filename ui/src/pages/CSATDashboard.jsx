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
  const [selectedPeriod, setSelectedPeriod] = useState('latest');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  
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
  const bankWide = latestPeriod?.bankWide || {};
  const scale = csatData?.scale || { min: 1, max: 10, type: '10-point' };
  
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
  
  const prepareTrendData = (periods) => {
    return periods.slice(-8).map(p => ({
      period: p.period,
      csat: p.bankWide?.csat?.score || null,
      nps: p.bankWide?.nps?.score || null
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CSAT & NPS Tracking</h1>
          <p className="mt-2 text-gray-600">
            Bank-wide customer satisfaction metrics - {csatData?.dataCollectionCadence || 'quarterly'} reporting
          </p>
          {csatData?.targetTransitionDate && (
            <p className="mt-1 text-sm text-gray-500">
              Transitioning to monthly reporting by {csatData.targetTransitionDate}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
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
      
      {/* Bank-Wide Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSAT Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Customer Satisfaction (Bank CSAT)
              </h2>
              <p className="text-xs text-gray-500">
                {scale.type} scale ({scale.min}-{scale.max})
              </p>
            </div>
            {bankWide.csat?.qoqChange !== undefined && (
              bankWide.csat.qoqChange >= 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <FiTrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    +{bankWide.csat.qoqChange.toFixed(2)} QoQ
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <FiTrendingDown className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {bankWide.csat.qoqChange.toFixed(2)} QoQ
                  </span>
                </div>
              )
            )}
          </div>
          
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {bankWide.csat?.score?.toFixed(2) || 'N/A'} 
            <span className="text-2xl text-gray-500">/ {scale.max}</span>
          </div>
          
          {bankWide.csat?.yoyChange !== undefined && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className={bankWide.csat.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {bankWide.csat.yoyChange >= 0 ? '+' : ''}{bankWide.csat.yoyChange.toFixed(2)} YoY
              </span>
              <span className="text-gray-600">(Year-over-Year)</span>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Responses:</span>
                <span className="font-medium text-gray-900">
                  {bankWide.csat?.responses?.toLocaleString() || '0'}
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
        
        {/* NPS Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Net Promoter Score (NPS)
              </h2>
              <p className="text-xs text-gray-500">Scale: -100 to +100</p>
            </div>
            {bankWide.nps?.qoqChange !== undefined && (
              bankWide.nps.qoqChange >= 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <FiTrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    +{bankWide.nps.qoqChange} QoQ
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <FiTrendingDown className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {bankWide.nps.qoqChange} QoQ
                  </span>
                </div>
              )
            )}
          </div>
          
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {bankWide.nps?.score !== undefined ? (
              <>
                {bankWide.nps.score >= 0 ? '+' : ''}{bankWide.nps.score}
              </>
            ) : 'N/A'}
          </div>
          
          {bankWide.nps?.yoyChange !== undefined && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className={bankWide.nps.yoyChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {bankWide.nps.yoyChange >= 0 ? '+' : ''}{bankWide.nps.yoyChange} YoY
              </span>
              <span className="text-gray-600">(Year-over-Year)</span>
            </div>
          )}
          
          {bankWide.nps && (
            <div className="space-y-1 mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">Promoters (9-10)</span>
                <span className="font-medium text-gray-900">{bankWide.nps.promoters || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600 font-medium">Passives (7-8)</span>
                <span className="font-medium text-gray-900">{bankWide.nps.passives || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600 font-medium">Detractors (0-6)</span>
                <span className="font-medium text-gray-900">{bankWide.nps.detractors || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Trend Charts */}
      {periods.length > 1 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Trends Over Time</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareTrendData(periods)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis 
                yAxisId="left" 
                domain={[scale.min, scale.max]} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[-100, 100]} 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
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
                name="CSAT" 
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="nps" 
                stroke="#10b981" 
                strokeWidth={2}
                name="NPS" 
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* By Organization */}
      {latestPeriod?.byOrganization && Object.keys(latestPeriod.byOrganization).length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Performance by Organization
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(latestPeriod.byOrganization).map(([org, data]) => (
              <div key={org} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-medium text-gray-900 mb-3 text-lg">{org}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bank CSAT:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">
                        {data.csat?.score?.toFixed(2) || 'N/A'}
                      </span>
                      {data.csat?.qoqChange !== undefined && (
                        <span className={`text-xs ${data.csat.qoqChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({data.csat.qoqChange >= 0 ? '+' : ''}{data.csat.qoqChange.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                  {data.nps && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">NPS:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {data.nps.score >= 0 ? '+' : ''}{data.nps.score}
                        </span>
                        {data.nps.qoqChange !== undefined && (
                          <span className={`text-xs ${data.nps.qoqChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({data.nps.qoqChange >= 0 ? '+' : ''}{data.nps.qoqChange})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-300 text-xs text-gray-500">
                    {data.csat?.responses?.toLocaleString() || '0'} responses
                  </div>
                </div>
              </div>
            ))}
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

