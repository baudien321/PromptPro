import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import PromptCard from '../../components/PromptCard';
import Button from '../../components/Button';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import Link from 'next/link';

export default function CollectionDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [collection, setCollection] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/collections/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Collection not found');
          }
          throw new Error('Failed to fetch collection');
        }
        
        const data = await response.json();
        setCollection(data);
        
        // Fetch all prompts in this collection
        if (data.prompts && data.prompts.length > 0) {
          const promptsData = await Promise.all(
            data.prompts.map(promptId => 
              fetch(`/api/prompts/${promptId}`)
                .then(res => res.ok ? res.json() : null)
            )
          );
          
          setPrompts(promptsData.filter(p => p !== null));
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [id]);
  
  const handleDeleteCollection = async () => {
    if (!collection) return;
    
    if (window.confirm('Are you sure you want to delete this collection? This will not delete the prompts inside.')) {
      try {
        const response = await fetch(`/api/collections/${collection.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete collection');
        }
        
        router.push('/collections');
      } catch (error) {
        console.error('Error deleting collection:', error);
        alert('Failed to delete collection. Please try again.');
      }
    }
  };
  
  const handleRemovePrompt = async (promptId) => {
    if (!collection) return;
    
    if (window.confirm('Remove this prompt from the collection?')) {
      try {
        // Call API to remove prompt from collection
        const response = await fetch(`/api/collections/${collection.id}/prompts/${promptId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove prompt from collection');
        }
        
        // Update local state
        setPrompts(prompts.filter(p => p.id !== promptId));
        
        // Update collection's prompts array
        setCollection({
          ...collection,
          prompts: collection.prompts.filter(p => p !== promptId)
        });
      } catch (error) {
        console.error('Error removing prompt from collection:', error);
        alert('Failed to remove prompt. Please try again.');
      }
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Loading Collection - PromptPro">
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Error - PromptPro">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-800">Error</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push('/collections')}
          >
            Return to Collections
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (!collection) {
    return null;
  }
  
  return (
    <Layout title={`${collection.name} - PromptPro`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="secondary"
            onClick={() => router.push('/collections')}
          >
            Back to Collections
          </Button>
          
          <div className="flex space-x-2">
            <Link href={`/collections/edit/${collection.id}`}>
              <a>
                <Button variant="secondary">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </a>
            </Link>
            
            <Button
              variant="danger"
              onClick={handleDeleteCollection}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{collection.name}</h1>
          
          {collection.description && (
            <p className="text-gray-700 mb-4">{collection.description}</p>
          )}
          
          <p className="text-sm text-gray-500">
            {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'} in this collection
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Prompts</h2>
          
          <Link href="/">
            <a>
              <Button variant="primary">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Prompt
              </Button>
            </a>
          </Link>
        </div>
        
        {prompts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No prompts in this collection yet.</p>
            <Link href="/">
              <a>
                <Button variant="primary">
                  Browse Prompts to Add
                </Button>
              </a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onDelete={() => handleRemovePrompt(prompt.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
