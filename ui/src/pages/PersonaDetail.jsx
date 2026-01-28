import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { personasAPI } from '../api/personas';
import { FiArrowLeft, FiUsers, FiTarget, FiFrown, FiHeart, FiAlertCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

function PersonaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['persona', id],
    queryFn: () => personasAPI.getById(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading persona details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <div className="text-gray-900 text-lg font-medium mb-2">Persona not found</div>
        <button
          onClick={() => navigate('/personas')}
          className="text-primary-600 hover:text-primary-700"
        >
          ← Back to Persona Gallery
        </button>
      </div>
    );
  }

  const persona = data?.persona;

  if (!persona) {
    return null;
  }

  // Helper function to get type badge color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-purple-100 text-purple-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get confidence color
  const getConfidenceColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/personas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Persona Gallery
        </button>

        <div className="card">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-10 h-10 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{persona.name}</h1>
                  {persona.tagline && (
                    <p className="text-lg text-gray-600 mt-2 italic">"{persona.tagline}"</p>
                  )}
                </div>
                
                <span className={`badge ${getTypeColor(persona.type)} text-sm px-3 py-1`}>
                  {persona.type}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-4 text-sm">
                {persona.prevalence && (
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      <span className="font-medium text-gray-900">Prevalence:</span> {persona.prevalence}
                    </span>
                  </div>
                )}
                
                {persona.confidenceLevel && (
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className={`w-4 h-4 ${getConfidenceColor(persona.confidenceLevel)}`} />
                    <span className="text-gray-600">
                      <span className="font-medium text-gray-900">Confidence:</span>{' '}
                      <span className={getConfidenceColor(persona.confidenceLevel)}>
                        {persona.confidenceLevel}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {persona.impactPotential && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-900">Impact Potential</div>
                      <div className="text-sm text-yellow-800 mt-1">{persona.impactPotential}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      {persona.demographics && Object.keys(persona.demographics).length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">👤 Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(persona.demographics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behaviors */}
      {persona.behaviors && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Behaviors</h2>
          <div className="space-y-6">
            {persona.behaviors.bankingHabits && persona.behaviors.bankingHabits.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Banking Habits</h3>
                <ul className="space-y-2">
                  {persona.behaviors.bankingHabits.map((habit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>{habit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {persona.behaviors.productUsage && persona.behaviors.productUsage.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Product Usage</h3>
                <ul className="space-y-2">
                  {persona.behaviors.productUsage.map((usage, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>{usage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {persona.behaviors.decisionDrivers && persona.behaviors.decisionDrivers.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Decision Drivers</h3>
                <ul className="space-y-2">
                  {persona.behaviors.decisionDrivers.map((driver, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary-500 mt-1">•</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goals & Motivations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals */}
        {persona.goals && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FiTarget className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Goals</h2>
            </div>
            <div className="space-y-4">
              {persona.goals.primary && persona.goals.primary.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Primary Goals</h3>
                  <ul className="space-y-2">
                    {persona.goals.primary.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {persona.goals.secondary && persona.goals.secondary.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Secondary Goals</h3>
                  <ul className="space-y-2">
                    {persona.goals.secondary.map((goal, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 mt-1">○</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Motivations */}
        {persona.motivations && persona.motivations.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FiHeart className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-900">Motivations</h2>
            </div>
            <ul className="space-y-2">
              {persona.motivations.map((motivation, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-pink-500 mt-1">♥</span>
                  <span>{motivation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Pain Points & Frustrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        {persona.painPoints && (
          <div className="card border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-4">
              <FiFrown className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">Pain Points</h2>
            </div>
            <div className="space-y-4">
              {persona.painPoints.current && persona.painPoints.current.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Current Issues</h3>
                  <ul className="space-y-2">
                    {persona.painPoints.current.map((pain, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-1">✗</span>
                        <span>{pain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {persona.painPoints.quoted && persona.painPoints.quoted.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">Direct Quotes</h3>
                  <div className="space-y-2">
                    {persona.painPoints.quoted.map((quote, index) => (
                      <blockquote key={index} className="border-l-2 border-red-300 pl-3 py-1 text-sm text-gray-700 italic bg-red-50 rounded">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Frustrations */}
        {persona.frustrations && persona.frustrations.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FiAlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Frustrations</h2>
            </div>
            <ul className="space-y-2">
              {persona.frustrations.map((frustration, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-500 mt-1">⚠</span>
                  <span>{frustration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Needs from Product */}
      {persona.needsFromProduct && persona.needsFromProduct.length > 0 && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Needs from Product</h2>
          <ul className="space-y-3">
            {persona.needsFromProduct.map((need, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <span className="text-blue-600 font-bold mt-0.5">{index + 1}.</span>
                <span className="text-gray-900">{need}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Strategy */}
      {persona.recommendedStrategy && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Recommended Strategy</h2>
          <p className="text-gray-900 leading-relaxed">{persona.recommendedStrategy}</p>
        </div>
      )}

      {/* Supporting Insights */}
      {persona.supportingInsights && persona.supportingInsights.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Supporting Insights ({persona.supportingInsights.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {persona.supportingInsights.map((insightId) => (
              <Link
                key={insightId}
                to={`/insights`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition-colors"
              >
                {insightId}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Click to view related insights in the Insights Explorer
          </p>
        </div>
      )}
    </div>
  );
}

export default PersonaDetail;

