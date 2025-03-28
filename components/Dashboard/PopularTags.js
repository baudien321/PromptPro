import Link from 'next/link';
import { HashtagIcon } from '@heroicons/react/24/outline';

/**
 * Component to display popular tags
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tags - Array of tag data with count
 */
export default function PopularTags({ tags = [] }) {
  if (!tags || tags.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No tags available</p>
      </div>
    );
  }

  // Calculate the max count for relative sizing
  const maxCount = Math.max(...tags.map(tag => tag.count));

  // Generate tag size based on count (relative to max)
  const getTagSize = (count) => {
    const ratio = count / maxCount;
    if (ratio > 0.8) return 'text-lg font-semibold';
    if (ratio > 0.5) return 'text-base font-medium';
    if (ratio > 0.3) return 'text-sm';
    return 'text-xs';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <HashtagIcon className="h-5 w-5 text-primary-500 mr-2" />
        <h3 className="text-sm font-medium text-gray-900">Popular Tags</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link 
            key={tag.tag} 
            href={`/search?tag=${encodeURIComponent(tag.tag)}`}
            className={`${getTagSize(tag.count)} px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors duration-200`}
          >
            {tag.tag} <span className="text-xs text-gray-500">({tag.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}