import { useState, useEffect } from 'react';
import { competitiveAPI } from '../api/competitive';

function CompetitiveIntel() {
  const [competitors, setCompetitors] = useState(null);
  const [features, setFeatures] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [releases, setReleases] = useState(null);
  const [perception, setPerception] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matrix');

  useEffect(() => {
    Promise.all([
      competitiveAPI.getCompetitors(),
      competitiveAPI.getFeatures(),
      competitiveAPI.getPricing(),
      competitiveAPI.getReleases(),
      competitiveAPI.getPerception(),
    ])
      .then(([comp, feat, price, rel, perc]) => {
        setCompetitors(comp);
        setFeatures(feat);
        setPricing(price);
        setReleases(rel);
        setPerception(perc);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading competitive data...</div>;

  const tabs = [
    { id: 'matrix', label: 'Feature Matrix' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'releases', label: 'Releases' },
    { id: 'perception', label: 'Perception' },
  ];

  const compList = competitors?.competitors || [];
  const allIds = ['gxs', 'gxb', ...compList.map((c) => c.id)];
  const uniqueIds = [...new Set(allIds)];
  const nameMap = { gxs: 'GXS', gxb: 'GXB' };
  compList.forEach((c) => { nameMap[c.id] = c.name; });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Competitive Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">
          {compList.length} competitors tracked across {competitors?.featureCategories?.length || 0} categories.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Feature matrix */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Feature</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                {uniqueIds.map((id) => (
                  <th key={id} className="px-3 py-3 text-center font-medium text-gray-500 whitespace-nowrap">
                    {nameMap[id] || id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(features?.features || []).map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-gray-500">{f.category}</td>
                  {uniqueIds.map((id) => {
                    const s = f.competitors?.[id]?.status;
                    return (
                      <td key={id} className="px-3 py-3 text-center">
                        {s === 'available' && <span className="inline-block w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs leading-5">Y</span>}
                        {s === 'not-available' && <span className="inline-block w-5 h-5 bg-red-100 text-red-700 rounded-full text-xs leading-5">N</span>}
                        {s === 'planned' && <span className="inline-block w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full text-xs leading-5">P</span>}
                        {(!s || s === 'unknown') && <span className="text-gray-300">?</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Competitor</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Product</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Previous</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Current</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Effective</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(pricing?.entries || []).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{nameMap[p.competitor] || p.competitor}</td>
                  <td className="px-6 py-3 text-gray-700">{p.product}</td>
                  <td className="px-6 py-3 text-gray-500">{p.previousValue || '--'}</td>
                  <td className="px-6 py-3 text-gray-900 font-medium">{p.newValue}</td>
                  <td className="px-6 py-3 text-gray-500">{p.effectiveDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Releases */}
      {activeTab === 'releases' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Competitor</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Feature</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(releases?.releases || []).slice().reverse().map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500">{r.date}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{nameMap[r.competitor] || r.competitor}</td>
                  <td className="px-6 py-3 text-gray-700">{r.feature}</td>
                  <td className="px-6 py-3 text-gray-500">{r.category}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      r.impact === 'High' ? 'bg-red-100 text-red-800' :
                      r.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {r.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Perception */}
      {activeTab === 'perception' && (
        <div className="space-y-4">
          {(perception?.entries || []).map((p) => (
            <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  p.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                  p.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {p.sentiment}
                </span>
                <span className="text-sm font-medium text-gray-900">{nameMap[p.competitor] || p.competitor}</span>
                <span className="text-sm text-gray-500">{p.period}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{p.theme}</h3>
              {p.summary && <p className="mt-1 text-sm text-gray-600">{p.summary}</p>}
              {p.sampleVerbatim && (
                <p className="mt-2 text-sm italic text-gray-500 border-l-2 border-gray-200 pl-3">
                  "{p.sampleVerbatim}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CompetitiveIntel;
