import React, { useState, useEffect } from 'react';

const TagSuggestions = ({ onSelectTag }) => {
  const [popularTags, setPopularTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch popular tags');
        }
        
        const data = await response.json();
        // Sort by count and take top 10
        const sortedTags = data
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
          .map(tag => tag.name);
        
        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Error fetching popular tags:', error);
        setError('Failed to load tag suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularTags();
  }, []);

  if (isLoading) {
    return (
      <div className="mt-2">
        <p className="text-xs text-gray-500">Loading suggestions...</p>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  if (popularTags.length === 0) {
    return null; // Don't show anything if there are no tags
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
      <div className="flex flex-wrap gap-1">
        {popularTags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagSuggestions;