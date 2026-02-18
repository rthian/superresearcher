import { useState, useEffect } from 'react';
import { roiAPI } from '../api/roi';

function ROITracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roiAPI.getSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading ROI data...</div>;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ROI Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track the impact of implemented actions on CSAT and NPS metrics.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Tracked Actions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data?.totalTracked || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">CSAT Measured</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{data?.csatMeasured || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Avg CSAT Delta</p>
          <p className={`mt-1 text-3xl font-bold ${data?.avgCsatDelta > 0 ? 'text-green-600' : data?.avgCsatDelta < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {data?.avgCsatDelta != null ? (data.avgCsatDelta > 0 ? `+${data.avgCsatDelta}` : data.avgCsatDelta) : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Avg NPS Delta</p>
          <p className={`mt-1 text-3xl font-bold ${data?.avgNpsDelta > 0 ? 'text-green-600' : data?.avgNpsDelta < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {data?.avgNpsDelta != null ? (data.avgNpsDelta > 0 ? `+${data.avgNpsDelta}` : data.avgNpsDelta) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Tracked actions table */}
      {data?.trackedActions?.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tracked Actions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CSAT Delta</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">NPS Delta</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.trackedActions.map((t) => (
                  <tr key={`${t.actionId}-${t.project}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.actionTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.project}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        t.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                        t.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                        t.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.implementedPeriod}</td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${
                      t.metrics.csat.delta > 0 ? 'text-green-600' : t.metrics.csat.delta < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {t.metrics.csat.delta != null ? (t.metrics.csat.delta > 0 ? `+${t.metrics.csat.delta}` : t.metrics.csat.delta) : '--'}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-medium ${
                      t.metrics.nps.delta > 0 ? 'text-green-600' : t.metrics.nps.delta < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {t.metrics.nps.delta != null ? (t.metrics.nps.delta > 0 ? `+${t.metrics.nps.delta}` : t.metrics.nps.delta) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          <p>No actions tracked yet.</p>
          <p className="mt-2 text-sm">Use <code className="bg-gray-100 px-2 py-1 rounded">superresearcher roi track</code> to link implemented actions to metric periods.</p>
        </div>
      )}
    </div>
  );
}

export default ROITracker;
