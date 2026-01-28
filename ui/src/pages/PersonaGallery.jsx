import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { personasAPI } from '../api/personas';
import { FiUsers, FiArrowRight } from 'react-icons/fi';

function PersonaGallery() {
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: () => personasAPI.list(),
  });

  const personas = data?.personas || [];

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

  if (isLoading) {
    return <div className="text-gray-500">Loading personas...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Persona Gallery</h1>
        <p className="mt-2 text-gray-600">Customer personas based on research insights</p>
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
            <div 
              key={persona.id} 
              className="card cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => navigate(`/personas/${persona.id}`)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <FiUsers className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {persona.name}
                  </h3>
                  <span className={`badge ${getTypeColor(persona.type)} text-xs`}>
                    {persona.type}
                  </span>
                </div>
              </div>
              
              {persona.tagline && (
                <p className="text-sm text-gray-600 italic mb-3 line-clamp-2">
                  "{persona.tagline}"
                </p>
              )}
              
              {persona.demographics && (
                <div className="space-y-2 text-sm mb-3">
                  {Object.entries(persona.demographics).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900 font-medium truncate ml-2">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {persona.supportingInsights?.length || 0} supporting insights
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PersonaGallery;

