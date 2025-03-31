import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/Layout';
import PromptEditor from '../../../components/PromptEditor';

export default function EditPrompt() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [prompt, setPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Prompt not found');
          }
          throw new Error('Failed to fetch prompt details');
        }
        
        const data = await response.json();
        console.log('Fetched prompt for editing:', data);
        
        // Check if the user is the owner of this prompt
        if (session?.user?.id !== data.userId) {
          setUnauthorized(true);
          return;
        }
        
        setPrompt(data);
        
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError(error.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchPrompt();
    }
  }, [id, session]);
  
  const handleSubmit = async (promptData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update prompt');
      }
      
      const updatedPrompt = await response.json();
      // Use window.location for a full page reload
      window.location.href = '/prompts/my-prompts?refresh=' + new Date().getTime();
      
    } catch (error) {
      console.error('Error updating prompt:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (status === 'loading' || isLoading) {
    return (
      <Layout title="PromptPro - Edit Prompt">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (unauthorized) {
    return (
      <Layout title="PromptPro - Unauthorized">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <h1 className="text-xl font-semibold text-red-800">Unauthorized</h1>
            <p className="mt-2 text-red-700">
              You don't have permission to edit this prompt.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !prompt) {
    return (
      <Layout title="PromptPro - Error">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <h1 className="text-xl font-semibold text-red-800">Error</h1>
            <p className="mt-2 text-red-700">{error || 'Failed to load prompt'}</p>
            <div className="mt-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`PromptPro - Edit Prompt`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Prompt</h1>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800">
            {error}
          </div>
        )}
        
        <PromptEditor 
          existingPrompt={prompt} 
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </Layout>
  );
}