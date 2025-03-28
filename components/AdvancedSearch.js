import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, AdjustmentsHorizontalIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const AdvancedSearch = ({ onSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [filters, setFilters] = useState({
    aiPlatform: '',
    visibility: '',
    minRating: '',
    minUsageCount: '',
    minSuccessRate: '',
    sortBy: 'createdAt',
    sortDirection: 'desc',
    searchQuery: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct search parameters
    const searchParams = new URLSearchParams();
    
    if (filters.searchQuery.trim()) {
      searchParams.append('q', filters.searchQuery.trim());
    }
    
    if (filters.aiPlatform) {
      searchParams.append('aiPlatform', filters.aiPlatform);
    }
    
    if (filters.visibility) {
      searchParams.append('visibility', filters.visibility);
    }
    
    if (filters.minRating) {
      searchParams.append('minRating', filters.minRating);
    }
    
    if (filters.minUsageCount) {
      searchParams.append('minUsageCount', filters.minUsageCount);
    }
    
    if (filters.minSuccessRate) {
      searchParams.append('minSuccessRate', filters.minSuccessRate);
    }
    
    if (filters.tags.trim()) {
      searchParams.append('tags', filters.tags.trim());
      // Default to matching any tag
      searchParams.append('tagMatchType', 'any');
    }
    
    if (filters.sortBy) {
      searchParams.append('sortBy', filters.sortBy);
      
      if (filters.sortDirection) {
        searchParams.append('sortDirection', filters.sortDirection);
      }
    }
    
    onSearch(searchParams.toString());
  };

  const clearFilters = () => {
    setFilters({
      aiPlatform: '',
      visibility: '',
      minRating: '',
      minUsageCount: '',
      minSuccessRate: '',
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchQuery: '',
      tags: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleChange}
                placeholder="Search prompts..."
                className="w-full py-2 pl-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-4 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-expanded={isExpanded}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span className="sr-only">
                {isExpanded ? 'Hide advanced search' : 'Show advanced search'}
              </span>
            </button>
          </div>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="ml-4"
          >
            Search
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="aiPlatform" className="block text-sm font-medium text-gray-700 mb-1">
                  AI Platform
                </label>
                <select
                  id="aiPlatform"
                  name="aiPlatform"
                  value={filters.aiPlatform}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any Platform</option>
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Claude">Claude</option>
                  <option value="DALL-E">DALL-E</option>
                  <option value="MidJourney">MidJourney</option>
                  <option value="Stable Diffusion">Stable Diffusion</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={filters.visibility}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any Visibility</option>
                  <option value="public">Public</option>
                  <option value="private">Private (Your prompts)</option>
                  <option value="team">Team</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Rating
                </label>
                <select
                  id="minRating"
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={filters.tags}
                  onChange={handleChange}
                  placeholder="e.g. writing, coding, marketing"
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="text-sm text-primary-600 hover:text-primary-700 focus:outline-none"
                >
                  {showAdvancedOptions ? 'Hide advanced options' : 'Show advanced options'}
                </button>
              </div>
            </div>
            
            {showAdvancedOptions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <label htmlFor="minUsageCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Usage Count
                  </label>
                  <select
                    id="minUsageCount"
                    name="minUsageCount"
                    value={filters.minUsageCount}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Usage</option>
                    <option value="100">100+ Uses</option>
                    <option value="50">50+ Uses</option>
                    <option value="10">10+ Uses</option>
                    <option value="5">5+ Uses</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="minSuccessRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Success Rate
                  </label>
                  <select
                    id="minSuccessRate"
                    name="minSuccessRate"
                    value={filters.minSuccessRate}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Any Success Rate</option>
                    <option value="90">90%+</option>
                    <option value="80">80%+</option>
                    <option value="70">70%+</option>
                    <option value="60">60%+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="sortBy"
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleChange}
                      className="flex-grow rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="createdAt">Date Created</option>
                      <option value="updatedAt">Date Updated</option>
                      <option value="rating">Rating</option>
                      <option value="usageCount">Usage Count</option>
                      <option value="successRate">Success Rate</option>
                    </select>
                    
                    <select
                      id="sortDirection"
                      name="sortDirection"
                      value={filters.sortDirection}
                      onChange={handleChange}
                      className="w-20 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="desc">↓</option>
                      <option value="asc">↑</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={clearFilters}
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;