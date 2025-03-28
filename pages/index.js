import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PromptCard from '../components/PromptCard';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';
import Link from 'next/link';
import { filterPromptsByTag, getUniqueTags } from '../lib/utils';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);
  
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/prompts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        
        const data = await response.json();
        setPrompts(data);
        setFilteredPrompts(data);
        setTags(getUniqueTags(data));
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setError('Failed to load prompts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrompts();
  }, []);
  
  const handleSearch = async (query) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setFilteredPrompts(data);
      // Reset tag selection
      setSelectedTag('');
    } catch (error) {
      console.error('Error searching prompts:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      // If clicking the already selected tag, clear the filter
      setSelectedTag('');
      setFilteredPrompts(prompts);
    } else {
      setSelectedTag(tag);
      setFilteredPrompts(filterPromptsByTag(prompts, tag));
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
      
      // Remove from both arrays
      const updatedPrompts = prompts.filter(p => p.id !== promptId);
      setPrompts(updatedPrompts);
      setFilteredPrompts(filteredPrompts.filter(p => p.id !== promptId));
      setTags(getUniqueTags(updatedPrompts));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };
  
  return (
    <Layout title="PromptPro - Home">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">AI Prompts</h1>
          <Link href="/prompts/create" className="mt-3 md:mt-0">
            <Button variant="primary">Create New Prompt</Button>
          </Link>
        </div>
        
        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
          <div className="md:w-2/3">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <div className="md:w-1/3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTag === tag
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No prompts found.</p>
                <Link href="/prompts/create" className="mt-4 inline-block text-primary-600 hover:underline">
                  Create your first prompt
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onDelete={handleDelete}
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
