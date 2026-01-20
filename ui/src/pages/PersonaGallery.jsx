import { useQuery } from '@tanstack/react-query';
import { personasAPI } from '../api/personas';
import { FiUsers } from 'react-icons/fi';

function PersonaGallery() {
  const { data, isLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: () => personasAPI.list(),
  });

  const personas = data?.personas || [];

  if (isLoading) {
    return <div className="text-gray-500">Loading personas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Persona Gallery</h1>
        <p className="mt-2 text-gray-600">Customer personas based on research</p>
      </div>

      {personas.length === 0 ? (
        <div className="card text-center py-12">
          <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No personas yet</h3>
          <p className="text-gray-600">Personas will be created from insights</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona) => (
            <div key={persona.id} className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                  <span className="badge bg-purple-100 text-purple-800">{persona.type}</span>
                </div>
              </div>
              
              {persona.demographics && (
                <div className="space-y-2 text-sm">
                  {Object.entries(persona.demographics).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {persona.supportingInsights?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {persona.supportingInsights.length} supporting insights
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PersonaGallery;

