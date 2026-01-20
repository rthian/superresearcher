import { useQuery } from '@tanstack/react-query';
import { suggestionsAPI } from '../api/suggestions';
import { FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

function SuggestionsBoard() {
  const { data, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => suggestionsAPI.list(),
  });

  const suggestions = data?.suggestions || [];

  if (isLoading) {
    return <div className="text-gray-500">Loading suggestions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Research Suggestions</h1>
        <p className="mt-2 text-gray-600">Crowdsource future research ideas</p>
      </div>

      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No suggestions yet</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="card">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <FiThumbsUp className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-900">{suggestion.votes}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{suggestion.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-blue-100 text-blue-800">{suggestion.studyType}</span>
                    <span className="badge bg-gray-100 text-gray-800">{suggestion.status}</span>
                    {suggestion.priority && (
                      <span className="badge bg-orange-100 text-orange-800">{suggestion.priority}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>By {suggestion.suggestedByName}</span>
                    {suggestion.comments?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FiMessageSquare className="w-4 h-4" />
                        {suggestion.comments.length} comments
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SuggestionsBoard;

