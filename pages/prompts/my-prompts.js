import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import PromptCard from '../../components/PromptCard';
import Button from '../../components/Button';
import AdvancedSearch from '../../components/AdvancedSearch';
import { 
  Bars4Icon, 
  Squares2X2Icon, 
  AdjustmentsHorizontalIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function MyPrompts() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [userPrompts, setUserPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'rating', 'usage'
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Refactored reloadPrompts
  const reloadPrompts = async (searchCriteria = {}) => { // Accept search criteria
    if (status === 'loading' || !session?.user?.id) return;

    console.log('Fetching prompts with criteria:', searchCriteria);
    setIsLoading(true);
    setError(null);

    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('userId', session.user.id); // Always filter by current user on this page

      // Add search criteria if provided
      if (searchCriteria.query) params.append('q', searchCriteria.query); // Assuming API supports 'q' for text search
      if (searchCriteria.tags && searchCriteria.tags.length > 0) {
         searchCriteria.tags.forEach(tag => params.append('tags', tag));
      }
       if (searchCriteria.aiPlatform) params.append('aiPlatform', searchCriteria.aiPlatform);
      // Add other filters from searchCriteria if needed (e.g., visibility - though maybe fixed on this page?)

      const queryString = params.toString();
      const timestamp = new Date().getTime(); // Cache busting

      const response = await fetch(`/api/prompts?${queryString}&t=${timestamp}`, { // Use main endpoint
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        credentials: 'include'
      });

      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch your prompts');
      }

      const data = await response.json();
      setUserPrompts(data); // Keep original full list if needed? Maybe not.
      setFilteredPrompts(data);
      sortPrompts(data, sortBy); // Apply sort to fetched data

    } catch (error) {
      console.error('Error reloading prompts:', error);
      setError('Failed to reload your prompts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to load initial prompts (no search criteria)
  useEffect(() => {
     reloadPrompts();
  }, [session, status]); // Reload on session change

  // useEffect for refresh query param (calls reloadPrompts with no criteria)
  useEffect(() => {
    if (router.query.refresh) {
      setSuccessMessage('Prompt successfully saved!');
      reloadPrompts();
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [router.query.refresh]);

  // Refactored handleSearch (now just calls reloadPrompts with criteria)
  const handleSearch = (searchCriteria) => {
      console.log("Handling search with criteria:", searchCriteria);
      reloadPrompts(searchCriteria); // Pass search criteria to the main fetch function
  };
  
  const handleDelete = async (promptId) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      
      // Update both arrays
      const updatedPrompts = userPrompts.filter(p => p.id !== promptId);
      setUserPrompts(updatedPrompts);
      setFilteredPrompts(filteredPrompts.filter(p => p.id !== promptId));
      
      // Show success message
      setSuccessMessage('Prompt successfully deleted!');
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };
  
  const sortPrompts = (prompts, sortOption) => {
    const promptsCopy = [...prompts];
    
    switch (sortOption) {
      case 'newest':
        promptsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        promptsCopy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'rating':
        promptsCopy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'usage':
        promptsCopy.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      default:
        // Default to newest first
        promptsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredPrompts(promptsCopy);
    setSortBy(sortOption);
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <Layout title="PromptPro - My Prompts">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="PromptPro - My Prompts">
      <div className="space-y-6">
        {successMessage && (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Prompts</h1>
          <div className="flex space-x-2 mt-3 md:mt-0">
            <button 
              onClick={reloadPrompts}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link href="/prompts/create">
              <Button variant="primary" className="mt-0">
                <PlusIcon className="h-5 w-5 mr-1" />
                Create New Prompt
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">View:</span>
            <div className="flex rounded-md shadow-sm border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-l-md ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700 border-r border-gray-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-300'
                }`}
                aria-label="Grid View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-r-md ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                aria-label="List View"
              >
                <Bars4Icon className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`ml-3 px-3 py-2 rounded-md border ${
                showFilters
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
              aria-label="Filter Prompts"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center self-stretch sm:self-auto">
            <span className="text-gray-700 mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => sortPrompts(filteredPrompts, e.target.value)}
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Highest Rated</option>
              <option value="usage">Most Used</option>
            </select>
          </div>
        </div>
        
        {showFilters && (
          <div className="mb-6">
            <AdvancedSearch onSearch={handleSearch} />
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {filteredPrompts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">You haven't created any prompts yet</h2>
            <p className="text-gray-600 mb-6">
              Start creating and organizing your AI prompts to get the most out of different AI platforms.
            </p>
            <Link href="/prompts/create">
              <Button variant="primary">Create Your First Prompt</Button>
            </Link>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          }>
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className={viewMode === 'list' ? 'bg-white rounded-lg shadow overflow-hidden' : ''}>
                <PromptCard
                  prompt={prompt}
                  onDelete={handleDelete}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}