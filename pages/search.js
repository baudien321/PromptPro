import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import PromptCard from '../components/PromptCard';
import AdvancedSearch from '../components/AdvancedSearch';
import Button from '../components/Button';
import { 
  FunnelIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

export default function Search() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);
  
  // Parse URL query parameters on initial load and when router changes
  useEffect(() => {
    if (!router.isReady) return;
    
    const { 
      q, // search query
      tag, // specific tag search
      platform, // platform filter
      visibility, // visibility filter 
      rating, // rating filter
      sort, // sort option
      order // sort order
    } = router.query;
    
    // Build search params from URL
    const params = new URLSearchParams();
    
    if (q) params.append('q', q);
    if (tag) params.append('tags', tag);
    if (platform) params.append('aiPlatform', platform);
    if (visibility) params.append('visibility', visibility);
    if (rating) params.append('minRating', rating);
    if (sort) params.append('sortBy', sort);
    if (order) params.append('sortDirection', order);
    
    // Execute search if any params exist
    if (params.toString()) {
      performSearch(params.toString());
      
      // Set active filters for display
      const filtersList = [];
      if (q) filtersList.push({ name: 'Query', value: q });
      if (tag) filtersList.push({ name: 'Tag', value: tag });
      if (platform) filtersList.push({ name: 'Platform', value: platform });
      if (visibility) filtersList.push({ name: 'Visibility', value: visibility });
      if (rating) filtersList.push({ name: 'Min Rating', value: `${rating}+ stars` });
      
      setActiveFilters(filtersList);
    } else {
      // No search parameters, just show recent or popular prompts
      fetchRecentPrompts();
    }
  }, [router.isReady, router.query]);
  
  const fetchRecentPrompts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch recent public prompts
      const response = await fetch('/api/prompts?visibility=public&limit=12&sortBy=createdAt&sortDirection=desc');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent prompts');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setResultsCount(data.length);
      
    } catch (error) {
      console.error('Error fetching recent prompts:', error);
      setError('Failed to load recent prompts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const performSearch = async (searchParams) => {
    try {
      setIsSearching(true);
      setIsLoading(true);
      
      const response = await fetch(`/api/search?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data);
      setResultsCount(data.length);
      
    } catch (error) {
      console.error('Error searching prompts:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  const handleSearch = (searchParams) => {
    // Convert to query parameters for URL
    const params = new URLSearchParams(searchParams);
    
    // Update URL with search parameters (this will trigger the useEffect)
    const queryObj = {};
    params.forEach((value, key) => {
      queryObj[key] = value;
    });
    
    router.push({
      pathname: '/search',
      query: queryObj
    }, undefined, { shallow: true });
  };
  
  const removeFilter = (filterName) => {
    const newQuery = { ...router.query };
    
    // Map filter display name back to query parameter
    const filterMap = {
      'Query': 'q',
      'Tag': 'tags',
      'Platform': 'aiPlatform',
      'Visibility': 'visibility',
      'Min Rating': 'minRating'
    };
    
    const queryParam = filterMap[filterName];
    if (queryParam && newQuery[queryParam]) {
      delete newQuery[queryParam];
      
      router.push({
        pathname: '/search',
        query: newQuery
      }, undefined, { shallow: true });
    }
  };
  
  const clearAllFilters = () => {
    router.push('/search', undefined, { shallow: true });
  };
  
  return (
    <Layout title="PromptPro - Search Prompts">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {router.query.q ? `Search: "${router.query.q}"` : 'Search Prompts'}
          </h1>
          
          <div className="mt-3 sm:mt-0">
            <Button 
              variant="secondary" 
              className="flex items-center" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="h-5 w-5 mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6">
            <AdvancedSearch onSearch={handleSearch} />
          </div>
        )}
        
        {activeFilters.length > 0 && (
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                
                {activeFilters.map((filter, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {filter.name}: {filter.value}
                    <button 
                      type="button"
                      className="ml-1.5 text-primary-800 hover:text-primary-900 focus:outline-none"
                      onClick={() => removeFilter(filter.name)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 ml-auto"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16">
            <ArrowPathIcon className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {resultsCount} {resultsCount === 1 ? 'result' : 'results'} found
                {!router.query.q && activeFilters.length === 0 && ' (showing recent prompts)'}
              </p>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No prompts found</h2>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse our recent prompts.
                </p>
                <Button variant="primary" onClick={clearAllFilters}>
                  View All Prompts
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((prompt) => (
                  <PromptCard 
                    key={prompt.id} 
                    prompt={prompt} 
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}