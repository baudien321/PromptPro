import Link from 'next/link';
import { truncateText } from '../../lib/utils';
import { 
  StarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/solid';

/**
 * Component to display top-performing prompts
 * 
 * @param {Object} props - Component props
 * @param {Array} props.prompts - Array of prompt data
 */
export default function TopPrompts({ prompts = [] }) {
  if (!prompts || prompts.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No prompts data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="hover:bg-gray-50">
            <Link href={`/prompts/${prompt.id}`}>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">{truncateText(prompt.title, 40)}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-primary-600" />
                      <span>{prompt.usageCount || 0}</span>
                    </div>
                    
                    {prompt.rating > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{prompt.rating}</span>
                      </div>
                    )}
                    
                    {prompt.isSuccess !== undefined && (
                      <div className="text-sm">
                        {prompt.isSuccess ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">{truncateText(prompt.description, 60)}</p>
                <div className="mt-2">
                  {prompt.tags && prompt.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1.5 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}