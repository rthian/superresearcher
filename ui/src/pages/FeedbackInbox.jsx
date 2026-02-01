import { useQuery } from '@tanstack/react-query';
import { feedbackAPI } from '../api/feedback';
import { formatRelativeTime } from '../utils/helpers';

function FeedbackInbox() {
  const { data, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => feedbackAPI.list(),
  });

  const feedbackItems = data?.feedbackItems || [];

  if (isLoading) {
    return <div className="text-gray-500">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback Inbox</h1>
        <p className="mt-2 text-gray-600">Manage feedback and quality issues</p>
      </div>

      <div className="space-y-4">
        {feedbackItems.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No feedback items yet</p>
          </div>
        ) : (
          feedbackItems.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <span className={`badge ${
                  item.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'addressed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>By {item.authorName}</span>
                <span>{formatRelativeTime(item.createdAt)}</span>
                <span className="badge bg-blue-100 text-blue-800">{item.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FeedbackInbox;

