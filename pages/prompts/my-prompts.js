import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import PromptCard from '../../components/PromptCard';
import Button from '../../components/Button';
import AdvancedSearch from '../../components/AdvancedSearch';
import { 
  ViewListIcon, 
  ViewGridIcon, 
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
  
  useEffect(() => {
    const fetchUserPrompts = async () => {
      if (status === 'loading' || !session) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's prompts
        // Make sure we have the user ID before making the request
        if (!session.user || !session.user.id) {
          console.error('User session is incomplete');
          setError('User authentication error. Please try signing in again.');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`/api/search?userId=${session.user.id}&sortBy=createdAt&sortDirection=desc`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch your prompts');
        }
        
        const data = await response.json();
        setUserPrompts(data);
        setFilteredPrompts(data);
        
        // Apply initial sort
        sortPrompts(data, sortBy);
        
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setError('Failed to load your prompts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPrompts();
  }, [session, status]);
  
  const handleSearch = async (searchParams) => {
    try {
      setIsLoading(true);
      // Add user ID to search params to only get current user's prompts
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("User session is incomplete");
      }
      
      const separator = searchParams ? '&' : '';
      const response = await fetch(`/api/search?${searchParams}${separator}userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setFilteredPrompts(data);
      
      // Apply current sort to new results
      sortPrompts(data, sortBy);
      
    } catch (error) {
      console.error('Error searching prompts:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (promptId) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      
      // Update both arrays
      const updatedPrompts = userPrompts.filter(p => p.id !== promptId);
      setUserPrompts(updatedPrompts);
      setFilteredPrompts(filteredPrompts.filter(p => p.id !== promptId));
      
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Prompts</h1>
          <Link href="/prompts/create">
            <Button variant="primary" className="mt-3 md:mt-0">
              <PlusIcon className="h-5 w-5 mr-1" />
              Create New Prompt
            </Button>
          </Link>
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
                <ViewGridIcon className="h-5 w-5" />
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
                <ViewListIcon className="h-5 w-5" />
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